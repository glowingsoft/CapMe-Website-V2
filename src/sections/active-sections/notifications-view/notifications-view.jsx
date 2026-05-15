import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { useLazyGetNotificationsQuery } from 'src/store/Reducer/rooms-api';
import NotificationCard from './components/notification-card';

const PAGE_SIZE = 20;

function NotificationSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        px: 2,
        py: 1.8,
        boxShadow: '0px 10px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.6,
      }}
    >
      <Skeleton variant="circular" width={42} height={42} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="55%" height={18} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="80%" height={14} />
      </Box>
      <Skeleton variant="text" width={40} height={14} sx={{ flexShrink: 0 }} />
    </Box>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i += 1) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function NotificationsView() {
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  const [fetchNotifications] = useLazyGetNotificationsQuery();
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('notificationsDrawerChange', onNotificationsChange);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
    };
  }, []);

  const goToPage = React.useCallback(
    (targetPage) => {
      if (targetPage < 1 || targetPage > totalPages) return;
      setIsLoading(true);
      fetchNotifications({ page: targetPage, limit: PAGE_SIZE })
        .unwrap()
        .then((data) => {
          setItems(data.notifications ?? []);
          setTotalPages(data.totalPages ?? 1);
          setPage(targetPage);
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(() => {
          setItems([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [fetchNotifications, totalPages]
  );

  // Initial load
  React.useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
  const unreadCount = items.filter((n) => n.read === false).length;

  const markAllRead = React.useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = React.useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', overflow: 'hidden', mr: anyRightDrawerOpen ? { md: '420px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box
        ref={scrollRef}
        sx={{
          height: '100%',
          overflowY: 'auto',
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 2, md: 4 },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1120, mx: 'auto' }}>
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>My</Box>
                {' Notifications'}
              </Typography>
              <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                Your real-time activity, all in one place.
              </Typography>
            </Box>

            <Button
              disabled={unreadCount === 0}
              onClick={markAllRead}
              sx={{
                height: 36,
                px: 2,
                borderRadius: 2,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: unreadCount === 0 ? 'rgba(0,0,0,0.06)' : '#4C4EFF',
                color: unreadCount === 0 ? 'text.disabled' : '#fff',
                '&:hover': { bgcolor: unreadCount === 0 ? 'rgba(0,0,0,0.06)' : '#3b3bd6' },
              }}
            >
              Mark all as read
            </Button>
          </Stack>

          {isLoading ? (
            <Stack spacing={1.7} sx={{ width: '100%' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </Stack>
          ) : items.length === 0 ? (
            <EmptyContent
              title="No notifications"
              description="You're all caught up! Check back later for updates."
              sx={{ py: 12 }}
            />
          ) : (
            <Stack spacing={1.7} sx={{ width: '100%' }}>
              {items.map((n) => (
                <NotificationCard key={n.id} notification={n} onClick={() => markRead(n.id)} />
              ))}
            </Stack>
          )}

          {!isLoading && totalPages > 1 && (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mt: 3 }}>
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
                sx={{
                  width: 34,
                  height: 34,
                  border: '1.5px solid',
                  borderColor: page === 1 ? 'rgba(0,0,0,0.10)' : 'rgba(76,78,255,0.35)',
                  borderRadius: 2,
                  color: page === 1 ? 'text.disabled' : '#4C4EFF',
                  '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' },
                }}
              >
                <Iconify icon="solar:alt-arrow-left-bold" width={16} />
              </IconButton>

              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <Typography
                    key={`ellipsis-${idx}`}
                    fontSize={13}
                    sx={{ px: 0.5, color: 'text.disabled', userSelect: 'none' }}
                  >
                    …
                  </Typography>
                ) : (
                  <Box
                    key={p}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToPage(p)}
                    onKeyDown={(e) => { if (e.key === 'Enter') goToPage(p); }}
                    sx={{
                      width: 34,
                      height: 34,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 2,
                      border: '1.5px solid',
                      borderColor: page === p ? '#4C4EFF' : 'rgba(0,0,0,0.10)',
                      bgcolor: page === p ? '#4C4EFF' : 'transparent',
                      color: page === p ? '#fff' : 'text.primary',
                      fontSize: 13,
                      fontWeight: page === p ? 800 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: page === p ? '#3b3bd6' : 'rgba(76,78,255,0.06)',
                        borderColor: '#4C4EFF',
                      },
                    }}
                  >
                    {p}
                  </Box>
                )
              )}

              <IconButton
                size="small"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
                sx={{
                  width: 34,
                  height: 34,
                  border: '1.5px solid',
                  borderColor: page === totalPages ? 'rgba(0,0,0,0.10)' : 'rgba(76,78,255,0.35)',
                  borderRadius: 2,
                  color: page === totalPages ? 'text.disabled' : '#4C4EFF',
                  '&:hover': { bgcolor: 'rgba(76,78,255,0.06)' },
                }}
              >
                <Iconify icon="solar:alt-arrow-right-bold" width={16} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
