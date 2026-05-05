export function openAttachmentWindow(): Window | null {
  const openedWindow = window.open('about:blank', '_blank');
  if (openedWindow) {
    openedWindow.opener = null;
  }

  return openedWindow;
}

export function navigateAttachmentWindow(openedWindow: Window | null, url: string) {
  if (openedWindow) {
    openedWindow.location.href = url;
    return;
  }

  window.location.assign(url);
}

export function closeAttachmentWindow(openedWindow: Window | null) {
  openedWindow?.close();
}
