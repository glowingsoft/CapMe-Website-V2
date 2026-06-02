# Localization Context — Capme

Reference file for i18n work. Load this at the start of any localization session.

---

## Architecture

- **Hook**: `const { t } = useTranslate('common')` — import from `src/locales`
- **Files**: `src/locales/langs/{en,de,fr}/common.json` — one file per language, no extra files ever
- **en/common.json** = master key definition (source of truth for all keys)
- **de/common.json** and **fr/common.json** must mirror identical key structure with translated values
- **Languages**: ONLY `en`, `de`, `fr` — nothing else
- **Scope**: ONLY Capme-specific pages/components — skip boilerplate template pages

## Patterns

| Pattern | When | Example |
|---|---|---|
| Standard | Any component | `import { useTranslate } from 'src/locales'` → `const { t } = useTranslate('common')` → `t('section.key')` |
| Interpolation | Dynamic values in strings | JSON: `"{{count}} Replies"` → call: `t('key', { count })` |
| LabelKey | Static config objects at module level | Set `labelKey: 'search.visibility_public'` on the object → `t(cfg.labelKey)` in render |
| Factory nav | Static arrays that need `t()` | `export const getNavData = (t) => [...]` called inside `useMemo([..., t])` |
| Shadowing risk | `.map()` with variable named `t` | Rename loop var to `tabItem` etc. — `t` from useTranslate must not be shadowed |
| Module-level fn param `t` | e.g. `resolveType(t) =>` | No conflict — useTranslate's `t` is component-scoped only |

## Workflow Per Session

1. Add new keys to `en/common.json` first
2. Add translated equivalents to `de/common.json` and `fr/common.json` (same structure)
3. Wire the component: add import, add `const { t } = useTranslate('common')`, replace strings

---

## DONE ✓

### `src/locales/config-locales.js`
Languages set to `['en', 'de', 'fr']`. `changeLangMessages` has en/de/fr entries only.

### `src/locales/all-langs.js`
`allLangs` array: en (GB), de (DE), fr (FR) with correct MUI locale adapters (`deDE`, `frFR` from `@mui/material/locale`, `@mui/x-date-pickers/locales`, `@mui/x-data-grid/locales`).

### `src/layouts/core/header-base.jsx`
Keys used: `app_name`, `available_tokens`, `header.*` (7 keys). `LanguagePopover` uncommented and functional.

### `src/layouts/config-nav-dashboard.jsx`
Converted to `getNavData(t)` factory. Keys: `nav.home/explore/activity_feed/chat_me/notifications/settings`.

### `src/layouts/config-nav-admin-dashboard.jsx`
Converted to `getNavDataAdmin(t)` factory. Keys: `nav.admin_*` (8 keys).

### `src/layouts/dashboard/layout.jsx`
Uses `useTranslate('common')`, calls `getNavData(t)` / `getNavDataAdmin(t)` in `useMemo`.

### `src/components/search-overlay/search-overlay.jsx`
`VISIBILITY_CONFIG` uses `labelKey` pattern. All category/tab/type/state strings wired. Keys: `search.*` (16 keys).

### `src/sections/active-sections/home-view/components/left-drawer.jsx`
Keys: `left_drawer.*` (13 keys). Tab labels use `{{count}}` interpolation. Renamed `.map((t)=>` to `.map((tabItem)=>`.

### `src/sections/active-sections/home-view/components/post-card.jsx`
`VISIBILITY_CONFIG` uses `labelKey` → `search.visibility_*`. Keys: `post_card.*` (7 keys). All menu items + toasts wired.

### `src/sections/active-sections/home-view/components/room-channel-header.jsx`
Keys: `room_channel_header.*` (21 keys). Menu items, follow button, search placeholder, garage text, report modal title/confirmLabel, all toasts including `{{name}}` interpolation.

### `src/sections/active-sections/home-view/components/pinned-messages-display.jsx`
Keys: `pinned_messages.title/collapse/expand`.

### `src/sections/active-sections/home-view/components/comment-drawer.jsx`
Keys: `comment_drawer.*` (13 keys). Drawer title, replies `{{count}}`, input placeholder, delete modal title/description, 7 toast messages.

### `src/sections/active-sections/home-view/components/unfollow-modal.jsx`
Keys: `unfollow_modal.*` (7 keys). Cancel, submitting, unfollow/submit labels, fallback descriptions with `{{roomName}}` interpolation, textarea placeholder.

