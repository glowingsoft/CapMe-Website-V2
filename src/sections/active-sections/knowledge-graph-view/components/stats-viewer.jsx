import {
  Box,
  Typography,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  Drawer,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { NODE_TYPE_COLORS } from '../constants';

function StatsContent({
  statsViewType,
  mergedTopicsList,
  nodesByType,
  getConnectedNodes,
  onMergedTopicClick,
  onNodeSelect,
  onCenterNode,
  pendingCenterRef,
  onClose,
}) {
  const { t } = useTranslate('common');
  const TYPE_META = {
    rooms:    { title: t('knowledge_graph.stats_rooms_title'),    icon: 'solar:buildings-bold',       accent: '#ec4899', accentBg: 'rgba(236,72,153,0.08)' },
    topics:   { title: t('knowledge_graph.stats_topics_title'),   icon: 'solar:tag-bold',             accent: '#4C4EFF', accentBg: 'rgba(76,78,255,0.08)'  },
    messages: { title: t('knowledge_graph.stats_messages_title'), icon: 'solar:chat-round-dots-bold', accent: '#6366f1', accentBg: 'rgba(99,102,241,0.08)' },
  };
  const meta = TYPE_META[statsViewType];
  if (!meta) return null;

  const isTopicsView = statsViewType === 'topics';
  const displayItems = isTopicsView
    ? mergedTopicsList
    : statsViewType === 'rooms'
      ? nodesByType.rooms
      : nodesByType.messages;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: meta.accentBg, display: 'grid', placeItems: 'center' }}>
            <Iconify icon={meta.icon} width={20} sx={{ color: meta.accent }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{meta.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {displayItems.length} {displayItems.length === 1 ? t('knowledge_graph.stats_item') : t('knowledge_graph.stats_items')}
              {isTopicsView && ` · ${t('knowledge_graph.stats_merged')}`}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </Stack>

      {/* ── Scrollable list ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1.5,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
        }}
      >
        {displayItems.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.04)', display: 'grid', placeItems: 'center', mb: 1.5 }}>
              <Iconify icon={meta.icon} width={26} sx={{ color: 'text.disabled' }} />
            </Box>
            <Typography color="text.secondary" fontSize={14}>{t('knowledge_graph.stats_empty', { type: statsViewType })}</Typography>
          </Stack>
        ) : (
          <List disablePadding>
            {displayItems.map((item, index) => {
              /* ── Topics view ── */
              if (isTopicsView) {
                return (
                  <ListItem key={item.displayName + index} disablePadding sx={{ mb: 0.75 }}>
                    <ListItemButton
                      onClick={() => onMergedTopicClick(item)}
                      disableRipple
                      sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.07)',
                        bgcolor: '#fff',
                        px: 1.75,
                        py: 1.1,
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        '&:hover': {
                          bgcolor: '#fff',
                          borderColor: 'rgba(76,78,255,0.25)',
                          boxShadow: '0 2px 12px rgba(76,78,255,0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: meta.accentBg, display: 'grid', placeItems: 'center' }}>
                          <Iconify icon={meta.icon} width={15} sx={{ color: meta.accent }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 0.4 }}>{item.displayName}</Typography>}
                        secondary={
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.4 }}>
                            <Chip
                              icon={<Iconify icon="solar:chat-round-dots-bold" width={11} sx={{ color: '#6366f1' }} />}
                              label={`${item.totalCount} msgs`}
                              size="small"
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                            />
                            {item.rooms.length > 1 && (
                              <Chip
                                icon={<Iconify icon="solar:buildings-bold" width={11} sx={{ color: '#ec4899' }} />}
                                label={`${item.rooms.length} rooms`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }}
                              />
                            )}
                          </Stack>
                        }
                      />
                      <Iconify icon="solar:alt-arrow-right-bold" width={15} sx={{ color: 'text.disabled', ml: 1 }} />
                    </ListItemButton>
                  </ListItem>
                );
              }

              /* ── Rooms / Messages view ── */
              const node = item;
              const connectedMessages = getConnectedNodes(node.id).filter((n) => n.type === 'message');
              const nodeAccent = NODE_TYPE_COLORS[node.type] || '#94a3b8';

              return (
                <ListItem key={node.id} disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton
                    onClick={() => {
                      onNodeSelect(node);
                      pendingCenterRef.current = node.id;
                      onClose();
                      setTimeout(() => onCenterNode(node.id), 400);
                    }}
                    disableRipple
                    sx={{
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.07)',
                      bgcolor: '#fff',
                      px: 1.75,
                      py: 1.1,
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      '&:hover': {
                        bgcolor: '#fff',
                        borderColor: `${nodeAccent}40`,
                        boxShadow: `0 2px 12px ${nodeAccent}15`,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: `${nodeAccent}15`, display: 'grid', placeItems: 'center' }}>
                        <Iconify icon={meta.icon} width={15} sx={{ color: nodeAccent }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 0.4 }}>{node.name}</Typography>}
                      secondary={
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.4 }}>
                          {node.data?.platform && (
                            <Chip
                              label={node.data.platform}
                              size="small"
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                            />
                          )}
                          {statsViewType !== 'messages' && connectedMessages.length > 0 && (
                            <Chip
                              icon={<Iconify icon="solar:chat-round-dots-bold" width={11} sx={{ color: '#6366f1' }} />}
                              label={`${connectedMessages.length} msgs`}
                              size="small"
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                            />
                          )}
                        </Stack>
                      }
                    />
                    <Iconify icon="solar:alt-arrow-right-bold" width={15} sx={{ color: 'text.disabled', ml: 1 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default function StatsViewer({
  open,
  onClose,
  isSmUp,
  statsViewType,
  mergedTopicsList,
  nodesByType,
  getConnectedNodes,
  onMergedTopicClick,
  onNodeSelect,
  onCenterNode,
  pendingCenterRef,
}) {
  const contentProps = {
    statsViewType, mergedTopicsList, nodesByType, getConnectedNodes,
    onMergedTopicClick, onNodeSelect, onCenterNode, pendingCenterRef, onClose,
  };

  if (isSmUp) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#fff',
            borderRadius: 3,
            // fixed height so the inner flex scroll works
            height: '72vh',
            maxHeight: '72vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <StatsContent {...contentProps} />
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#fff',
          borderRadius: '20px 20px 0 0',
          height: '78vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <StatsContent {...contentProps} />
    </Drawer>
  );
}
