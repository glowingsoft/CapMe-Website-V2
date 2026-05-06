export const DRAWER_EVENTS = {
  accountClose: 'closeAccountDrawer',
  profileClose: 'closeProfileDrawer',
  roomInfoClose: 'closeRoomInfo',
  roomRequestClose: 'closeRoomRequestDrawer',
  commentClose: 'closeCommentDrawer',
  filterClose: 'closeFilterDrawer',
  chatHistoryClose: 'closeChatHistoryDrawer',
  downloadedMediaClose: 'closeDownloadedMediaDrawer',
  notificationsClose: 'closeNotificationsDrawer',
  profileChange: 'profileDrawerChange',
  chatHistoryChange: 'chatHistoryChange',
  notificationsChange: 'notificationsDrawerChange',
};

export function emitDrawerEvent(name) {
  window.dispatchEvent(new Event(name));
}

export function emitProfileDrawerChange(isOpen) {
  window.dispatchEvent(new CustomEvent(DRAWER_EVENTS.profileChange, { detail: isOpen }));
}

export function emitChatHistoryChange(isOpen) {
  window.dispatchEvent(new CustomEvent(DRAWER_EVENTS.chatHistoryChange, { detail: isOpen }));
}

export function closeAccountDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.accountClose);
}

export function closeProfileDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.profileClose);
}

export function closeRoomInfoDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.roomInfoClose);
}

export function closeRoomRequestDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.roomRequestClose);
}

export function closeCommentDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.commentClose);
}

export function closeFilterDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.filterClose);
}

export function closeChatHistoryDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.chatHistoryClose);
}

export function closeDownloadedMediaDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.downloadedMediaClose);
}

export function closeNotificationsDrawer() {
  emitDrawerEvent(DRAWER_EVENTS.notificationsClose);
}

export function emitNotificationsDrawerChange(isOpen) {
  window.dispatchEvent(new CustomEvent(DRAWER_EVENTS.notificationsChange, { detail: isOpen }));
}

export function closeOverlayDrawers({ includeRoomInfo = false } = {}) {
  closeAccountDrawer();
  closeProfileDrawer();
  closeNotificationsDrawer();

  if (includeRoomInfo) {
    closeRoomInfoDrawer();
  }
}

export function closeContextDrawers() {
  closeCommentDrawer();
  closeFilterDrawer();
  closeRoomRequestDrawer();
  closeDownloadedMediaDrawer();
  closeChatHistoryDrawer();
}

export function closeAllDrawers({ includeRoomInfo = true } = {}) {
  closeOverlayDrawers({ includeRoomInfo });
  closeContextDrawers();
}