### `src/sections/active-sections/explore-view/` (all 5 files)
Keys: `explore_view.*` (7 keys), `explore_filter.*` (16 keys), `explore_drawer.*` (13 keys). `VISIBILITY_CONFIG` in explore-post-card uses `labelKey` → `search.visibility_*`. explore-room-header reuses `explore_drawer.btn_*`, `room_channel_header.menu_*`, `room_info.report_modal_*` keys.

### Auth views (all 7 files in `src/auth/`)
Keys: full `auth.*` subtree (sign_in, sign_up, forgot_password, verify_otp, verify_password, reset_password, otp_timer, validation).

---

## TODO — Files to Wire

Work top-to-bottom. Each block = one unit of work.

---

### 1. `home-view/components/message-delete-modal.jsx`

**Strings:**
```
"Delete Message"          → message_delete_modal.title
"Are you sure you want to delete this message? This action cannot be undone."  → message_delete_modal.description
"Cancel"                  → message_delete_modal.cancel
"Delete"                  → message_delete_modal.delete
"Deleting..."             → message_delete_modal.deleting
```
**Note:** Component accepts `title` and `description` as props with defaults — translate the defaults.

---

### 2. `home-view/components/message-edit-modal.jsx`

**Strings:**
```
"Edit Message"            → message_edit_modal.title
"Update your message content" → message_edit_modal.subtitle
"Edit your message..."    → message_edit_modal.placeholder
"Cancel"                  → message_edit_modal.cancel
"Save"                    → message_edit_modal.save
"Saving..."               → message_edit_modal.saving
```

---

### 3. `home-view/components/share-message-modal.jsx`

**Strings:**
```
"Share Message"           → share_message_modal.title
"Copy Link"               → share_message_modal.copy_link
"or share to a room"      → share_message_modal.or_share
"No rooms found"          → share_message_modal.no_rooms
"Link copied to clipboard" → share_message_modal.toast_link_copied
"Shared successfully"     → share_message_modal.toast_shared
"Failed to share. Please try again." → share_message_modal.toast_error
```

---

### 4. `home-view/components/chat-input-bar.jsx`

**Strings:**
```
"Type a message..."                              → chat_input.placeholder
"Could not read the selected file. Please try again." → chat_input.toast_file_read_error
"File upload failed. Please try again."          → chat_input.toast_upload_failed
"Not connected. Please try again."               → chat_input.toast_not_connected
"File is still uploading, please wait."          → chat_input.toast_uploading
"File is still preparing, please wait."          → chat_input.toast_preparing
"Failed to send message. Please try again."      → chat_input.toast_send_failed
```

---

### 5. `home-view/components/create-room-modal.jsx`

**Strings:**
```
"Edit" / "Create"                          → create_room_modal.edit / create_room_modal.create
"Room" / "a Room"                          → create_room_modal.room / create_room_modal.a_room
"Update the details for this room."        → create_room_modal.subtitle_edit
"Set up a space for your team to connect." → create_room_modal.subtitle_create
"Room Photo"                               → create_room_modal.photo_label
"Optional"                                 → create_room_modal.optional
"Upload a photo to represent your room.\nJPG, PNG or GIF — max 5 MB." → create_room_modal.photo_hint
"Remove"                                   → create_room_modal.remove
"Room Name"                                → create_room_modal.name_label
"Required"                                 → create_room_modal.required
"e.g. design-talk"                         → create_room_modal.name_placeholder
"Description"                              → create_room_modal.description_label
"What's this room about?"                  → create_room_modal.description_placeholder
"Tags"                                     → create_room_modal.tags_label
"Space or Enter to add"                    → create_room_modal.tags_hint
"e.g. design, ux, frontend"                → create_room_modal.tags_placeholder
"Visibility"                               → create_room_modal.visibility_label
"Anyone in the workspace can join"         → create_room_modal.visibility_public_note
"Only invited members can see this room"   → create_room_modal.visibility_private_note
"Only your friends can see and join this room" → create_room_modal.visibility_friends_note
"Invite People"                            → create_room_modal.invite_label
"Enter email or name..."                   → create_room_modal.invite_placeholder
"Cancel"                                   → create_room_modal.cancel
"Save Changes"                             → create_room_modal.save
"Create Room"                              → create_room_modal.create_btn
"Room updated successfully"                → create_room_modal.toast_updated
"Room created successfully"                → create_room_modal.toast_created
"Failed to update room. Please try again." → create_room_modal.toast_update_error
"Failed to create room. Please try again." → create_room_modal.toast_create_error
```

