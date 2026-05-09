import { useEffect, useState } from 'react';

function getOnlineStatus() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function MobileOfflineBanner() {
  const [online, setOnline] = useState(getOnlineStatus);

  useEffect(() => {
    const syncOnlineStatus = () => setOnline(getOnlineStatus());

    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);

    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, []);

  if (online) {
    return null;
  }

  return <div className="mobile-offline-banner">离线中，显示最近缓存</div>;
}
