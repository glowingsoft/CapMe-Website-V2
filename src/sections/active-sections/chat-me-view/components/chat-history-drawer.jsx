import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { ConfirmModal } from 'src/components/custom-dialog';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import { useDeleteAllAiChatsMutation, useLazyGetAiHistoryQuery } from 'src/store/Reducer/ai-api';

const CHAT_HISTORY_GROUP_ORDER = ['today', 'yesterday', 'this_week', 'older'];

function HistorySkeleton() {
  return (
    <Box sx={{ px: 2.5, py: 1.4 }}>
      <Skeleton variant="text" width="72%" height={18} sx={{ borderRadius: 1 }} />
      <Skeleton variant="text" width="38%" height={14} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

function formatHistoryTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function EmptyStateCard({ icon, title, subtitle, color = '#4C4EFF' }) {
  return (
    <Box
      sx={{
        mx: 2.5,
        mt: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(248,249,251,0.90) 100%)',
        border: '1.5px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}14`,
          boxShadow: `0 4px 16px ${color}22`,
        }}
      >
        <Iconify icon={icon} width={26} style={{ color }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827', mb: 0.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ChatHistoryDrawer({ open, onClose, onChatSelect, onNewChat, onHistoryCleared }) {
  const { t } = useTranslate('common');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [fetchHistory, { isFetching, isError }] = useLazyGetAiHistoryQuery();
  const [deleteAllChats, { isLoading: isDeletingChats }] = useDeleteAllAiChatsMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setHistory([]);
    setHasLoaded(false);
  }, [open, debouncedSearch]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    fetchHistory({ pageno: page, search: debouncedSearch })
      .unwrap()
      .then((data) => {
        if (!active) return;
        const nextItems = (data?.items ?? []).filter((item) => item.group !== 'prompts');
        setHasMore(Boolean(data?.hasMore));
        setHistory((prev) => {
          if (page === 1) return nextItems;
          const seen = new Set(prev.map((item) => String(item.id)));
          return [...prev, ...nextItems.filter((item) => !seen.has(String(item.id)))];
        });
        setHasLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        if (page === 1) setHistory([]);
        setHasMore(false);
        setHasLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [open, page, debouncedSearch, fetchHistory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => item.text.toLowerCase().includes(q));
  }, [history, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of filtered) {
      if (!map[item.group]) map[item.group] = [];
      map[item.group].push(item);
    }
    return map;
  }, [filtered]);

  const groupOrder = useMemo(() => {
    const extraGroups = Object.keys(grouped).filter((group) => !CHAT_HISTORY_GROUP_ORDER.includes(group));
    return [...CHAT_HISTORY_GROUP_ORDER, ...extraGroups];
  }, [grouped]);

  const handleConfirmClear = async () => {
    try {
      await deleteAllChats().unwrap();
      setHistory([]);
      setPage(1);
      setHasMore(false);
      setConfirmClearOpen(false);
      onHistoryCleared?.();
    } catch {
      setConfirmClearOpen(false);
    }
  };

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
            overflow: 'hidden',
          },
        }}
      >
        {/* ── Header ── */}
        <DrawerHeader title={t('chat_history.title')} onBack={onClose} showEdit={false} showShare={false} />

        {/* ── Logo ── */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, pb: 1.5, flexShrink: 0 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(76,78,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              component="img"
              src={`${import.meta.env.BASE_URL}logo/logo-single.svg`}
              alt="Capme"
              sx={{ width: 56, height: 56, objectFit: 'contain', position: 'relative' }}
            />
          </Box>
        </Box>

        {/* ── Search + New chat ── */}
        <Box sx={{ px: 2.5, pb: 2, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.9,
                bgcolor: '#f8f9fb',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                '&:focus-within': {
                  borderColor: '#4C4EFF',
                  boxShadow: '0 0 0 3px rgba(76,78,255,0.10)',
                },
              }}
            >
              <Iconify icon="mingcute:search-line" width={18} style={{ color: '#9e9e9e', flexShrink: 0 }} />
              <InputBase
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('chat_history.search_placeholder')}
                sx={{ flex: 1, fontSize: 14, '& input': { p: 0 } }}
              />
              {search && (
                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.2 }}>
                  <Iconify icon="mingcute:close-line" width={14} style={{ color: '#9e9e9e' }} />
                </IconButton>
              )}
            </Box>

            <IconButton
              onClick={onNewChat}
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
                color: '#fff',
                flexShrink: 0,
                alignSelf: 'center',
                boxShadow: '0 4px 12px rgba(76,78,255,0.30)',
                transition: 'all 0.18s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
                  boxShadow: '0 6px 16px rgba(76,78,255,0.40)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Iconify icon="mingcute:add-line" width={20} />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* ── History list ── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.1) transparent',
            '&::-webkit-scrollbar': { width: '3px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
          }}
        >
          {(!hasLoaded && page === 1) || (isFetching && page === 1) ? (
            <Box>
              <Typography sx={{ px: 2.5, pt: 2, pb: 0.5, fontSize: 11.5, fontWeight: 800, color: '#4C4EFF', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {t('chat_history.loading')}
              </Typography>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item}>
                  <HistorySkeleton />
                  <Divider sx={{ mx: 2.5 }} />
                </Box>
              ))}
            </Box>
          ) : isError ? (
            <EmptyStateCard
              icon="solar:danger-triangle-bold"
              title={t('chat_history.load_error')}
              subtitle="Please try again later"
              color="#EF4444"
            />
          ) : history.length === 0 ? (
            <EmptyStateCard
              icon="solar:history-bold"
              title={t('chat_history.empty_title')}
              subtitle="Start a conversation to see your history here"
              color="#4C4EFF"
            />
          ) : filtered.length === 0 ? (
            <EmptyStateCard
              icon="mingcute:search-line"
              title={t('chat_history.no_results', { search })}
              subtitle="Try a different search term"
              color="#6B7280"
            />
          ) : (
            groupOrder.filter((g) => grouped[g]?.length).map((group) => (
              <Box key={group}>
                {/* Group label */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, pt: 2, pb: 0.75 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#4C4EFF',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{ fontSize: 11.5, fontWeight: 800, color: '#4C4EFF', letterSpacing: 0.6, textTransform: 'uppercase' }}
                  >
                    {CHAT_HISTORY_GROUP_ORDER.includes(group) ? t(`chat_history.group_${group}`) : group}
                  </Typography>
                </Stack>

                {grouped[group].map((item) => (
                  <Box key={item.id}>
                    <Box
                      onClick={() => onChatSelect?.(item)}
                      sx={{
                        px: 2.5,
                        py: 1.2,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.12s',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          bgcolor: '#4C4EFF',
                          opacity: 0,
                          transition: 'opacity 0.15s',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(76,78,255,0.04)',
                          '&::before': { opacity: 1 },
                        },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 14, fontWeight: item.description ? 700 : 500, color: '#111827' }}
                        noWrap
                      >
                        {item.text}
                      </Typography>
                      {item.description ? (
                        <Typography
                          sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}
                          noWrap
                        >
                          {item.description}
                        </Typography>
                      ) : null}
                      {item.createdAt ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            mt: item.description ? 0.5 : 0.4,
                            px: 0.8,
                            py: 0.2,
                            bgcolor: 'rgba(0,0,0,0.04)',
                            borderRadius: 1,
                          }}
                        >
                          <Iconify icon="mingcute:time-line" width={11} style={{ color: '#9ca3af' }} />
                          <Typography sx={{ fontSize: 11, color: '#9ca3af', lineHeight: 1 }}>
                            {formatHistoryTime(item.createdAt)}
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                    <Divider sx={{ mx: 2.5, borderColor: 'rgba(0,0,0,0.05)' }} />
                  </Box>
                ))}
              </Box>
            ))
          )}

          {!isFetching && hasMore && filtered.length > 0 && (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Button
                fullWidth
                onClick={() => setPage((prev) => prev + 1)}
                startIcon={<Iconify icon="mingcute:arrow-down-line" width={16} />}
                sx={{
                  color: '#4C4EFF',
                  bgcolor: 'rgba(76,78,255,0.07)',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: '1px solid rgba(76,78,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(76,78,255,0.13)', borderColor: '#4C4EFF' },
                }}
              >
                {t('chat_history.load_more')}
              </Button>
            </Box>
          )}

          {isFetching && page > 1 && (
            <Box>
              {[1, 2].map((item) => (
                <Box key={item}>
                  <HistorySkeleton />
                  <Divider sx={{ mx: 2.5 }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ── Clear History ── */}
        <Box sx={{ p: 2.5, flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Button
            fullWidth
            onClick={() => setConfirmClearOpen(true)}
            disabled={isDeletingChats || history.length === 0}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 2.5,
              py: 1.4,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(239,68,68,0.28)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 6px 20px rgba(239,68,68,0.38)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                background: 'rgba(239,68,68,0.18)',
                color: 'rgba(239,68,68,0.45)',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {t('chat_history.clear_btn')}
          </Button>
        </Box>
      </Drawer>

      <ConfirmModal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title={t('chat_history.confirm_title')}
        description={t('chat_history.confirm_description')}
        confirmLabel={t('chat_history.confirm_delete')}
        cancelLabel={t('chat_history.confirm_cancel')}
        loading={isDeletingChats}
        icon="solar:trash-bin-trash-bold"
        iconColor="#C40000"
        confirmColor="#C40000"
      />
    </>
  );
}