---

### 6. `home-view/components/room-information.jsx`

**Strings:**
```
"Created on "                           → room_info.created_on
"Description"                           → room_info.description
"Visibility"                            → room_info.visibility
"Anyone can find and join this room"    → room_info.visibility_public_note
"Only invited members can see this room" → room_info.visibility_private_note
"Only your friends can see and join"    → room_info.visibility_friends_note
"Tags"                                  → room_info.tags
"Downloaded Media"                      → room_info.downloaded_media
"Delete Room"                           → room_info.delete_room
"Report"                                → room_info.report
"Members"                               → room_info.members
"No members yet."                       → room_info.no_members
"Delete Room" (modal title)             → room_info.delete_modal_title
"Are you sure you want to delete \"{{roomName}}\"? This action cannot be undone." → room_info.delete_modal_description
"Delete" (modal confirm)                → room_info.delete_modal_confirm
"Remove Follower" (modal title)         → room_info.remove_modal_title
"Are you sure you want to remove \"{{memberName}}\" from this room?" → room_info.remove_modal_description
"Remove" (modal confirm)                → room_info.remove_modal_confirm
"Report Room" (modal title)             → room_info.report_modal_title
"Submit" (modal confirm)                → room_info.report_modal_confirm
```
**Note:** `report_modal_title` / `report_modal_confirm` are passed as props to `UnfollowModal` — same pattern as `room-channel-header`.

---

### 7. `home-view/components/room-request-drawer.jsx`

**Strings:**
```
"Room Requests"                          → room_requests.title
"Requests ({{count}})"                   → room_requests.tab_requests
"Members ({{count}})"                    → room_requests.tab_members
"Search requests..."                     → room_requests.search_requests
"Pending approvals for this room"        → room_requests.requests_subtitle
"No matching requests"                   → room_requests.no_match_title
"Try another search term."               → room_requests.no_match_subtitle
"No pending requests"                    → room_requests.no_requests_title
"New join requests will appear here."    → room_requests.no_requests_subtitle
"Reject"                                 → room_requests.reject
"Approve"                                → room_requests.approve
"Search members..."                      → room_requests.search_members
"No matching members"                    → room_requests.no_match_members_title
"No members found"                       → room_requests.no_members_title
"Members will appear here once they join." → room_requests.no_members_subtitle
"Editor"                                 → room_requests.role_editor
"Viewer"                                 → room_requests.role_viewer
"Saving..."                              → room_requests.saving
```

---

### 8. `home-view/components/user-profile-drawer.jsx`

**Strings:**
```
"Profile"                  → user_profile.title
"Created Rooms"            → user_profile.tab_created_rooms
"Followings"               → user_profile.tab_followings
"Rooms"                    → user_profile.stat_rooms
"Followers"                → user_profile.stat_followers
"Following"                → user_profile.stat_following
"Friends"                  → user_profile.btn_friends
"Add Friend"               → user_profile.btn_add_friend
"Follow"                   → user_profile.btn_follow
"Request Sent"             → user_profile.btn_request_sent
"Following" (btn)          → user_profile.btn_following
"Search here.."            → user_profile.search_placeholder
"No results found."        → user_profile.no_results
"Private"                  → user_profile.visibility_private (reuse search.visibility_private labelKey)
"Public"                   → user_profile.visibility_public  (reuse search.visibility_public labelKey)
"Load More"                → user_profile.load_more
```

---

### 9. `home-view/view/home-view.jsx` (main view)

**Strings:**
```
"Your garage is empty"                        → home_view.garage_empty_title
"This is your private space — jot down notes, ideas, or reminders. Only you can see this." → home_view.garage_empty_subtitle
"No messages yet"                             → home_view.no_messages_title
"Be the first to say something in {{roomName}}!" → home_view.no_messages_subtitle
"View access only"                            → home_view.view_access_title
"Admin has given you view access only. Contact the admin to get edit permission." → home_view.view_access_subtitle
"Request sent — Waiting for admin approval"   → home_view.pending_title
"Your follow request is pending. You'll be able to join once approved." → home_view.pending_subtitle
"Follow this room to join the conversation"   → home_view.not_following_title
"Select a Room"                               → home_view.no_room_title
"Pick a room from the left to view its content." → home_view.no_room_subtitle
"Create a Room"                               → home_view.create_room
```

