import { useMemo } from 'react';
import { TreeSelect } from 'antd';
import { useApiScopes } from '../hooks/useApiApps';
import { buildApiScopeTreeData } from '../utils/apiScopes';

interface ApiScopeSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

export function ApiScopeSelector({
  value,
  onChange,
  placeholder = '选择开放 API 权限',
}: ApiScopeSelectorProps) {
  const { data: apiScopeGroups = [], isLoading } = useApiScopes();
  const treeData = useMemo(() => buildApiScopeTreeData(apiScopeGroups), [apiScopeGroups]);

  return (
    <TreeSelect
      value={value}
      onChange={(nextValue) => onChange?.(nextValue as string[])}
      treeData={treeData}
      treeCheckable
      treeDefaultExpandAll
      allowClear
      multiple
      loading={isLoading}
      placeholder={placeholder}
      style={{ width: '100%' }}
    />
  );
}
