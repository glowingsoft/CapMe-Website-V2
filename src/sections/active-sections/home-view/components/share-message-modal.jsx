import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales';
import { chatSocketService } from 'src/socket/chatSocketService';
import { getSocket } from 'src/socket/socket';
import { useLazyGetShareRoomListQuery, useShareMessageMutation } from 'src/store/Reducer/rooms-api';

const PAGE_SIZE = 10;

function buildAttachments(post) {
  if (!Array.isArray(post.attachments)) return [];
  return post.attachments.map((att) => ({
    fileUrl: att.fileUrl ?? att.url ?? '',
    fileName: att.fileName ?? att.name ?? '',
    fileType: att.fileType ?? att.type ?? 'file',
    originalFileName: att.originalFileName ?? att.name ?? att.fileName ?? '',
  }));
}

export default function ShareMessageModal({ open, onClose, post }) {
  const { t } = useTranslate('common');
  const [sharing, setSharing] = useState(null);
  const [sharedRooms, setSharedRooms] = useState(new Set());
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const hasMoreRef = useRef(false);
  const isFetchingRef = useRef(false);
  const sentinelRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const messageId = post?.id ?? post?._id;

  const [fetchRooms, { isFetching }] = useLazyGetShareRoomListQuery();
  const [shareMessageApi] = useShareMessageMutation();

  isFetchingRef.current = isFetching;

  const normalizeRooms = (raw) =>
    (Array.isArray(raw) ? raw : []).map((r) => ({
      id: r._id ?? r.id,
      name: r.name ?? 'Room',
      avatar: r.image ?? r.icon ?? '',
      color: r.color ?? '#4C4EFF',
    }));

  // Reset and fetch page 1 whenever search changes or modal opens
  const loadFirst = useCallback(
    (q) => {
      setIsInitialLoading(true);
      setPage(1);
      setHasMore(false);
      hasMoreRef.current = false;
      fetchRooms({ page: 1, limit: PAGE_SIZE, search: q })
        .unwrap()
        .then((data) => {
          const list = normalizeRooms(data?.body?.rooms ?? data?.rooms ?? data?.body?.data ?? data?.data ?? []);
          setRooms(list);
          const total = data?.metadata?.total_pages ?? data?.body?.metadata?.total_pages ?? data?.totalPages ?? data?.body?.totalPages ?? 1;
          const more = list.length >= PAGE_SIZE || 1 < total;
          hasMoreRef.current = more;
          setHasMore(more);
        })
        .catch(() => setRooms([]))
        .finally(() => setIsInitialLoading(false));
    },
    [fetchRooms]
  );

  // Debounce search input
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchInput]);

  // Reload on search change or modal open
  useEffect(() => {
    if (!open) return;
    loadFirst(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search]);

  // Load next page
  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    const nextPage = page + 1;
    fetchRooms({ page: nextPage, limit: PAGE_SIZE, search })
      .unwrap()
      .then((data) => {
        const list = normalizeRooms(data?.body?.rooms ?? data?.rooms ?? data?.body?.data ?? data?.data ?? []);
        setRooms((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...list.filter((r) => !seen.has(r.id))];
        });
        setPage(nextPage);
        const total = data?.metadata?.total_pages ?? data?.body?.metadata?.total_pages ?? data?.totalPages ?? data?.body?.totalPages ?? 1;
        const more = list.length >= PAGE_SIZE || nextPage < total;
        hasMoreRef.current = more;
        setHasMore(more);
      })
      .catch(() => { hasMoreRef.current = false; setHasMore(false); });
  }, [fetchRooms, page, search]);

  // IntersectionObserver on sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleClose = () => {
    setSharedRooms(new Set());
    setSearchInput('');
    setSearch('');
    onClose();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/message/${messageId}`;
    navigator.clipboard.writeText(link);
    toast.success(t('share_message_modal.toast_link_copied'));
    handleClose();
  };

  const handleShareToRoom = async (roomId) => {
    if (sharing || sharedRooms.has(roomId)) return;
    setSharing(roomId);
    try {
      const res = await shareMessageApi({ messageId, roomId }).unwrap();
      const newCount =
        res?.body?.shareCount ?? res?.shareCount ?? res?.body?.sharesCount ?? res?.sharesCount;

      const socket = getSocket();
      if (socket?.connected) {
        chatSocketService.joinRoom(roomId);
        chatSocketService.sendMessage({
          roomId,
          content: post?.content ?? '',
          attachments: buildAttachments(post),
          meta: {
            ...(post?.meta ?? {}),
            sharedFrom: {
              messageId,
              roomId: post?.roomId,
              roomName: post?.roomname,
              authorName: post?.user?.name,
              authorAvatar: post?.user?.avatar ?? post?.user?.image,
            },
          },
        });
      }

      setSharedRooms((prev) => new Set([...prev, roomId]));
      toast.success(t('share_message_modal.toast_shared'));
      window.dispatchEvent(new CustomEvent('shareMessage', { detail: { messageId, shareCount: newCount } }));
    } catch {
      toast.error(t('share_message_modal.toast_error'));
    } finally {
      setSharing(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography fontWeight={700} fontSize={16}>
          {t('share_message_modal.title')}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 2, pt: 0 }}>
        {/* Copy link */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Iconify icon="mdi:link-variant" width={20} />}
          onClick={handleCopyLink}
          sx={{
            mb: 2,
            borderRadius: 2.5,
            borderColor: '#e0e0e0',
            color: 'text.primary',
            fontWeight: 600,
            py: 1.2,
            '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'rgba(76,78,255,0.04)' },
          }}
        >
          {t('share_message_modal.copy_link')}
        </Button>

        <Divider sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('share_message_modal.or_share')}
          </Typography>
        </Divider>

        {/* Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            mb: 1.5,
            height: 36,
            bgcolor: '#f4f5f9',
            border: '1.5px solid',
            borderColor: searchInput ? '#4C4EFF' : 'transparent',
            borderRadius: 2,
            transition: 'border-color 0.15s',
          }}
        >
          <Iconify icon="eva:search-fill" width={16} style={{ color: searchInput ? '#4C4EFF' : '#9e9e9e', flexShrink: 0 }} />
          <InputBase
            placeholder={t('share_message_modal.search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, fontSize: 13, '& input': { p: 0 } }}
          />
          {searchInput && (
            <Iconify
              icon="eva:close-fill"
              width={14}
              onClick={() => setSearchInput('')}
              style={{ color: '#9e9e9e', cursor: 'pointer', flexShrink: 0 }}
            />
          )}
        </Box>

        {isInitialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} sx={{ color: '#4C4EFF' }} />
          </Box>
        ) : rooms.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            {t('share_message_modal.no_rooms')}
          </Typography>
        ) : (
          <Stack spacing={0.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {rooms.map((room) => {
              const done = sharedRooms.has(room.id);
              const loading = sharing === room.id;
              return (
                <Box
                  key={room.id}
                  onClick={() => handleShareToRoom(room.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    cursor: done ? 'default' : 'pointer',
                    opacity: done ? 0.6 : 1,
                    '&:hover': { bgcolor: done ? 'transparent' : 'rgba(76,78,255,0.06)' },
                  }}
                >
                  <Avatar
                    src={room.avatar || undefined}
                    sx={{ width: 36, height: 36, bgcolor: room.color, fontWeight: 700, fontSize: 14 }}
                  >
                    {room.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }} noWrap>
                    {room.name}
                  </Typography>
                  {loading ? (
                    <CircularProgress size={18} sx={{ color: '#4C4EFF' }} />
                  ) : done ? (
                    <Iconify icon="mdi:check-circle" width={18} sx={{ color: '#43a047' }} />
                  ) : (
                    <Iconify icon="mingcute:send-line" width={18} sx={{ color: '#9e9e9e' }} />
                  )}
                </Box>
              );
            })}

            {isFetching && !isInitialLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                <CircularProgress size={20} sx={{ color: '#4C4EFF' }} />
              </Box>
            )}
            {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