---

### 10. `explore-view/explore-view.jsx` + `explore-view/components/` ✓ DONE

**explore-view.jsx strings:**
```
"No messages yet"                             → explore_view.no_messages_title
"Be the first to say something in {{roomName}}!" → explore_view.no_messages_subtitle
"Follow this room to join the conversation"   → explore_view.not_following_title
"Request sent — Waiting for admin approval"   → explore_view.pending_title
"Your follow request is pending. You'll be able to join the conversation once approved." → explore_view.pending_subtitle
"View access only"                            → explore_view.view_access_title
"Admin has given you view access only. Contact the admin for edit permission." → explore_view.view_access_subtitle
```

**explore-filter.jsx strings:**
```
"Filter"                               → explore_filter.title
"Clear All"                            → explore_filter.clear_all
"Search rooms, topics..."              → explore_filter.search_placeholder
"Date Created"                         → explore_filter.date_created
"Today"                                → explore_filter.today
"This Week"                            → explore_filter.this_week
"This Month"                           → explore_filter.this_month
"This Year"                            → explore_filter.this_year
"Member Count"                         → explore_filter.member_count
"Small (eg., 1–10 Members)"            → explore_filter.small
"Medium (eg., 10–50 Members)"          → explore_filter.medium
"Large (50+ Members)"                  → explore_filter.large
"Content Type Focus"                   → explore_filter.content_type
"Image"                                → explore_filter.image
"Video"                                → explore_filter.video
"Audio"                                → explore_filter.audio
"File"                                 → explore_filter.file
```

**explore-left-drawer.jsx strings:**
```
"Explore"                                    → explore_drawer.title
"Discover and manage your rooms."            → explore_drawer.subtitle
"All"                                        → explore_drawer.tab_all
"Popular"                                    → explore_drawer.tab_popular
"New"                                        → explore_drawer.tab_new
"Friends"                                    → explore_drawer.tab_friends
"No rooms found"                             → explore_drawer.no_rooms
"Try a different tab or adjust your filters." → explore_drawer.no_rooms_subtitle
"Follow"                                     → explore_drawer.btn_follow
"Request Sent"                               → explore_drawer.btn_request_sent
"Following"                                  → explore_drawer.btn_following
"Failed to cancel request. Please try again." → explore_drawer.toast_cancel_error
"Failed to update. Please try again."        → explore_drawer.toast_update_error
"Open filters"                               → explore_drawer.open_filters
```

---

### 11. `activity-feed-view/activity-feed-view.jsx` ✓ DONE

**Strings:**
```
"Activity Feed"                              → activity_feed.title
"Search posts..."                            → activity_feed.search_placeholder
"All"                                        → activity_feed.tab_all
"My Rooms"                                   → activity_feed.tab_my_rooms
"Following"                                  → activity_feed.tab_following
"Me"                                         → activity_feed.tab_me
"No posts yet"                               → activity_feed.no_posts_title
"There's nothing to show for this tab."      → activity_feed.no_posts_subtitle
"No more posts"                              → activity_feed.no_more_posts
```

---

### 12. `notifications-view/notifications-view.jsx` ✓ DONE

**Strings:**
```
"My Notifications"                                              → notifications.title
"Your real-time activity, all in one place."                    → notifications.subtitle
"Mark all as read"                                              → notifications.mark_all_read
"No notifications"                                              → notifications.empty_title
"You're all caught up! Check back later for updates."           → notifications.empty_subtitle
```

---

### 13. `settings-view/settings-view.jsx` ✓ DONE

