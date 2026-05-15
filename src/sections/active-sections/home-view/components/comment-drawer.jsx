import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SelectFile from './select-file';
import FileUploadProgress from './file-upload-progress';
import AudioRecorder from './audio-recorder';
import FileMessage from './file-message';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import DrawerHeader from './drawer-header';
import ImagePreviewDialog from './image-preview-dialog';
import AttachedFileChip from './attached-file-chip';
import { useGetCommentsQuery, useLikeCommentMutation, useGetUrlMetaMutation } from 'src/store/Reducer/rooms-api';
import { useUploadChatFilesMutation } from 'src/store/Reducer/auth';
import { getSocket } from 'src/socket/socket';
import { chatSocketService } from 'src/socket/chatSocketService';
import LinkPreview from './link-preview';
import { AutoLinkPreview } from './message-link-preview';
import MessageDeleteModal from './message-delete-modal';

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/;
const ATTACHMENT_TYPE_MAP = { image: 'image/jpeg', video: 'video/mp4', audio: 'audio/mp4', file: 'application/octet-stream' };
const resolveAttachmentType = (t) => ATTACHMENT_TYPE_MAP[t] ?? t ?? 'application/octet-stream';
const cleanUrl = (s) => {
  if (!s || typeof s !== 'string') return '';
  if (s.toLowerCase().includes('noimg')) return '';
  return s.replace(/^https?:\/\/[^/]+(\/https?:\/\/.+)$/, (_, rest) => rest.slice(1)).trim();
};

const getCommentId = (item) => String(item?.id || item?._id || '');

function normalizeComment(c) {
  const sender = c.sender ?? c.user ?? {};
  const senderName = typeof c.user === 'string' ? c.user : sender?.name;
  const senderAvatar = cleanUrl(c.avatar ?? sender?.avatar ?? sender?.image ?? c.senderImage ?? '');
  const createdAt = c.createdAt ?? c.time;
  const likeCount = c.likeCount ?? c.likesCount ?? (typeof c.likes === 'number' ? c.likes : 0);

  return {
    id: c._id ?? c.id,
    userId: c.senderId ?? sender?._id ?? sender?.id ?? c.userId ?? '',
    user: senderName ?? c.sendername ?? c.senderName ?? 'Unknown',
    avatar: senderAvatar,
    text: c.content ?? c.text ?? '',
    likes: likeCount,
    likedBy: Array.isArray(c.likedBy) ? c.likedBy : (Array.isArray(c.likes) ? c.likes : []),
    isLiked: !!c.isLiked,
    replies: c.replyCount ?? c.replies ?? 0,
    attachments: (c.attachments ?? []).map((att) => ({
      url: att.fileUrl ?? att.url ?? '',
      type: resolveAttachmentType(att.fileType ?? att.type ?? ''),
      name: att.originalFileName ?? att.originalName ?? att.fileName ?? att.name ?? '',
      size: att.size ?? 0,
    })),
    meta: c.meta ?? {},
    time: c.createdAt
      ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (c.time ?? ''),
    messageId: String(c.messageId ?? c.message ?? c.message_id ?? ''),
  };
}

