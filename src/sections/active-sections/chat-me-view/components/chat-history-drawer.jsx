import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { ConfirmModal } from 'src/components/custom-dialog';
import DrawerHeader from 'src/sections/active-sections/home-view/components/drawer-header';
import { useDeleteAllAiChatsMutation, useLazyGetAiHistoryQuery } from 'src/store/Reducer/ai-api';

const CHAT_HISTORY_GROUP_ORDER = ['today', 'yesterday', 'this_week', 'older'];

function HistorySkeleton() {
  return (
    <Box sx={{ px: 2.5, py: 1.2 }}>
      <Skeleton variant="text" width="72%" height={18} />
      <Skeleton variant="text" width="38%" height={14} />
    </Box>
  );
}

function formatHistoryTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <Box
          component="img"
          src="/logo/logo-single.svg"
          alt="Capme"
          sx={{ width: 56, height: 56, objectFit: 'contain' }}
        />
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
              bgcolor: '#f5f5f5',
              borderRadius: 10,
              border: '1px solid #ebebeb',
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
              bgcolor: '#4C4EFF',
              color: '#fff',
              flexShrink: 0,
              alignSelf: 'center',
              '&:hover': { bgcolor: '#3b3bd6' },
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
            <Typography sx={{ px: 2.5, pt: 2, pb: 0.5, fontSize: 13, fontWeight: 800, color: '#4C4EFF' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 1 }}>
            <Iconify icon="solar:danger-triangle-bold" width={40} style={{ color: '#e0e0e0' }} />
            <Typography fontSize={14} color="text.disabled">
              {t('chat_history.load_error')}
            </Typography>
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 1 }}>
            <Iconify icon="solar:history-bold" width={40} style={{ color: '#e0e0e0' }} />
            <Typography fontSize={14} color="text.disabled">
              {t('chat_history.empty_title')}
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, gap: 1 }}>
            <Iconify icon="mingcute:search-line" width={36} style={{ color: '#e0e0e0' }} />
            <Typography fontSize={14} color="text.disabled">
              {t('chat_history.no_results', { search })}
            </Typography>
          </Box>
        ) : (
          groupOrder.filter((g) => grouped[g]?.length).map((group) => (
            <Box key={group}>
              <Typography
                sx={{ px: 2.5, pt: 2, pb: 0.5, fontSize: 13, fontWeight: 800, color: '#4C4EFF', letterSpacing: 0.2 }}
              >
                {CHAT_HISTORY_GROUP_ORDER.includes(group) ? t(`chat_history.group_${group}`) : group}
              </Typography>

              {grouped[group].map((item) => (
                <Box key={item.id}>
                  <Box
                    onClick={() => onChatSelect?.(item)}
                    sx={{
                      px: 2.5,
                      py: 1.2,
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      borderRadius: 1.5,
                      transition: 'background 0.12s',
                      '&:hover': { bgcolor: '#f7f7f7', borderColor: '#4C4EFF' },
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 14, fontWeight: item.description ? 700 : 400, color: '#111827' }}
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
                      <Typography
                        sx={{ fontSize: 11.5, color: 'text.disabled', mt: item.description ? 0.35 : 0.25 }}
                        noWrap
                      >
                        {formatHistoryTime(item.createdAt)}
                      </Typography>
                    ) : null}
                  </Box>
                  <Divider sx={{ mx: 2.5 }} />
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
              sx={{
                color: '#4C4EFF',
                bgcolor: 'rgba(76,78,255,0.08)',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(76,78,255,0.14)' },
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
      <Box sx={{ p: 2.5, flexShrink: 0 }}>
        <Button
          fullWidth
          onClick={() => setConfirmClearOpen(true)}
          disabled={isDeletingChats || history.length === 0}
          sx={{
            bgcolor: '#4C4EFF',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2.5,
            py: 1.4,
            textTransform: 'none',
            '&.Mui-disabled': { bgcolor: '#4C4EFF', color: '#fff', opacity: 0.45 },
            '&:hover': { bgcolor: '#3b3bd6' },
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