**Strings:**
```
"App Settings"                                  → settings.title
"Manage your preferences and account options."  → settings.subtitle
"General"                                       → settings.section_general
"App Language"                                  → settings.language_label
"Subscription"                                  → settings.subscription_label
"Free plan"                                     → settings.subscription_subtitle
"Knowledge Graph"                               → settings.knowledge_graph_label
"View your interest graph"                      → settings.knowledge_graph_subtitle
"Contact Us"                                    → settings.contact_label
"Get help from our team"                        → settings.contact_subtitle
"Terms & Conditions"                            → settings.terms_label
"Read our terms"                                → settings.terms_subtitle
"Privacy Policy"                                → settings.privacy_label
"How we handle your data"                       → settings.privacy_subtitle
"Support & Legal"                               → settings.section_support
"Account"                                       → settings.section_account
"Log Out"                                       → settings.logout_label
"Sign out of your account"                      → settings.logout_subtitle
"Log Out" (modal title)                         → settings.logout_modal_title
"Are you sure you want to log out? You will need to sign in again to access your account." → settings.logout_modal_description
"Cancel"                                        → settings.logout_modal_cancel
"Log Out" (modal confirm)                       → settings.logout_modal_confirm
```

---

### 14. `settings-view/language-view.jsx` ✓ DONE

**Strings:**
```
"App Language"                         → language_view.title
"Choose your preferred display language." → language_view.subtitle
"Update Language"                      → language_view.update_btn
"Language updated successfully."       → language_view.toast_success
```
**Note:** Language names (English, Deutsch, Français) come from `allLangs[].label` — already defined in `src/locales/all-langs.js`. No new keys needed for those.

---

### 15. `settings-view/contact-us-view.jsx` ✓ DONE

**Strings:**
```
"Contact Us"                                  → contact_us.title
"We're here to help — reach out any time."    → contact_us.subtitle
"Send a Message"                              → contact_us.section_title
"Name"                                        → contact_us.name_label
"Email"                                       → contact_us.email_label
"Subject"                                     → contact_us.subject_label
"What's this about?"                          → contact_us.subject_placeholder
"Message"                                     → contact_us.message_label
"Describe your issue or question..."          → contact_us.message_placeholder
"Send Message"                                → contact_us.submit
"Message sent! We'll get back to you soon."   → contact_us.toast_success
"Failed to send. Please try again."           → contact_us.toast_error
```

---

### 16. `settings-view/privacy-policy-view.jsx` ✓ DONE

**Strings:**
```
"Privacy Policy"   → settings.privacy_label  (reuse existing key)
```
**Note:** Likely just a header that reuses the settings key. Read the file to confirm before acting.

---

### 17. `settings-view/terms-view.jsx` ✓ DONE

**Strings:**
```
"Terms & Conditions"  → settings.terms_label  (reuse existing key)
```
**Note:** Same — likely reuses existing key.

---

### 18. `chat-me-view/chat-me-view.jsx` ✓ DONE

**Strings:**
```
"Prompts"                                                          → chat_me.tab_prompts
"Interests"                                                        → chat_me.tab_interests
"Summary"                                                          → chat_me.tab_summary
"Emotional Needs Decoder"                                          → chat_me.card_emotional_title
"If this journal were a world, what would it look like?"           → chat_me.card_emotional_subtitle
"World of ME"                                                      → chat_me.card_world_title
"Top Content Type"                                                 → chat_me.card_content_type_title
"Type of content I share the most."                                → chat_me.card_content_type_subtitle
"These are just a few recommended examples of what we can do!"     → chat_me.examples_note
"Loading older messages..."                                        → chat_me.loading_older
"Type here..."                                                     → chat_me.placeholder
"Refresh interests"                                                → chat_me.refresh_tooltip
```

---

### 19. `chat-me-view/interests.jsx` ✓ DONE

**Strings:**
```
"No interests found yet."                          → chat_me.interests_empty_title
"Your AI-detected interests will appear here."     → chat_me.interests_empty_subtitle
"Refresh interests"                                → chat_me.refresh_tooltip  (reuse chat_me.refresh_tooltip)
```

---

## JSON Key Sections Summary

Top-level sections in `common.json` when all work is done:

```
demo, app_name, available_tokens,
pinned_messages, comment_drawer, unfollow_modal,
post_card, room_channel_header, left_drawer,
nav, search, header, auth,
message_delete_modal, message_edit_modal, share_message_modal,
chat_input, create_room_modal, room_info, room_requests,
user_profile, home_view, explore_view, explore_filter,
explore_drawer, activity_feed, notifications, settings,
language_view, contact_us, chat_me
```

---

## Quick-Start Prompt for Next Session

> "Continue Capme localization. Read LOCALIZATION_CONTEXT.md in the project root for full context. All i18n work uses `useTranslate('common')` with keys in `src/locales/langs/{en,de,fr}/common.json`. Pick up from the first unchecked TODO item."
