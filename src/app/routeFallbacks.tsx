import { Spin } from 'antd';

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = '加载中...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spin size="large" />
      <div className="text-gray-500">{text}</div>
    </div>
  );
}

export function NoAvailableMenuPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-300">403</h1>
        <p className="mt-4 text-base text-gray-600">暂无可访问菜单</p>
        <p className="mt-2 text-sm text-gray-400">请联系管理员分配菜单权限</p>
      </div>
    </div>
  );
}
