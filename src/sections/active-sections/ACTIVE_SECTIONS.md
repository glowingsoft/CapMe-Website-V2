# Active Sections — Reference

> All in-progress UI sections under `src/sections/active-sections/`.

---

## Table of Contents

1. [Home View](#home-view)
2. [Category View](#category-view)
3. [FAQs](#faqs)
4. [Help Center](#help-center)
5. [Legal View](#legal-view)
6. [Sample](#sample)
7. [Support View](#support-view)
8. [Wallet View Backup](#wallet-view-backup)
9. [Shared Patterns](#shared-patterns)

---

## Home View

`src/sections/active-sections/home-view/`

The main social dashboard. Three-column layout: left drawer (rooms) + center feed + right sidebar (suggested rooms).

### Root

| File | Component | Notes |
|------|-----------|-------|
| `home-view.jsx` | `HomeView` | Root view, owns all state |
| `mock.js` | — | Mock posts, comments, suggestedRooms, MOCK_FOLLOWERS |
| `data.ts` | `roomsData` | Static room data (favourite / other / myRooms / following) |

#### `HomeView` State

| State | Type | Purpose |
|-------|------|---------|
| `drawerOpen` | bool | Comment drawer open/closed |
| `leftDrawerOpen` | bool | Left room sidebar open/closed |
| `activeRoom` | object\|null | Currently selected room |
| `selectedPost` | object\|null | Post whose comments are open |
| `message` | string | Current input text |
| `fileMenuAnchor` | element\|null | Anchor for SelectFile menu |
| `upload` | `{ file, progress }` | Active upload state (shows progress bar) |
| `attachedFile` | `{ url, type, name, size }`\|null | Ready-to-send file after upload |
| `audioRecorderOpen` | bool | Replaces input bar with AudioRecorder |
| `roomInfoOpen` | bool | Room info right drawer |
| `accountDrawerOpen` | bool | Account drawer (cross-component via window event) |
| `localPosts` | array | Feed posts (reset on room switch) |

#### Cross-Component Events (window)

| Event | Direction | Effect |
|-------|-----------|--------|
| `accountDrawerChange` | header → HomeView | Sets `accountDrawerOpen` |
| `accountDrawerOpened` | header → HomeView | Closes comment + roomInfo drawers |
| `closeAccountDrawer` | HomeView → header | Closes account drawer |

---

### Components

#### `AudioRecorder`
`components/audio-recorder.jsx`

Inline two-phase audio recording bar (replaces message input).

**Props:** `onDone(file)`, `onCancel()`

**Phases:** `recording` → `preview`

| Phase | UI |
|-------|----|
| recording | Cancel (×), pulsing red dot, timer, waveform bars, Stop button |
| preview | Trash icon, `<audio controls>`, Send button |

**Key refs:** `mediaRecorderRef`, `streamRef`, `timerRef`, `chunksRef`

**StrictMode safety:** Local `cancelled` closure flag + `timerRef` ref for interval. `handleCancel` nulls `recorder.onstop` before stopping to prevent preview transition.

---

#### `CommentDrawer`
`components/comment-drawer.jsx`

Right-side drawer (420 px) showing a post's details and comment thread.

**Props:** `open`, `onClose`, `selectedPost`, `commentsData`

---

#### `DrawerHeader`
`components/drawer-header.jsx`

Dark header bar used inside drawers.

**Props:** `title`, `onBack`, `onEdit`, `onShare`, `showEdit`, `showShare`, `backIcon`, `editIcon`

---

#### `FileMessage`
`components/file-message.jsx`

Renders an uploaded file in the feed based on MIME type.

**Props:** `file` — `{ url, type, name, size }`

| MIME | Rendered As |
|------|-------------|
| `image/*` | `<img>` (max-height 300 px) |
| `video/*` | `<video controls>` (max-height 280 px) |
| `audio/*` | `<audio controls>` |
| other | Download card (opens `url` in new tab) |

---

#### `FileUploadProgress`
`components/file-upload-progress.jsx`

Progress bar shown while simulating a large-file upload (> 300 KB threshold in `HomeView`).

**Props:** `file`, `progress` (0–100), `onCancel`

Shows "Processing…" at 100%. Cancel button hidden once complete.

---

#### `LeftDrawer`
`components/left-drawer.jsx`

Collapsible left sidebar for room navigation. Only visible on `md+` breakpoints and only on `/dashboard` routes.

**Props:** `open`, `onToggle`, `roomsData`, `activeRoomId`, `onRoomSelect`

**Tabs:** All / My Rooms / Following

Width transitions: 0 ↔ 420 px via CSS transition.

---

#### `PostCard`
`components/post-card.jsx`

Feed post card.

**Props:** `post`, `onCommentClick`, `onMenuAction`

**Post shape:**
```
{ id, type, user: { name, username, avatar }, content, hashtags,
  image, file, stats: { likes, comments, shares, capme }, time }
```

**Menu actions:** copy (to clipboard), edit, pin, delete

**Stats row:** ❤️ (toggle like) · 💬 comments · share · Capme logo

---

#### `RoomChannelHeader`
`components/room-channel-header.jsx`

Dark header bar shown when a room is active.

**Props:** `room`, `onRoomInfoOpenChange`

**Menu items:** Room Info, Following/Unfollow, Share, Report

Report → `UnfollowModal` (blue colors, feedback textarea) → toast top-right.

---

#### `RoomInformation`
`components/room-information.jsx`

Right drawer with full room details and follower management.

**Props:** `open`, `onClose`, `room`, `followers`, `onEdit`, `onShare`, `onDownloadMedia`, `onDeleteRoom`, `onRemoveFollower`

**Actions & modals:**

| Action | Modal | Color |
|--------|-------|-------|
| Delete Room | `ConfirmModal` | Red |
| Remove Follower | `UnfollowModal` | Red |
| Report Room | `UnfollowModal` (report mode) | Blue `#4C4EFF` |

All confirm actions show a top-right toast.

---

#### `SelectFile`
`components/select-file.jsx`

Dropdown menu for the `+` button in the message bar.

**Props:** `anchorEl`, `onClose`, `onFileSelected(file)`, `onAudioRecord()`

| Option | Behaviour |
|--------|-----------|
| Attach photo / video | File picker (`image/*,video/*`) |
| Record an audio | Calls `onAudioRecord()` |
| Upload a file | File picker (`*/*`) |

---

#### `SuggestedRooms`
`components/suggested-rooms.jsx`

Right sidebar card listing suggested rooms with star button.

**Props:** `rooms`

---

#### `UnfollowModal`
`components/unfollow-modal.jsx`

Dual-mode confirmation modal — used for both unfollow and report flows.

**Props:**

| Prop | Default | Notes |
|------|---------|-------|
| `open` | — | — |
| `onClose` | — | — |
| `onConfirm` | — | — |
| `roomName` | `'this room'` | Shown in default description |
| `loading` | `false` | Disables confirm button |
| `title` | `'Confirmation'` | Header text |
| `description` | — | Body text |
| `confirmLabel` | — | Confirm button label |
| `confirmColor` | `'#C40000'` | Confirm button bg |
| `icon` | `'material-symbols:priority-high-rounded'` | Badge icon |
| `iconBgColor` | `'#C40000'` | Badge bg |
| `feedback` | `undefined` | Pass string to enable report mode (textarea) |
| `onFeedbackChange` | — | Textarea change handler |

Report mode activates when `feedback !== undefined`. Submit disabled if feedback is empty.

---

## Category View

`src/sections/active-sections/category-view/`

Generic list/table view for wallet-like entities. Connected to RTK Query.

| File | Component | Notes |
|------|-----------|-------|
| `view/category-list-view.jsx` | `CategoryListView` | Full table: filters, pagination, delete |
| `category-table-row.jsx` | `WalletTableRow` | Row with quick-edit modal |
| `category-table-toolbar.jsx` | `UserTableToolbar` | Search input + date picker |
| `category-table-filters-result.jsx` | `UserTableFiltersResult` | Active filter chips |

**API hooks used:** `useGetWalletsQuery`, `useDeleteWalletMutation`

---

## FAQs

`src/sections/active-sections/faqs/faqs-view.jsx`

**Component:** `FaqsView`

Accordion FAQ list with add / delete. Client-side only (mock data, no API).

- Form validation: Zod + react-hook-form
- Delete: confirmation modal → toast
- Add: dialog with question + answer fields

---

## Help Center

`src/sections/active-sections/help-center/help-center-view.jsx`

**Component:** `HelpCenterView`

Article grid with ReactQuill rich-text editor.

**Modes:** list view (search + cards) ↔ editor view (create/edit article)

- Report modal with feedback textarea
- Delete confirmation modal
- All operations local state only (no API)

---

## Legal View

`src/sections/active-sections/legal-view/legal-view.jsx`

**Component:** `LegalView`

**Props:** `type` — `'about' | 'terms' | 'policy'`

ReactQuill editor for legal content (English). Validates non-empty (strips HTML tags before check). Save shows loading state.

---

## Sample

`src/sections/active-sections/sample/`

Boilerplate table view. Use as a starting template for new list pages.

| File | Component |
|------|-----------|
| `view/sample-list-view.jsx` | `SampleListView` |
| `sample-table-row.jsx` | `DevicesTableRow` |
| `sample-table-toolbar.jsx` | `DevicesTableToolbar` |
| `sample-table-filters-result.jsx` | `DevicesTableFiltersResult` |

**API:** `useGetWalletsQuery` (swap endpoint when building a real section)

---

## Support View

`src/sections/active-sections/support-view/`

Support ticket table with reply and delete flows.

| File | Component | Notes |
|------|-----------|-------|
| `supports-list-view.jsx` | `SupportListView` | Table with tabs (open/closed) |
| `support-table-row.jsx` | `SupportTableRow` | Row with reply button |
| `components/quick-support-reply.jsx` | `QuickSupportReply` | Reply modal |
| `mocks/mock-data.js` | `DUMMYDATA` | 6 sample tickets |

**Ticket shape:**
```
{ _id, userId, name, email, avatar, phone, subject, message,
  priority: 'high'|'medium'|'low', status: 'open'|'closed',
  attachments[], createdAt, updatedAt }
```

Reply button only visible when `status === 'open'`.

---

## Wallet View Backup

`src/sections/active-sections/wallet-view-backup-file/`

Reference copy of the category-view table structure. Do not edit — kept as backup only.

---

## Shared Patterns

### File Upload Flow (`HomeView`)

```
User picks file via SelectFile
  → file.size < 300 KB  → setAttachedFile directly
  → file.size ≥ 300 KB  → show FileUploadProgress (simulated interval)
                          → on complete → setAttachedFile
User types message (optional) + clicks Send
  → handleSend appends post with { content, file }
  → clears message + attachedFile
```

Send button disabled while `upload.file` is active.

### Toast Pattern

All confirm actions use a local `toast` state object:

```js
const [toast, setToast] = useState({ open: false, message: '' });
const showToast = (message) => setToast({ open: true, message });
const hideToast = () => setToast((p) => ({ ...p, open: false }));
```

Snackbar: `anchorOrigin={{ vertical: 'top', horizontal: 'right' }}`

### Modal Color Convention

| Modal Type | Button Color |
|------------|-------------|
| Destructive (Delete / Remove) | Red `#C40000` |
| Report | Blue `#4C4EFF` |
| Unfollow | Red `#C40000` |

### RTK Query Hooks (active in category & sample views)

| Hook | Source |
|------|--------|
| `useGetWalletsQuery` | `src/store/Reducer/` |
| `useDeleteWalletMutation` | `src/store/Reducer/` |

Swap these for the real endpoint when wiring up a new section.
