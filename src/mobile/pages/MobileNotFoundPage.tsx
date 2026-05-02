import { Button, Result } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

export function MobileNotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="mobile-page mobile-state-page">
      <Result status="info" title="页面不存在" description="当前移动端页面不存在或已被移除" />
      <Button color="primary" size="small" onClick={() => navigate('/tasks', { replace: true })}>
        返回任务中心
      </Button>
    </div>
  );
}