function renderWithHashtags(text) {
  const parts = text.split(/(https?:\/\/[^\s<>"{}|\\^`[\]]+|#[\p{L}\p{N}_]+)/u);
  return parts.map((part, i) =>
    part.startsWith('http') ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4C4EFF', textDecoration: 'none', fontWeight: 500 }}
      >
        {part}
      </a>
    ) : part.startsWith('#') ? (
      <span key={i} style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer' }}>{part}</span>
    ) : part
  );
}

function normalizeAttachment(att) {
  if (!att) return null;
  // Already normalized (has url + MIME type)
  if (att.url && att.type?.includes('/')) return att;
  return {
    url: att.fileUrl ?? att.url ?? '',
    type: resolveAttachmentType(att.fileType ?? att.type ?? ''),
    name: att.originalFileName ?? att.originalName ?? att.fileName ?? '',
    size: att.size ?? 0,
  };
}

function getAttachments(item) {
  if (!item) return [];
  if (Array.isArray(item.attachments) && item.attachments.length)
    return item.attachments.filter(Boolean).map(normalizeAttachment).filter(Boolean);
  if (Array.isArray(item.files) && item.files.length)
    return item.files.filter(Boolean).map(normalizeAttachment).filter(Boolean);
  return item.file ? [normalizeAttachment(item.file)].filter(Boolean) : [];
}

export default function CommentDrawer({ open, onClose, selectedPost, commentsData, roomId }) {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?._id ?? currentUser?.id ?? '';

  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [upload, setUpload] = useState({ file: null, progress: 0 });
  const [attachedFile, setAttachedFile] = useState(null);
  const [audioRecorderOpen, setAudioRecorderOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [linkMeta, setLinkMeta] = useState(null);
  const [linkMetaDismissed, setLinkMetaDismissed] = useState(false);
  const uploadTimerRef = useRef(null);
  const linkDebounceRef = useRef(null);
  const lastFetchedUrlRef = useRef(null);
  const joinedRoomRef = useRef(null);

  const selectedPostAttachments = getAttachments(selectedPost);
  const drawerFileImageSx = { height: 220, borderRadius: 2, objectFit: 'cover' };
  const messageId = selectedPost?.id ?? selectedPost?._id;

  const isPostLikedByMe = useMemo(
    () => Array.isArray(selectedPost?.likes) && selectedPost.likes.some((item) => {
      const id = typeof item === 'object' ? (item?._id ?? item?.id ?? item?.userId) : item;
      return String(id) === String(currentUserId);
    }),
    [selectedPost?.likes, currentUserId]
  );
  const postLikeAction = String(selectedPost?.likeAction ?? '').toLowerCase();
  const postLiked = postLikeAction ? postLikeAction.includes('like') && !postLikeAction.includes('unlike') : isPostLikedByMe;
  const postLikeCount = selectedPost?.stats?.likes ?? 0;

  const { data: commentsApiData, isLoading: commentsLoading, isFetching: commentsFetching } = useGetCommentsQuery(
    { messageId, page: 1, limit: 50 },
    { skip: !open || !messageId, refetchOnMountOrArgChange: true }
  );

  const [likeCommentApi] = useLikeCommentMutation();
  const [uploadChatFiles] = useUploadChatFilesMutation();
  const [fetchUrlMeta] = useGetUrlMetaMutation();

  // Reset input/like state when a different post is opened
  useEffect(() => {
    if (!selectedPost?.id) return;
    setCommentText('');
    setLocalComments(commentsData?.[selectedPost?.id] ?? []);
  }, [selectedPost?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join the room on open so socket events (messageLiked, newComment) are delivered.
  // Only join when roomId is explicitly provided (activity feed); home-view already
  // manages room membership itself, so it won't pass this prop.
  useEffect(() => {
    const resolvedRoom = roomId ?? selectedPost?.roomId;
    if (!open || !resolvedRoom) return;
    chatSocketService.joinRoom(resolvedRoom);
    joinedRoomRef.current = resolvedRoom;
    return () => {
      if (joinedRoomRef.current) {
        chatSocketService.leaveRoom(joinedRoomRef.current);
        joinedRoomRef.current = null;
      }
    };
  }, [open, roomId, selectedPost?.roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Populate from API — compute isLiked from likedBy array (same pattern as post-card)
  useEffect(() => {
    if (commentsApiData?.comments) {
      setLocalComments(
        commentsApiData.comments.map((c) => {
          const normalized = normalizeComment(c);
          return {
            ...normalized,
            isLiked: Array.isArray(c.likedBy ?? c.likes) && (c.likedBy ?? c.likes).some((item) => {
              const id = typeof item === 'object' ? (item?._id ?? item?.id ?? item?.userId) : item;
              return String(id) === String(currentUserId);
            }),
          };
        })
      );
    }
  }, [commentsApiData]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL detection — debounced 700ms
  useEffect(() => {
    clearTimeout(linkDebounceRef.current);
    const match = commentText.match(URL_REGEX);
    const detected = match?.[0] ?? null;

    if (!detected) {
      setLinkMeta(null);
      setLinkMetaDismissed(false);
      lastFetchedUrlRef.current = null;
      return;
    }

    if (detected === lastFetchedUrlRef.current || linkMetaDismissed) return;

    linkDebounceRef.current = setTimeout(async () => {
      try {
        lastFetchedUrlRef.current = detected;
        const meta = await fetchUrlMeta(detected).unwrap();
        if (meta && Object.values(meta).some(Boolean)) {
          setLinkMeta({ ...meta, url: meta.url ?? detected });
        }
      } catch {
        // silently ignore
      }
    }, 700);

    return () => clearTimeout(linkDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentText]);

  // Socket: newComment + commentDeleted listeners scoped to this messageId
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !messageId) return;

    const onNewComment = ({ comment }) => {
      if (!comment) return;
      const normalized = normalizeComment(comment);
      if (normalized.messageId && String(normalized.messageId) !== String(messageId)) return;
      setLocalComments((prev) => {
        if (prev.some((c) => getCommentId(c) === getCommentId(normalized))) return prev;
        window.dispatchEvent(new CustomEvent('commentAdded', { detail: { messageId } }));
        return [...prev, normalized];
      });
    };

    const onCommentDeleted = ({ commentId }) => {
      console.log('[Socket] commentDeleted →', commentId);
      setLocalComments((prev) => {
        const removed = prev.some((c) => getCommentId(c) === String(commentId));
        if (removed) {
          window.dispatchEvent(new CustomEvent('commentRemoved', { detail: { messageId } }));
        }
        return prev.filter((c) => getCommentId(c) !== String(commentId));
      });
    };

    socket.on('newComment', onNewComment);
    socket.on('commentDeleted', onCommentDeleted);

    return () => {
      socket.off('newComment', onNewComment);
      socket.off('commentDeleted', onCommentDeleted);
    };
  }, [messageId]);

  // Upload-first flow — same pattern as home-view message attachments
  const handleFileSelected = useCallback(async (fileInput) => {
    const file = fileInput?.file ?? fileInput;
    if (!(file instanceof File)) {
      toast.error('Could not read the selected file. Please try again.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUpload({ file, progress: 0 });
    let fakeProgress = 0;
    uploadTimerRef.current = setInterval(() => {
      fakeProgress = Math.min(85, fakeProgress + Math.floor(Math.random() * 12) + 4);
      setUpload((prev) => ({ ...prev, progress: fakeProgress }));
    }, 200);
    try {
      const result = await uploadChatFiles(file).unwrap();
      clearInterval(uploadTimerRef.current);
      setUpload((prev) => ({ ...prev, progress: 100 }));
      setTimeout(() => {
        setUpload({ file: null, progress: 0 });
        const data = Array.isArray(result) ? result[0] : result;
        setAttachedFile({
          url: data.fileUrl || previewUrl,
          type: file.type,
          name: file.name,
          size: file.size,
          uploadedData: data,
        });
      }, 400);
    } catch {
      clearInterval(uploadTimerRef.current);
      setUpload({ file: null, progress: 0 });
      toast.error('File upload failed. Please try again.');
    }
  }, [uploadChatFiles]);

  const cancelUpload = useCallback(() => {
    clearInterval(uploadTimerRef.current);
    setUpload({ file: null, progress: 0 });
    setAttachedFile(null);
  }, []);

  const handleSendComment = useCallback(async () => {
    const socket = getSocket();
    if (!socket?.connected) {
      toast.error('Not connected. Please try again.');
      return;
    }

    const rawText = commentText.trim();
    if (!rawText && !attachedFile && !linkMeta) return;
    const text = rawText;

    if (upload.file) {
      toast.error('File is still uploading, please wait.');
      return;
    }

    setIsSending(true);
    try {
      let attachments = [];
      if (attachedFile && !attachedFile.uploadedData) {
        toast.error('File is still preparing, please wait.');
        return;
      }
      if (attachedFile?.uploadedData) {
        const { fileName, fileType, originalFileName } = attachedFile.uploadedData;
        attachments = [{ fileName, fileType, originalFileName }];
      }

      chatSocketService.addComment({
        messageId,
        content: text,
        attachments,
        meta: linkMeta ?? {},
      });

      setCommentText('');
      setAttachedFile(null);
      setLinkMeta(null);
      setLinkMetaDismissed(false);
      lastFetchedUrlRef.current = null;
    } catch (err) {
      console.error('Send comment error:', err);
      toast.error('Failed to send comment. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [commentText, attachedFile, upload.file, messageId]);

  const handlePostLike = useCallback(() => {
    if (!messageId) return;

    const socket = getSocket();
    if (!socket?.connected) {
      toast.error('Not connected. Please try again.');
      return;
    }

    chatSocketService.likeMessage({ messageId });
  }, [messageId]);

  const handleCommentLike = useCallback(async (commentId) => {
    // Optimistic update
    setLocalComments((prev) =>
      prev.map((c) => {
        if (String(c.id) !== String(commentId)) return c;
        const wasLiked = !!c.isLiked;
        return { ...c, isLiked: !wasLiked, likes: wasLiked ? Math.max(0, (c.likes ?? 0) - 1) : (c.likes ?? 0) + 1 };
      })
    );
    try {
      const res = await likeCommentApi(commentId).unwrap();
      const newCount = res?.body?.likeCount ?? res?.body?.likesCount ?? res?.likeCount;
      const rawMsg = res?.body?.message ?? res?.message ?? '';
      let isNowLiked;
      if (rawMsg) {
        const lower = rawMsg.toLowerCase();
        if (lower.includes('unlike')) isNowLiked = false;
        else if (lower.includes('like')) isNowLiked = true;
      }
      // Reconcile with server response
      setLocalComments((prev) =>
        prev.map((c) => {
          if (String(c.id) !== String(commentId)) return c;
          return {
            ...c,
            isLiked: isNowLiked !== undefined ? isNowLiked : c.isLiked,
            likes: newCount !== undefined ? newCount : c.likes,
          };
        })
      );
    } catch {
      // Revert optimistic update on failure
      setLocalComments((prev) =>
        prev.map((c) => {
          if (String(c.id) !== String(commentId)) return c;
          const wasLiked = !!c.isLiked;
          return { ...c, isLiked: !wasLiked, likes: wasLiked ? Math.max(0, (c.likes ?? 0) - 1) : (c.likes ?? 0) + 1 };
        })
      );
      toast.error('Could not update like. Please try again.');
    }
  }, [likeCommentApi]);

  const handleOpenDeleteComment = useCallback((commentId) => {
    if (!commentId) return;
    setDeleteCommentId(commentId);
  }, []);

  const handleConfirmDeleteComment = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected) {
      toast.error('Not connected. Please try again.');
      return;
    }

    if (!deleteCommentId) return;
    chatSocketService.deleteComment({ commentId: deleteCommentId });
    setDeleteCommentId(null);
  }, [deleteCommentId]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        disableScrollLock
        ModalProps={{ sx: { pointerEvents: 'none' } }}
        PaperProps={{
          sx: {
            width: 420,
            borderTopLeftRadius: 20,
            mt: '105px',
            height: 'calc(100vh - 105px)',
            bgcolor: '#fff',
            p: 0,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
      <DrawerHeader title="Comment" onBack={onClose} showEdit={false} showShare={false} />

      {selectedPost && (
        <>
          {/* Scrollable content */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              px: 2,
              py: 2,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.15) transparent',
              '&::-webkit-scrollbar': { width: '3px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
            }}
          >
            {/* Post summary */}
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <Avatar
                src={selectedPost.user.avatar || undefined}
                sx={{ bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, width: 40, height: 40, flexShrink: 0 }}
              >
                {selectedPost.user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={700}>{selectedPost.user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedPost.time}</Typography>
                </Stack>

                {selectedPost.content && (() => {
                  const detectedUrl = selectedPost.meta?.url
                    ? selectedPost.content.match(URL_REGEX)?.[0] ?? selectedPost.meta.url
                    : null;
                  const displayContent = detectedUrl
                    ? selectedPost.content.replace(detectedUrl, '').trim()
                    : selectedPost.content;
                  return displayContent ? (
                    <Typography sx={{ mt: 0.5, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                      {renderWithHashtags(displayContent)}
                    </Typography>
                  ) : null;
                })()}

                {(selectedPost.meta?.url || selectedPost.content) && (
                  <AutoLinkPreview text={selectedPost.content} meta={selectedPost.meta} compact noAutoFetch />
                )}

                {selectedPost.hashtags && (
                  <Typography sx={{ fontWeight: 600, fontSize: 13, mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {renderWithHashtags(selectedPost.hashtags)}
                  </Typography>
                )}

                {!selectedPost.meta?.url && selectedPost.image && (
                  <Box
                    component="img"
                    src={selectedPost.image}
                    alt="Post"
                    onClick={() => setImagePreviewOpen(true)}
                    sx={{ mt: 1.5, width: '100%', borderRadius: 2, maxHeight: 220, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                  />
                )}

                {!!selectedPostAttachments.length && (
                  <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                    {selectedPostAttachments.map((file, index) => (
                      <FileMessage key={`${selectedPost.id}-attachment-${index}`} file={file} imageSx={drawerFileImageSx} />
                    ))}
                  </Stack>
                )}

                <ImagePreviewDialog
                  open={imagePreviewOpen}
                  src={selectedPost.image}
                  alt="Post image preview"
                  onClose={() => setImagePreviewOpen(false)}
                />

                <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={handlePostLike}>
                    <Iconify
                      icon={postLiked ? 'ic:round-favorite' : 'ic:round-favorite-border'}
                      width={18}
                      style={{ color: postLiked ? '#e53935' : '#9e9e9e', transition: 'color 0.15s, transform 0.15s', transform: postLiked ? 'scale(1.2)' : 'scale(1)' }}
                    />
                    <Typography variant="caption" fontWeight={500} color={postLiked ? '#e53935' : 'text.secondary'}>
                      {postLikeCount}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {localComments.length}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Iconify icon="mdi-light:share" width={18} style={{ color: '#43a047' }} />
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {selectedPost.stats.shares}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>

            <Typography sx={{ mb: 1, mt: 2, color: '#888', fontSize: 13 }}>
              {localComments.length} Replies
            </Typography>
            <Box sx={{ borderBottom: '1px solid #eee', mb: 2 }} />

            {/* Comments list */}
            {commentsLoading || commentsFetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} sx={{ color: '#4C4EFF' }} />
              </Box>
            ) : (
              <Stack spacing={2}>
                {localComments.map((comment) => {
                  const commentAttachments = getAttachments(comment);
                  const commentKey = getCommentId(comment) || comment.id;

                  return (
                    <Stack key={commentKey} direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar
                        src={comment.avatar || undefined}
                        sx={{ bgcolor: '#4C4EFF', color: '#fff', fontWeight: 700, width: 32, height: 32, fontSize: 13, flexShrink: 0 }}
                      >
                        {comment.user?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                          <Typography fontWeight={600} fontSize={13}>{comment.user}</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                            <Typography variant="caption" color="text.secondary">{comment.time || 'Just now'}</Typography>
                            {String(comment.userId) === String(currentUserId) && (
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteComment(commentKey)}
                                sx={{ width: 24, height: 24, color: '#e53935' }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={14} />
                              </IconButton>
                            )}
                          </Stack>
                        </Stack>

                        {comment.text && (() => {
                          const detectedUrl = comment.meta?.url
                            ? comment.text.match(URL_REGEX)?.[0] ?? comment.meta.url
                            : null;
                          const displayText = detectedUrl
                            ? comment.text.replace(detectedUrl, '').trim()
                            : comment.text;
                          return displayText ? (
                            <Typography sx={{ mt: 0.5, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                              {renderWithHashtags(displayText)}
                            </Typography>
                          ) : null;
                        })()}

                        {/* Link preview */}
                        <AutoLinkPreview text={comment.text} meta={comment.meta} compact noAutoFetch />

                        {/* Attachments */}
                        {!!commentAttachments.length && (
                          <Stack spacing={1.25} sx={{ mt: 1 }}>
                            {commentAttachments.map((file, index) => (
                              <FileMessage key={`${commentKey}-attachment-${index}`} file={file} imageSx={drawerFileImageSx} />
                            ))}
                          </Stack>
                        )}

                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.75 }}>
                          <Stack
                            direction="row" spacing={0.5} alignItems="center"
                            sx={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => handleCommentLike(commentKey)}
                          >
                            <Iconify
                              icon={comment.isLiked ? 'ic:round-favorite' : 'ic:round-favorite-border'}
                              width={16}
                              style={{ color: comment.isLiked ? '#e53935' : '#9e9e9e', transition: 'color 0.15s, transform 0.15s', transform: comment.isLiked ? 'scale(1.2)' : 'scale(1)' }}
                            />
                            <Typography variant="caption" fontWeight={500} color={comment.isLiked ? '#e53935' : 'text.secondary'}>
                              {comment.likes ?? 0}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Pinned input */}
          <Box sx={{ flexShrink: 0, px: 2, py: 1.5, borderTop: '1px solid #f0f0f0' }}>
            {upload.file && (
              <FileUploadProgress file={upload.file} progress={upload.progress} onCancel={cancelUpload} />
            )}

            {attachedFile && !upload.file && (
              <AttachedFileChip file={attachedFile} onRemove={() => setAttachedFile(null)} />
            )}

            {linkMeta && !linkMetaDismissed && (
              <LinkPreview
                meta={linkMeta}
                onDismiss={() => { setLinkMetaDismissed(true); setLinkMeta(null); }}
              />
            )}

            {audioRecorderOpen ? (
              <AudioRecorder
                onDone={(file) => { setAudioRecorderOpen(false); handleFileSelected(file); }}
                onCancel={() => setAudioRecorderOpen(false)}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#fff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 3,
                  px: 1.5,
                  py: 0.75,
                  boxShadow: '0px 1px 8px rgba(0,0,0,0.06)',
                }}
              >
                <IconButton size="small" onClick={(e) => setFileMenuAnchor(e.currentTarget)} sx={{ color: '#9e9e9e', flexShrink: 0 }}>
                  <Iconify icon="mingcute:add-line" width={22} />
                </IconButton>

                <SelectFile
                  anchorEl={fileMenuAnchor}
                  onClose={() => setFileMenuAnchor(null)}
                  onFileSelected={handleFileSelected}
                  onAudioRecord={() => setAudioRecorderOpen(true)}
                />

                <InputBase
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !upload.file && !isSending) { e.preventDefault(); handleSendComment(); } }}
                  placeholder="Write a comment..."
                  fullWidth
                  multiline
                  maxRows={4}
                  sx={{ flex: 1, fontSize: 14, color: 'text.primary', '& textarea': { p: 0 } }}
                />

                <IconButton
                  onClick={handleSendComment}
                  disabled={isSending || !!upload.file || (!commentText.trim() && !attachedFile && !linkMeta)}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    bgcolor: '#4C4EFF',
                    color: '#fff',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    '&:hover': { bgcolor: '#3739b7' },
                    '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
                  }}
                >
                  {isSending
                    ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                    : <Iconify icon="mingcute:send-line" width={18} />
                  }
                </IconButton>
              </Box>
            )}
          </Box>
        </>
      )}
      </Drawer>

      <MessageDeleteModal
        open={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </>
  );
}
