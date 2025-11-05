/**
 * 搜索表单组件（企业级设计）
 *
 * 用途：
 * 1. 列表页的搜索栏
 * 2. 支持展开/收起（超过指定数量自动折叠，带流畅动画）
 * 3. 响应式布局（桌面3列，平板2列，移动端1列）
 * 4. 支持导出按钮、刷新按钮
 * 5. 参考 ProComponents QueryFilter 实现，增强动画和交互
 *
 * 行为说明：
 * - **搜索**: 相同条件重复搜索不会触发请求（TanStack Query缓存机制）
 * - **重置**: 自动触发搜索，使用initialValues或空对象作为查询条件
 *          （如果提供了onReset回调，则由页面自己决定是否触发搜索）
 * - **刷新**: 强制刷新数据，忽略缓存（调用TanStack Query的refetch方法）
 *
 * @example
 * // 基础用法
 * <SearchForm onSearch={handleSearch}>
 *   <Form.Item name="username" label="用户名">
 *     <Input placeholder="请输入" allowClear />
 *   </Form.Item>
 *   <Form.Item name="email" label="邮箱">
 *     <Input placeholder="请输入" allowClear />
 *   </Form.Item>
 * </SearchForm>
 *
 * @example
 * // 带刷新按钮的用法（配合TanStack Query）
 * function UserListPage() {
 *   const [params, setParams] = useState({});
 *   const { data, refetch } = useUsers(params);
 *
 *   return (
 *     <>
 *       <SearchForm
 *         onSearch={setParams}
 *         showRefresh
 *         onRefresh={() => refetch()}
 *       >
 *         <Form.Item name="username" label="用户名">
 *           <Input />
 *         </Form.Item>
 *       </SearchForm>
 *       <Table dataSource={data} />
 *     </>
 *   );
 * }
 *
 * @example
 * // 完整功能示例（展开/收起 + 导出 + 刷新）
 * <SearchForm
 *   defaultCollapseCount={3}
 *   defaultExpanded={false}
 *   showRefresh
 *   onRefresh={handleRefresh}
 *   showExport
 *   onExport={handleExport}
 *   onSearch={handleSearch}
 * >
 *   {/* 基础搜索项（前3个，始终可见） *\/}
 *   <Form.Item name="username" label="用户名">
 *     <Input />
 *   </Form.Item>
 *   <Form.Item name="email" label="邮箱">
 *     <Input />
 *   </Form.Item>
 *   <Form.Item name="status" label="状态">
 *     <Select>...</Select>
 *   </Form.Item>
 *
 *   {/* 高级搜索项（第4个及以后，默认折叠） *\/}
 *   <Form.Item name="phone" label="手机号">
 *     <Input />
 *   </Form.Item>
 *   <Form.Item name="department" label="部门">
 *     <Input />
 *   </Form.Item>
 * </SearchForm>
 */
import { useState, type ReactNode } from 'react';
import { Form, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, ExportOutlined, SyncOutlined } from '@ant-design/icons';
import type { FormInstance, ColProps } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface SearchFormProps {
  /** 表单实例 */
  form?: FormInstance;
  /** 子元素（Form.Item） */
  children: ReactNode;
  /** 搜索回调 */
  onSearch: (values: Record<string, unknown>) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 初始值 */
  initialValues?: Record<string, unknown>;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 折叠时显示的表单项数量（默认3） */
  defaultCollapseCount?: number;
  /** 每个表单项的列宽配置（支持响应式）*/
  span?: number | ColProps;
  /** 表单项之间的间距 */
  gutter?: number | [number, number];
  /** 是否显示导出按钮 */
  showExport?: boolean;
  /** 导出按钮文本 */
  exportText?: string;
  /** 导出回调 */
  onExport?: () => void;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 刷新按钮文本 */
  refreshText?: string;
  /** 刷新回调（强制刷新数据，忽略缓存） */
  onRefresh?: () => void;
}

export function SearchForm({
  form: formProp,
  children,
  onSearch,
  onReset,
  initialValues,
  defaultExpanded = false,
  defaultCollapseCount = 3,
  span = { xs: 24, sm: 12, md: 8 }, // 默认响应式配置
  gutter = [16, 16],
  showExport = false,
  exportText = '导出',
  onExport,
  showRefresh = false,
  refreshText = '刷新',
  onRefresh,
}: SearchFormProps) {
  const [formInstance] = Form.useForm();
  const form = formProp || formInstance;
  const [expanded, setExpanded] = useState(defaultExpanded);

  // 计算有多少个表单项
  const childrenArray = Array.isArray(children) ? children : [children];
  const itemCount = childrenArray.filter(Boolean).length;
  const shouldShowExpand = itemCount > defaultCollapseCount;

  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  const handleReset = () => {
    form.resetFields();

    if (onReset) {
      // 如果提供了自定义重置回调，由页面决定是否触发搜索
      onReset();
    } else {
      // 否则自动触发搜索（使用初始值）
      const resetValues = initialValues || {};
      onSearch(resetValues);
    }
  };

  // 标准化 span 配置
  const colProps: ColProps = typeof span === 'number' ? { span } : span;

  return (
    <Form
      form={form}
      initialValues={initialValues}
      onFinish={handleSearch}
      className="w-full"
    >
      <div className="flex items-start gap-4">
        {/* 左侧：搜索表单项（占据剩余空间） */}
        <div className="flex-1 min-w-0">
          {/* 始终显示的表单项 */}
          <Row gutter={gutter}>
            {childrenArray.slice(0, defaultCollapseCount).map((child, index) => (
              <Col key={index} {...colProps}>
                {child}
              </Col>
            ))}
          </Row>

          {/* 折叠的表单项（带动画） */}
          <AnimatePresence initial={false}>
            {expanded && shouldShowExpand && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1], // easeInOut
                }}
                className="overflow-hidden"
              >
                <Row gutter={gutter} className="mt-4">
                  {childrenArray.slice(defaultCollapseCount).map((child, index) => (
                    <Col key={index + defaultCollapseCount} {...colProps}>
                      {child}
                    </Col>
                  ))}
                </Row>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 右侧：操作按钮（固定在右边，垂直居中） */}
        <div className="shrink-0">
          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                className="shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                重置
              </Button>
              {showRefresh && onRefresh && (
                <Button
                  icon={<SyncOutlined />}
                  onClick={onRefresh}
                  title="强制刷新数据"
                  className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  {refreshText}
                </Button>
              )}
              {showExport && onExport && (
                <Button
                  icon={<ExportOutlined />}
                  onClick={onExport}
                  className="hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                >
                  {exportText}
                </Button>
              )}
              {shouldShowExpand && (
                <Button
                  type="link"
                  onClick={() => setExpanded(!expanded)}
                  className="px-0 group"
                >
                  {expanded ? '收起' : '展开'}
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="inline-block ml-1"
                  >
                    <DownOutlined className="text-xs" />
                  </motion.span>
                </Button>
              )}
            </Space>
          </Form.Item>
        </div>
      </div>
    </Form>
  );
}
