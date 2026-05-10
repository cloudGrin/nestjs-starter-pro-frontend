export const MOBILE_APP_UPDATE_DEFERRED_EVENT = 'mobile-app-update-deferred';

export type MobileAppUpdateDeferredEvent = CustomEvent<{
  reload: () => void;
}>;

let reloadBlocked = false;

export function setMobileAppReloadBlocked(blocked: boolean) {
  reloadBlocked = blocked;
}

export function requestMobileAppReload(reload: () => void = () => window.location.reload()) {
  if (!reloadBlocked) {
    reload();
    return;
  }

  window.dispatchEvent(
    new CustomEvent(MOBILE_APP_UPDATE_DEFERRED_EVENT, {
      detail: { reload },
    })
  );
}
