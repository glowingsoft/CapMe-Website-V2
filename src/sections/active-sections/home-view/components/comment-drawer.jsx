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
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import DrawerHeader from './drawer-header';
import ImagePreviewDialog from './image-preview-dialog';
import AttachedFileChip from './attached-file-chip';
import { useGetCommentsQuery, useLikeMessageMutation } from 'src/store/Reducer/rooms-api';

function renderWithHashtags(text) {
  const parts = text.split(/(#[\p{L}\p{N}_]+)/u);
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} style={{ color: '#4C4EFF', fontWeight: 600, cursor: 'pointer' }}>{part}</span>
    ) : part
  );
}

function getAttachments(item) {
  if (!item) return [];

  if (Array.isArray(item.attachments) && item.attachments.length) {
    return item.attachments.filter(Boolean);
  }

  if (Array.isArray(item.files) && item.files.length) {
    return item.files.filter(Boolean);
  }

  return item.file ? [item.file] : [];
}

export default function CommentDrawer({ open, onClose, selectedPost, commentsData }) {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?._id ?? currentUser?.id ?? '';

  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [postLiked, setPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [upload, setUpload] = useState({ file: null, progress: 0 });
  const [attachedFile, setAttachedFile] = useState(null);
  const [audioRecorderOpen, setAudioRecorderOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const uploadTimerRef = useRef(null);
  const selectedPostAttachments = getAttachments(selectedPost);
  const drawerFileImageSx = { height: 220, borderRadius: 2, objectFit: 'cover' };

  const messageId = selectedPost?.id ?? selectedPost?._id;

  const { data: commentsApiData, isLoading: commentsLoading } = useGetCommentsQuery(
    { messageId, page: 1, limit: 50 },
    { skip: !open || !messageId }
  );

  const handleFileSelected = (file) => {
    const url = URL.createObjectURL(file);
    const LARGE = 300 * 1024;
    if (file.size < LARGE) {
      setAttachedFile({ url, type: file.type, name: file.name, size: file.size });
      return;
    }
    setUpload({ file, progress: 0 });
    let progress = 0;
    uploadTimerRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        clearInterval(uploadTimerRef.current);
        setUpload((prev) => ({ ...prev, progress: 100 }));
        setTimeout(() => {
          setUpload({ file: null, progress: 0 });
          setAttachedFile({ url, type: file.type, name: file.name, size: file.size });
        }, 500);
      } else {
        setUpload((prev) => ({ ...prev, progress }));
      }
    }, 250);
  };

  const cancelUpload = () => {
    clearInterval(uploadTimerRef.current);
    setUpload({ file: null, progress: 0 });
  };

  useEffect(() => {
    if (commentsApiData?.comments) {
      setLocalComments(commentsApiData.comments);
    } else {
      setLocalComments(commentsData?.[selectedPost?.id] ?? []);
    }
    setCommentText('');
    // Derive liked state from the post's likes array (same logic as PostCard)
    const isLiked = Array.isArray(selectedPost?.likes) && selectedPost.likes.some((item) => {
      const id = typeof item === 'object' ? (item?._id ?? item?.id ?? item?.userId) : item;
      return String(id) === String(currentUserId);
    });
    setPostLiked(isLiked);
    setPostLikeCount(selectedPost?.stats?.likes ?? 0);
  }, [selectedPost?.id, commentsApiData, currentUserId]);

  const [likeMessageApi] = useLikeMessageMutation();

  const handlePostLike = async () => {
    if (!messageId) return;
    try {
      const res = await likeMessageApi(messageId).unwrap();
      const newCount = res?.body?.likeCount ?? res?.likeCount ?? res?.body?.likesCount ?? res?.likesCount;
      const rawMsg = res?.body?.message ?? res?.message ?? '';
      let isNowLiked = res?.body?.liked ?? res?.liked;
      if (isNowLiked === undefined) {
        const lower = rawMsg.toLowerCase();
        if (lower.includes('unlike')) isNowLiked = false;
        else if (lower.includes('like')) isNowLiked = true;
      }
      const resolvedLiked = isNowLiked !== undefined ? isNowLiked : !postLiked;
      const resolvedCount = newCount !== undefined ? newCount : (resolvedLiked ? postLikeCount + 1 : Math.max(0, postLikeCount - 1));

      setPostLiked(resolvedLiked);
      setPostLikeCount(resolvedCount);

      if (rawMsg) toast.success(rawMsg);

      window.dispatchEvent(new CustomEvent('likeMessage', { detail: { messageId, liked: resolvedLiked, likeCount: resolvedCount } }));
    } catch {
      toast.error('Could not update like. Please try again.');
    }
  };

  const handleCommentLike = (commentId) => {
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;
        const liked = !!comment.isLiked;
        return {
          ...comment,
          isLiked: !liked,
          likes: liked ? Math.max(0, (comment.likes ?? 0) - 1) : (comment.likes ?? 0) + 1,
        };
      })
    );
  };

  const handleSend = () => {
    const text = commentText.trim();
    if (!text && !attachedFile) return;
    setLocalComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'You',
        avatar: '',
        text,
        file: attachedFile || undefined,
        likes: 0,
        replies: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCommentText('');
    setAttachedFile(null);
  };

  return (
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
                sx={{
                  bgcolor: '#4C4EFF',
                  color: '#fff',
                  fontWeight: 700,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                {selectedPost.user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={700}>{selectedPost.user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedPost.time}</Typography>
                </Stack>

                <Typography sx={{ mt: 0.5, fontSize: 13, whiteSpace: 'pre-wrap' }}>{renderWithHashtags(selectedPost.content)}</Typography>
                {selectedPost.hashtags && (
                  <Typography sx={{ fontWeight: 600, fontSize: 13, mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {renderWithHashtags(selectedPost.hashtags)}
                  </Typography>
                )}

                {selectedPost.image && (
                  <Box
                    component="img"
                    src={selectedPost.image}
                    alt="Post"
                    onClick={() => setImagePreviewOpen(true)}
                    sx={{
                      mt: 1.5,
                      width: '100%',
                      borderRadius: 2,
                      maxHeight: 220,
                      objectFit: 'cover',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                  />
                )}

                {!!selectedPostAttachments.length && (
                  <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                    {selectedPostAttachments.map((file, index) => (
                      <FileMessage
                        key={`${selectedPost.id}-attachment-${index}`}
                        file={file}
                        imageSx={drawerFileImageSx}
                      />
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
                  <Stack
                    direction="row"
                    spacing={0.6}
                    alignItems="center"
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={handlePostLike}
                  >
                    <Iconify
                      icon={postLiked ? 'ic:round-favorite' : 'ic:round-favorite-border'}
                      width={18}
                      style={{
                        color: postLiked ? '#e53935' : '#9e9e9e',
                        transition: 'color 0.15s, transform 0.15s',
                        transform: postLiked ? 'scale(1.2)' : 'scale(1)',
                      }}
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
              {commentsApiData?.totalComments ?? localComments.length} Replies
            </Typography>
            <Box sx={{ borderBottom: '1px solid #eee', mb: 2 }} />

            {/* Comments list */}
            {commentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} sx={{ color: '#4C4EFF' }} />
              </Box>
            ) : (
              <Stack spacing={2}>
                {localComments.map((comment) => {
                  const commentAttachments = getAttachments(comment);

                  return (
                    <Stack key={comment.id} direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={comment.avatar || undefined}
                        sx={{
                          bgcolor: '#4C4EFF',
                          color: '#fff',
                          fontWeight: 700,
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                        }}
                      >
                        {comment.user?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography fontWeight={700}>{comment.user}</Typography>
                          <Typography variant="caption" color="text.secondary">{comment.time}</Typography>
                        </Stack>

                        <Typography sx={{ mt: 0.5, fontSize: 13, whiteSpace: 'pre-wrap' }}>{renderWithHashtags(comment.text)}</Typography>

                        {!!commentAttachments.length && (
                          <Stack spacing={1.25} sx={{ mt: 1 }}>
                            {commentAttachments.map((file, index) => (
                              <FileMessage
                                key={`${comment.id}-attachment-${index}`}
                                file={file}
                                imageSx={drawerFileImageSx}
                              />
                            ))}
                          </Stack>
                        )}

                        <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                          <Stack
                            direction="row"
                            spacing={0.6}
                            alignItems="center"
                            sx={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            <Iconify
                              icon={comment.isLiked ? 'ic:round-favorite' : 'ic:round-favorite-border'}
                              width={18}
                              style={{
                                color: comment.isLiked ? '#e53935' : '#9e9e9e',
                                transition: 'color 0.15s, transform 0.15s',
                                transform: comment.isLiked ? 'scale(1.2)' : 'scale(1)',
                              }}
                            />
                            <Typography
                              variant="caption"
                              fontWeight={500}
                              color={comment.isLiked ? '#e53935' : 'text.secondary'}
                            >
                              {comment.likes ?? 0}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.6} alignItems="center">
                            <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
                            <Typography variant="caption" fontWeight={500} color="text.secondary">
                              {comment.replies}
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

          {/* Pinned message input */}
          <Box sx={{ flexShrink: 0, px: 2, py: 1.5, borderTop: '1px solid #f0f0f0' }}>
            {upload.file && (
              <FileUploadProgress file={upload.file} progress={upload.progress} onCancel={cancelUpload} />
            )}

            {attachedFile && !upload.file && (
              <AttachedFileChip file={attachedFile} onRemove={() => setAttachedFile(null)} />
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
                <IconButton
                  size="small"
                  onClick={(e) => setFileMenuAnchor(e.currentTarget)}
                  sx={{ color: '#9e9e9e', flexShrink: 0 }}
                >
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !upload.file) { e.preventDefault(); handleSend(); } }}
                  placeholder="Write a comment..."
                  fullWidth
                  multiline
                  maxRows={4}
                  sx={{ flex: 1, fontSize: 14, color: 'text.primary', '& textarea': { p: 0 } }}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!commentText.trim() && !attachedFile}
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
                  <Iconify icon="mingcute:send-line" width={18} />
                </IconButton>
              </Box>
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}
