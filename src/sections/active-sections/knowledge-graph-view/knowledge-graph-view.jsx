import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { useGetknowledgeGraphVisualsQuery } from 'src/store/Reducer/users-api';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { NODE_TYPE_COLORS } from './constants';
import MessageItem from './components/message-item';
import StatsViewer from './components/stats-viewer';

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect;
      if (!cr) return;
      setSize({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const getTypeIcon = (type) => {
  switch (type) {
    case 'room': return 'solar:buildings-bold';
    case 'topic': return 'solar:tag-bold';
    case 'message': return 'solar:chat-round-dots-bold';
    case 'emotion': return 'solar:emoji-funny-square-bold';
    default: return 'solar:circle-bold';
  }
};


const CARD_SX = {
  bgcolor: '#fff',
  borderRadius: 3,
  boxShadow: '0px 8px 20px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.06)',
  overflow: 'hidden',
};

// ── Node detail panel (shared by desktop sidebar + mobile drawer) ──────────────

function NodeDetailPanel({
  selectedNode,
  selectedTopicMerged,
  roomMessages,
  topicDetails,
  connectedToSelected,
  getConnectedNodes,
  onNodeSelect,
}) {
  const { t } = useTranslate('common');
  return (
    <>
      {/* Header — sticky */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.25, py: 1.75, borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0, bgcolor: '#fff', zIndex: 1 }}
      >
        <Typography fontWeight={800} fontSize={14}>{t('knowledge_graph.node_details_header')}</Typography>
        <IconButton size="small" onClick={() => onNodeSelect(null)} sx={{ color: 'text.disabled' }}>
          <Iconify icon="solar:close-circle-bold" width={19} />
        </IconButton>
      </Stack>

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
        }}
      >
        <Box sx={{ p: 2.25 }}>

          {/* Identity card */}
          <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', mb: 2.25 }}>
            <Box sx={{ height: 3, bgcolor: selectedNode.color }} />
            <Box sx={{ p: 1.75 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: `${selectedNode.color}18`, display: 'grid', placeItems: 'center' }}>
                  <Iconify icon={getTypeIcon(selectedNode.type)} width={18} sx={{ color: selectedNode.color }} />
                </Box>
                <Chip
                  label={(selectedNode.type || '').toUpperCase()}
                  size="small"
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, letterSpacing: 0.5, bgcolor: `${selectedNode.color}18`, color: selectedNode.color, '&:hover': { bgcolor: `${selectedNode.color}18` } }}
                />
              </Stack>
              <Typography fontWeight={800} fontSize={14} sx={{ wordBreak: 'break-word' }}>
                {selectedNode.name}
              </Typography>
              {selectedNode.type === 'topic' && selectedTopicMerged && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mt: 0.875 }}>
                  <Chip
                    icon={<Iconify icon="solar:chat-round-dots-bold" width={11} sx={{ color: '#6366f1' }} />}
                    label={`${selectedTopicMerged.totalCount} msgs total`}
                    size="small"
                    sx={{ height: 19, fontSize: '0.63rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                  />
                  {selectedTopicMerged.rooms.length > 1 && (
                    <Chip
                      icon={<Iconify icon="solar:buildings-bold" width={11} sx={{ color: '#ec4899' }} />}
                      label={`${selectedTopicMerged.rooms.length} rooms`}
                      size="small"
                      sx={{ height: 19, fontSize: '0.63rem', fontWeight: 700, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }}
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Data fields */}
          {selectedNode.data && Object.keys(selectedNode.data).length > 0 && (
            <Box sx={{ mb: 2.25 }}>
              <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.1, display: 'block', fontSize: '0.63rem', color: '#374151' }}>
                {t('knowledge_graph.node_details_section')}
              </Typography>
              <Stack spacing={1.1}>
                {selectedNode.data.caption && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_caption')}</Typography>
                    <Typography fontSize={13}>{selectedNode.data.caption}</Typography>
                  </Box>
                )}
                {selectedNode.data.platform && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.3 }}>{t('knowledge_graph.field_platform')}</Typography>
                    <Chip label={selectedNode.data.platform} size="small" sx={{ height: 21, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: '#111827', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }} />
                  </Box>
                )}
                {selectedNode.data.importance && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.3 }}>{t('knowledge_graph.field_importance')}</Typography>
                    <Chip
                      label={selectedNode.data.importance}
                      size="small"
                      sx={{
                        height: 21, fontSize: '0.72rem', fontWeight: 700,
                        bgcolor: selectedNode.data.importance === 'high' ? 'rgba(239,68,68,0.08)' : selectedNode.data.importance === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.05)',
                        color: selectedNode.data.importance === 'high' ? '#ef4444' : selectedNode.data.importance === 'medium' ? '#f59e0b' : 'text.secondary',
                        '&:hover': { bgcolor: selectedNode.data.importance === 'high' ? 'rgba(239,68,68,0.08)' : selectedNode.data.importance === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.05)' },
                      }}
                    />
                  </Box>
                )}
                {selectedNode.type === 'message' && selectedNode.data.emotion && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.4 }}>{t('knowledge_graph.field_emotion')}</Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Chip
                        icon={<Iconify icon="solar:emoji-funny-square-bold" width={12} />}
                        label={selectedNode.data.emotion.sentiment}
                        size="small"
                        sx={{
                          height: 21, fontSize: '0.68rem', fontWeight: 700,
                          bgcolor: selectedNode.data.emotion.sentiment === 'positive' ? 'rgba(16,185,129,0.08)' : selectedNode.data.emotion.sentiment === 'negative' ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.05)',
                          color: selectedNode.data.emotion.sentiment === 'positive' ? '#10b981' : selectedNode.data.emotion.sentiment === 'negative' ? '#ef4444' : 'text.secondary',
                          '&:hover': { bgcolor: 'inherit' },
                        }}
                      />
                      <Chip
                        label={`${(selectedNode.data.emotion.confidence * 100).toFixed(0)}${t('knowledge_graph.confidence_suffix')}`}
                        size="small"
                        sx={{ height: 21, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                      />
                    </Stack>
                  </Box>
                )}
                {selectedNode.type === 'message' && selectedNode.data.topicCount > 0 && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.4 }}>{t('knowledge_graph.field_topics')}</Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.4 }}>
                      {getConnectedNodes(selectedNode.id).filter((n) => n.type === 'topic').map((topic) => (
                        <Chip
                          key={topic.id}
                          icon={<Iconify icon="solar:tag-bold" width={11} sx={{ color: '#4C4EFF' }} />}
                          label={topic.name}
                          size="small"
                          onClick={() => onNodeSelect(topic)}
                          sx={{ height: 21, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'rgba(76,78,255,0.07)', color: '#4C4EFF', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' } }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {selectedNode.data.url && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_url')}</Typography>
                    <Typography component="a" href={selectedNode.data.url} target="_blank" rel="noopener noreferrer"
                      sx={{ color: '#4C4EFF', fontSize: 12.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, wordBreak: 'break-all' }}>
                      {selectedNode.data.url}
                    </Typography>
                  </Box>
                )}
                {selectedNode.data.created_at && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_created')}</Typography>
                    <Typography fontSize={12.5}>{new Date(selectedNode.data.created_at).toLocaleString()}</Typography>
                  </Box>
                )}
                {selectedNode.data.messageCount && (
                  <Box>
                    <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_message_count')}</Typography>
                    <Typography fontSize={12.5} fontWeight={700}>{selectedNode.data.messageCount}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Room → messages */}
          {selectedNode.type === 'room' && roomMessages.length > 0 && (
            <>
              <Divider sx={{ mb: 1.75 }} />
              <Stack direction="row" alignItems="center" spacing={1} mb={0.875}>
                <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: 'rgba(99,102,241,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Iconify icon="solar:chat-round-dots-bold" width={14} sx={{ color: '#6366f1' }} />
                </Box>
                <Typography fontWeight={700} fontSize={13} sx={{ flex: 1 }}>{t('knowledge_graph.room_messages_title')}</Typography>
                <Chip label={roomMessages.length} size="small" sx={{ height: 19, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }} />
              </Stack>
              <Typography fontSize={11} sx={{ mb: 0.875, color: '#374151' }}>
                {t('knowledge_graph.room_messages_hint')}
              </Typography>
              {roomMessages.map(({ msg, topics }) => (
                <MessageItem key={msg.id} msg={msg} topics={topics} onNodeClick={onNodeSelect} />
              ))}
            </>
          )}

          {/* Topic → rooms with messages */}
          {selectedNode.type === 'topic' && topicDetails.roomsWithMessages.length > 0 && (
            <>
              <Divider sx={{ mb: 1.75 }} />
              <Stack direction="row" alignItems="center" spacing={1} mb={0.875}>
                <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: 'rgba(236,72,153,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Iconify icon="solar:buildings-bold" width={14} sx={{ color: '#ec4899' }} />
                </Box>
                <Typography fontWeight={700} fontSize={13} sx={{ flex: 1 }}>{t('knowledge_graph.topic_rooms_title')}</Typography>
                <Chip label={topicDetails.roomsWithMessages.length} size="small" sx={{ height: 19, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }} />
              </Stack>
              <Typography fontSize={11} sx={{ mb: 1.25, color: '#374151' }}>
                {t('knowledge_graph.room_messages_hint')}
              </Typography>
              <Stack spacing={1.25}>
                {topicDetails.roomsWithMessages.map(({ room, messages }) => (
                  <Box key={room.id}>
                    <Box
                      onClick={() => onNodeSelect(room)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.875,
                        px: 1.25, py: 0.875, mb: 0.625, borderRadius: 1.5,
                        bgcolor: 'rgba(236,72,153,0.04)',
                        border: '1px solid rgba(236,72,153,0.14)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                        '&:hover': { borderColor: 'rgba(236,72,153,0.28)' },
                      }}
                    >
                      <Box sx={{ width: 20, height: 20, borderRadius: '5px', bgcolor: '#ec4899', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Iconify icon="solar:buildings-bold" width={12} sx={{ color: '#fff' }} />
                      </Box>
                      <Typography fontSize={12.5} fontWeight={700} sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ec4899' }}>
                        {room.name}
                      </Typography>
                      {room.data?.platform && (
                        <Chip label={room.data.platform} size="small" sx={{ height: 17, fontSize: '0.58rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', flexShrink: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }} />
                      )}
                      <Chip
                        icon={<Iconify icon="solar:chat-round-dots-bold" width={9} sx={{ color: '#6366f1' }} />}
                        label={messages.length}
                        size="small"
                        sx={{ height: 17, fontSize: '0.58rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', flexShrink: 0, '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                      />
                    </Box>
                    <Box sx={{ pl: 0.875 }}>
                      {messages.map(({ msg, topics }) => (
                        <MessageItem key={msg.id} msg={msg} topics={topics} onNodeClick={onNodeSelect} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          {/* Other → connected nodes */}
          {selectedNode.type !== 'room' && selectedNode.type !== 'topic' && (
            <>
              <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.1, display: 'block', fontSize: '0.63rem', color: '#374151' }}>
                {t('knowledge_graph.connected_nodes')}
              </Typography>
              <Stack spacing={0.625}>
                {connectedToSelected.slice(0, 10).map((n) => {
                  if (!n) return null;
                  return (
                    <Box
                      key={n.id}
                      onClick={() => onNodeSelect(n)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.875,
                        px: 1.25, py: 0.75, borderRadius: 1.5,
                        border: `1px solid ${n.color}28`,
                        bgcolor: `${n.color}06`,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                        '&:hover': { borderColor: `${n.color}45` },
                      }}
                    >
                      <Iconify icon={getTypeIcon(n.type)} width={15} sx={{ color: n.color, flexShrink: 0 }} />
                      <Typography fontSize={12.5} fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

function KnowledgeGraphView() {
  const { t } = useTranslate('common');
  const currentUser = useSelector(selectUser);
  const userId = String(currentUser?.id ?? currentUser?._id ?? currentUser?.basicInfo?._id ?? '');

  const STAT_CONFIG = [
    { key: 'totalMessages', label: t('knowledge_graph.stat_messages'), icon: 'solar:chat-round-dots-bold', type: 'messages', accent: '#6366f1', accentBg: 'rgba(99,102,241,0.08)' },
    { key: 'totalRooms',    label: t('knowledge_graph.stat_rooms'),    icon: 'solar:buildings-bold',       type: 'rooms',    accent: '#ec4899', accentBg: 'rgba(236,72,153,0.08)' },
    { key: 'totalTopics',   label: t('knowledge_graph.stat_topics'),   icon: 'solar:tag-bold',             type: 'topics',   accent: '#4C4EFF', accentBg: 'rgba(76,78,255,0.08)' },
  ];

  const LEGEND = [
    { color: NODE_TYPE_COLORS.room,    label: t('knowledge_graph.legend_room'),    shape: '4px' },
    { color: NODE_TYPE_COLORS.message, label: t('knowledge_graph.legend_message'), shape: '50%' },
    { color: NODE_TYPE_COLORS.topic,   label: t('knowledge_graph.legend_topic'),   shape: '50%' },
    { color: NODE_TYPE_COLORS.link,    label: t('knowledge_graph.legend_link'),    shape: 'triangle' },
  ];

  const { data, isLoading, error } = useGetknowledgeGraphVisualsQuery(
    { userId },
    { skip: !userId }
  );

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  // right-drawer margin (same pattern as notifications/explore)
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  useEffect(() => {
    const onAccount = (e) => setAccountDrawerOpen(e.detail);
    const onProfile = (e) => setProfileDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccount);
    window.addEventListener('profileDrawerChange', onProfile);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccount);
      window.removeEventListener('profileDrawerChange', onProfile);
    };
  }, []);
  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen;

  // graph state
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const [statsViewOpen, setStatsViewOpen] = useState(false);
  const [statsViewType, setStatsViewType] = useState(null);
  const [highlightedRoomId, setHighlightedRoomId] = useState(null);

  // fullscreen
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const [graphWrapRef, graphWrapSize] = useElementSize();
  const fgRef = useRef(null);
  const pendingCenterRef = useRef(null);

  // ── Graph data ──────────────────────────────────────────────────────────────

  const graphData = useMemo(() => {
    const rawNodes = data?.body?.nodes || [];
    const rawEdges = data?.body?.edges || [];

    const filteredNodes = rawNodes.filter(
      (n) => n.type !== 'interest' && n.label?.toLowerCase() !== 'uncategorized'
    );

    const getDisplayName = (n) =>
      n.type === 'message'
        ? n.data?.content?.trim() || n.data?.caption?.trim() || n.label
        : n.label;

    const nodes = filteredNodes.map((n) => {
      const type = n.type || 'default';
      const color = NODE_TYPE_COLORS[type] || NODE_TYPE_COLORS.default;
      const nodeSize = type === 'topic' ? Math.max(8, (n.size || 12) * 0.6) : n.size;
      return {
        id: n.id,
        name: getDisplayName(n),
        type,
        color,
        size: nodeSize,
        shape: n.shape,
        data: n.data,
        val: Math.max(4, (nodeSize || 12) / 2),
      };
    });

    const validIds = new Set(nodes.map((n) => n.id));
    const links = rawEdges
      .filter((e) => validIds.has(e.from) && validIds.has(e.to))
      .map((e) => ({
        source: e.from,
        target: e.to,
        label: e.label,
        type: e.type,
        color: e.color?.color || '#94a3b8',
        width: e.width || 1,
        dashed: e.dashes || false,
      }));

    return { nodes, links };
  }, [data]);

  // ── Merged topics ───────────────────────────────────────────────────────────

  const mergedTopicsMap = useMemo(() => {
    const map = new Map();
    graphData.nodes.filter((n) => n.type === 'topic').forEach((topicNode) => {
      const nameKey = topicNode.name.toLowerCase().trim();
      const roomId = topicNode.data?.roomId;
      const count = topicNode.data?.messageCount || 0;
      const roomNode = graphData.nodes.find((n) => n.id === roomId && n.type === 'room');
      const roomName = roomNode?.name || 'Unknown Room';

      if (map.has(nameKey)) {
        const ex = map.get(nameKey);
        ex.totalCount += count;
        ex.nodeIds.push(topicNode.id);
        const exRoom = ex.rooms.find((r) => r.roomId === roomId);
        if (exRoom) { exRoom.count += count; }
        else { ex.rooms.push({ roomName, roomId, count }); }
      } else {
        map.set(nameKey, { displayName: topicNode.name, totalCount: count, nodeIds: [topicNode.id], rooms: [{ roomName, roomId, count }] });
      }
    });
    return map;
  }, [graphData.nodes]);

  const mergedTopicsList = useMemo(
    () => Array.from(mergedTopicsMap.values()).sort((a, b) => b.totalCount - a.totalCount),
    [mergedTopicsMap]
  );

  const stats = useMemo(() => {
    const raw = data?.body?.stats || { totalMessages: 0, totalRooms: 0, totalTopics: 0 };
    return { ...raw, totalTopics: mergedTopicsMap.size };
  }, [data, mergedTopicsMap]);

  const nodesByType = useMemo(() => ({
    rooms: graphData.nodes.filter((n) => n.type === 'room'),
    topics: graphData.nodes.filter((n) => n.type === 'topic'),
    messages: graphData.nodes.filter((n) => n.type === 'message'),
  }), [graphData.nodes]);

  // ── Graph helpers ───────────────────────────────────────────────────────────

  const getConnectedNodes = useCallback((nodeId) => {
    const connected = [];
    graphData.links.forEach((link) => {
      const s = link.source?.id ?? link.source;
      const t = link.target?.id ?? link.target;
      if (s === nodeId) { const n = graphData.nodes.find((x) => x.id === t); if (n) connected.push(n); }
      if (t === nodeId) { const n = graphData.nodes.find((x) => x.id === s); if (n) connected.push(n); }
    });
    return connected;
  }, [graphData.links, graphData.nodes]);

  const getRoomsForTopic = useCallback((topicId) => {
    const rooms = new Set();
    getConnectedNodes(topicId)
      .filter((n) => n.type === 'message')
      .forEach((msg) => getConnectedNodes(msg.id).filter((n) => n.type === 'room').forEach((r) => rooms.add(r)));
    return Array.from(rooms);
  }, [getConnectedNodes]);

  const centerOnNode = useCallback((nodeId) => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    const attempt = (left) => {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (!node || node.x == null) { if (left > 0) setTimeout(() => attempt(left - 1), 100); return; }
      fg.centerAt(node.x, node.y, 800);
      fg.zoom(2.5, 800);
      setHighlightedRoomId(nodeId);
      setTimeout(() => setHighlightedRoomId(null), 3000);
    };
    attempt(10);
  }, [graphData.nodes]);

  // ── D3 forces ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!fgRef.current) return;
    const timer = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;
      fg.d3Force('charge').strength(-400);
      fg.d3Force('link').distance((link) => {
        const s = link.source?.type ?? '';
        const t = link.target?.type ?? '';
        if ((s === 'room' && t === 'message') || (s === 'message' && t === 'room')) return 180;
        if ((s === 'message' && t === 'topic') || (s === 'topic' && t === 'message')) return 130;
        if (s === 'topic' || t === 'topic') return 110;
        return 120;
      });
      if (fg.d3Force('collision')) fg.d3Force('collision').radius((n) => n.val * 2.5 + 12);
      fg.d3ReheatSimulation();
    }, 100);
    return () => clearTimeout(timer);
  }, [graphData]);

  useEffect(() => {
    if (!statsViewOpen && pendingCenterRef.current) {
      const nodeId = pendingCenterRef.current;
      pendingCenterRef.current = null;
      setTimeout(() => centerOnNode(nodeId), 500);
    }
  }, [statsViewOpen, centerOnNode]);

  // ── Canvas painters ─────────────────────────────────────────────────────────

  const handleNodeHover = useCallback((node) => {
    setHoverNode(node);
    if (!node) { setHighlightNodes(new Set()); setHighlightLinks(new Set()); return; }
    const neighbors = new Set();
    const linkSet = new Set();
    graphData.links.forEach((link) => {
      const s = link.source?.id ?? link.source;
      const t = link.target?.id ?? link.target;
      if (s === node.id) { neighbors.add(t); linkSet.add(link); }
      if (t === node.id) { neighbors.add(s); linkSet.add(link); }
    });
    setHighlightNodes(neighbors);
    setHighlightLinks(linkSet);
  }, [graphData.links]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || '';
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    const isHL = highlightNodes.has(node.id) || hoverNode?.id === node.id;
    const isRoomHL = highlightedRoomId === node.id;

    const applyGlow = () => {
      ctx.shadowBlur = isRoomHL ? 30 : 15;
      ctx.shadowColor = isRoomHL ? '#ffffff' : node.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = (isRoomHL ? 3 : 2) / globalScale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    if (node.type === 'message' && (node.data?.isLinkOnly || node.data?.hasLink)) {
      const half = node.val;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y - half);
      ctx.lineTo(node.x - half, node.y + half);
      ctx.lineTo(node.x + half, node.y + half);
      ctx.closePath();
      ctx.fillStyle = NODE_TYPE_COLORS.link;
      ctx.fill();
      if (isHL || isRoomHL) applyGlow();
    } else if (node.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y - node.val);
      ctx.lineTo(node.x + node.val, node.y);
      ctx.lineTo(node.x, node.y + node.val);
      ctx.lineTo(node.x - node.val, node.y);
      ctx.closePath();
      ctx.fillStyle = NODE_TYPE_COLORS.link;
      ctx.fill();
      if (isHL || isRoomHL) applyGlow();
    } else if (node.shape === 'star') {
      const spikes = 5;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? node.val : node.val * 0.5;
        const angle = (Math.PI / spikes) * i - Math.PI / 2;
        if (i === 0) ctx.moveTo(node.x + Math.cos(angle) * r, node.y + Math.sin(angle) * r);
        else ctx.lineTo(node.x + Math.cos(angle) * r, node.y + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fillStyle = node.color;
      ctx.fill();
      if (isHL || isRoomHL) applyGlow();
    } else {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color;
      ctx.fill();
      if (isHL || isRoomHL) applyGlow();
    }

    if (globalScale > 0.65 || isHL || isRoomHL) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e2e8f0';
      const display = label.length > 25 ? `${label.slice(0, 25)}…` : label;
      ctx.fillText(display, node.x, node.y + node.val + fontSize + 2);
    }
  }, [highlightNodes, hoverNode, highlightedRoomId]);

  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object') return;
    ctx.strokeStyle = highlightLinks.has(link) ? '#4C4EFF' : link.color;
    ctx.lineWidth = (link.width || 1) / globalScale;
    if (link.dashed) ctx.setLineDash([5 / globalScale, 3 / globalScale]);
    else ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [highlightLinks]);

  // ── Dimensions ──────────────────────────────────────────────────────────────

  const graphHeight = useMemo(
    () => isMdUp ? Math.max(440, graphWrapSize.height) : Math.max(320, Math.floor(graphWrapSize.height)),
    [graphWrapSize.height, isMdUp]
  );
  const graphWidth = useMemo(() => Math.max(0, graphWrapSize.width), [graphWrapSize.width]);

  // ── Detail panel derived data ───────────────────────────────────────────────

  const roomMessages = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'room') return [];
    return getConnectedNodes(selectedNode.id)
      .filter((n) => n.type === 'message')
      .map((msg) => ({ msg, topics: getConnectedNodes(msg.id).filter((n) => n.type === 'topic') }));
  }, [selectedNode, getConnectedNodes]);

  const topicDetails = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'topic')
      return { messages: [], rooms: [], roomsWithMessages: [] };

    const nameKey = selectedNode.name.toLowerCase().trim();
    const merged = mergedTopicsMap.get(nameKey);

    if (!merged) {
      return {
        messages: getConnectedNodes(selectedNode.id).filter((n) => n.type === 'message'),
        rooms: getRoomsForTopic(selectedNode.id),
        roomsWithMessages: [],
      };
    }

    const allMessagesMap = new Map();
    merged.nodeIds.forEach((tid) =>
      getConnectedNodes(tid).filter((n) => n.type === 'message').forEach((msg) => {
        if (!allMessagesMap.has(msg.id)) allMessagesMap.set(msg.id, msg);
      })
    );
    const allMessages = Array.from(allMessagesMap.values());

    const allRoomsMap = new Map();
    allMessages.forEach((msg) =>
      getConnectedNodes(msg.id).filter((n) => n.type === 'room').forEach((room) => {
        if (!allRoomsMap.has(room.id)) allRoomsMap.set(room.id, room);
      })
    );
    const allRooms = Array.from(allRoomsMap.values());

    const roomsWithMessages = allRooms.map((room) => {
      const roomMsgIds = new Set(
        getConnectedNodes(room.id).filter((n) => n.type === 'message').map((n) => n.id)
      );
      return {
        room,
        messages: allMessages
          .filter((msg) => roomMsgIds.has(msg.id))
          .map((msg) => ({ msg, topics: getConnectedNodes(msg.id).filter((n) => n.type === 'topic') })),
      };
    });

    return { messages: allMessages, rooms: allRooms, roomsWithMessages };
  }, [selectedNode, mergedTopicsMap, getConnectedNodes, getRoomsForTopic]);

  // Stable connections for the selected node — not tied to hover state
  const connectedToSelected = useMemo(() => {
    if (!selectedNode || selectedNode.type === 'room' || selectedNode.type === 'topic') return [];
    return getConnectedNodes(selectedNode.id);
  }, [selectedNode, getConnectedNodes]);

  const selectedTopicMerged = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'topic') return null;
    return mergedTopicsMap.get(selectedNode.name.toLowerCase().trim()) || null;
  }, [selectedNode, mergedTopicsMap]);

  const handleMergedTopicClick = useCallback((mergedTopic) => {
    const node = graphData.nodes.find(
      (n) => n.type === 'topic' && n.name.toLowerCase().trim() === mergedTopic.displayName.toLowerCase().trim()
    );
    if (node) { setSelectedNode(node); setStatsViewOpen(false); setStatsViewType(null); }
  }, [graphData.nodes]);

  const handleStatsChipClick = (type) => { setStatsViewType(type); setStatsViewOpen(true); };
  const handleStatsViewClose = () => { setStatsViewOpen(false); setStatsViewType(null); };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: '#f4f5f9',
        height: 'calc(100vh - 105px)',
        overflow: 'hidden',
        mr: anyRightDrawerOpen ? { md: '420px' } : 0,
        transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Page header ── */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          px: { xs: 2, md: 4 },
          py: { xs: 1.75, sm: 2 },
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 1.25, sm: 0 }}
        >
          <Box>
            <Typography sx={{ fontSize: { xs: 19, sm: 21 }, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>{t('knowledge_graph.title')}</Box>{' '}{t('knowledge_graph.title_graph')}
            </Typography>
            <Typography fontSize={12.5} color="text.secondary" sx={{ mt: 0.2 }}>
              {t('knowledge_graph.subtitle')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.5 }}>
            {STAT_CONFIG.map(({ key, label, icon, type, accent, accentBg }) => (
              <Box
                key={key}
                onClick={() => handleStatsChipClick(type)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.625,
                  px: 1.25, py: 0.625,
                  borderRadius: 1.5,
                  bgcolor: accentBg,
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'border-color 0.15s',
                  // subtle border on hover — no background change
                  '&:hover': { borderColor: `${accent}35` },
                }}
              >
                <Iconify icon={icon} width={15} sx={{ color: accent }} />
                <Typography fontWeight={800} fontSize={13.5} sx={{ color: accent }}>{stats[key] ?? 0}</Typography>
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>{label}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Scrollable body (also the fullscreen target) ── */}
      <Box
        ref={fullscreenRef}
        sx={{
          flex: 1,
          overflowY: 'hidden',
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
          // fullscreen: browser gives us 100vw × 100vh, keep our bg
          '&:fullscreen': { bgcolor: '#f4f5f9', overflow: 'hidden' },
          '&:-webkit-full-screen': { bgcolor: '#f4f5f9', overflow: 'hidden' },
          '&:-moz-full-screen': { bgcolor: '#f4f5f9', overflow: 'hidden' },
        }}
      >
        <Grid
          container
          spacing={2}
          sx={isFullscreen ? { height: 'calc(100vh - 48px)', margin: 0, width: '100%' } : {}}
        >

          {/* ── Graph card ── */}
          <Grid item xs={12} md={selectedNode ? 8 : 12} sx={isFullscreen ? { height: '100%', paddingTop: '0 !important' } : {}}>
            <Box
              sx={{
                ...CARD_SX,
                display: 'flex',
                flexDirection: 'column',
                ...(isFullscreen && { height: '100%' }),
              }}
            >
              {/* Legend bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0,0,0,0.07)', bgcolor: 'rgba(0,0,0,0.015)', flexShrink: 0 }}
              >
                <Stack direction="row" spacing={1.75} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.65rem' }}>
                    {t('knowledge_graph.legend_label')}
                  </Typography>
                  {LEGEND.map(({ color, label, shape }) =>
                    shape === 'triangle' ? (
                      <Stack key={label} direction="row" spacing={0.6} alignItems="center">
                        <Box sx={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `9px solid ${color}` }} />
                        <Typography fontSize={11.5} color="text.secondary" fontWeight={600}>{label}</Typography>
                      </Stack>
                    ) : (
                      <Stack key={label} direction="row" spacing={0.6} alignItems="center">
                        <Box sx={{ width: 11, height: 11, borderRadius: shape, bgcolor: color }} />
                        <Typography fontSize={11.5} color="text.secondary" fontWeight={600}>{label}</Typography>
                      </Stack>
                    )
                  )}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography fontSize={11} color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {t('knowledge_graph.graph_instructions')}
                  </Typography>
                  <Tooltip title={isFullscreen ? t('knowledge_graph.fullscreen_exit') : t('knowledge_graph.fullscreen_enter')} placement="top">
                    <IconButton size="small" onClick={toggleFullscreen} sx={{ color: 'text.secondary', '&:hover': { color: '#4C4EFF', bgcolor: 'rgba(76,78,255,0.06)' } }}>
                      <Iconify icon={isFullscreen ? 'ic:round-fullscreen-exit' : 'ic:round-fullscreen'} width={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Graph canvas */}
              <Box
                ref={graphWrapRef}
                sx={{
                  width: '100%',
                  flex: isFullscreen ? 1 : 'unset',
                  height: isFullscreen ? undefined : { xs: '42vh', sm: '48vh', md: 'calc(100vh - 240px)' },
                  minHeight: isFullscreen ? 0 : { xs: 300, sm: 400, md: 450 },
                }}
              >
                {isLoading ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', gap: 1.5 }}>
                    <CircularProgress size={32} sx={{ color: '#4C4EFF' }} />
                    <Typography color="text.secondary" fontSize={13}>{t('knowledge_graph.loading')}</Typography>
                  </Stack>
                ) : error ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', px: 3, gap: 1 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.07)', display: 'grid', placeItems: 'center' }}>
                      <Iconify icon="solar:danger-triangle-bold" width={28} sx={{ color: '#ef4444' }} />
                    </Box>
                    <Typography fontWeight={800} fontSize={15}>{t('knowledge_graph.error_title')}</Typography>
                    <Typography color="text.secondary" fontSize={13} textAlign="center">
                      {error?.message || t('knowledge_graph.error_message')}
                    </Typography>
                  </Stack>
                ) : graphData.nodes.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', px: 3, gap: 1 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(76,78,255,0.06)', display: 'grid', placeItems: 'center' }}>
                      <Iconify icon="solar:graph-bold" width={28} sx={{ color: '#4C4EFF' }} />
                    </Box>
                    <Typography fontWeight={800} fontSize={15}>{t('knowledge_graph.empty_title')}</Typography>
                    <Typography color="text.secondary" fontSize={13} textAlign="center">
                      {t('knowledge_graph.empty_subtitle')}
                    </Typography>
                  </Stack>
                ) : (
                  graphWidth > 0 && graphHeight > 0 && (
                    <ForceGraph2D
                      ref={fgRef}
                      graphData={graphData}
                      nodeCanvasObject={paintNode}
                      linkCanvasObject={paintLink}
                      nodeRelSize={6}
                      linkDirectionalParticles={2}
                      linkDirectionalParticleWidth={2}
                      backgroundColor="#0f172a"
                      onNodeClick={(node) => setSelectedNode(node)}
                      onNodeHover={handleNodeHover}
                      cooldownTicks={200}
                      d3AlphaDecay={0.012}
                      d3VelocityDecay={0.3}
                      enableZoomInteraction
                      enablePanInteraction
                      width={graphWidth}
                      height={graphHeight}
                    />
                  )
                )}
              </Box>
            </Box>
          </Grid>

          {/* ── Node detail panel — desktop (md+) ── */}
          {selectedNode && isMdUp && (
            <Grid item md={4} sx={isFullscreen ? { height: '100%', paddingTop: '0 !important' } : {}}>
              <Box
                sx={{
                  ...CARD_SX,
                  display: 'flex',
                  flexDirection: 'column',
                  ...(isFullscreen ? { height: '100%' } : { maxHeight: 'calc(100vh - 180px)' }),
                  overflow: 'hidden',
                }}
              >
                <NodeDetailPanel
                  selectedNode={selectedNode}
                  selectedTopicMerged={selectedTopicMerged}
                  roomMessages={roomMessages}
                  topicDetails={topicDetails}
                  connectedToSelected={connectedToSelected}
                  getConnectedNodes={getConnectedNodes}
                  onNodeSelect={setSelectedNode}
                />
              </Box>
            </Grid>
          )}

          {/* dead-code placeholder removed */}
          {false && (
            <Grid item xs={12} md={4}>
              <Box><Box><Box>
                {/* Identity card */}
                <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', mb: 2.25 }}>
                  <Box sx={{ height: 3, bgcolor: selectedNode.color }} />
                  <Box sx={{ p: 1.75 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: `${selectedNode.color}18`, display: 'grid', placeItems: 'center' }}>
                        <Iconify icon={getTypeIcon(selectedNode.type)} width={18} sx={{ color: selectedNode.color }} />
                      </Box>
                      <Chip
                        label={(selectedNode.type || '').toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          letterSpacing: 0.5,
                          bgcolor: `${selectedNode.color}18`,
                          color: selectedNode.color,
                          // no hover change
                          '&:hover': { bgcolor: `${selectedNode.color}18` },
                        }}
                      />
                    </Stack>
                    <Typography fontWeight={800} fontSize={14} sx={{ wordBreak: 'break-word' }}>
                      {selectedNode.name}
                    </Typography>

                    {/* Merged topic summary chips */}
                    {selectedNode.type === 'topic' && selectedTopicMerged && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mt: 0.875 }}>
                        <Chip
                          icon={<Iconify icon="solar:chat-round-dots-bold" width={11} sx={{ color: '#6366f1' }} />}
                          label={`${selectedTopicMerged.totalCount} msgs total`}
                          size="small"
                          sx={{ height: 19, fontSize: '0.63rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                        />
                        {selectedTopicMerged.rooms.length > 1 && (
                          <Chip
                            icon={<Iconify icon="solar:buildings-bold" width={11} sx={{ color: '#ec4899' }} />}
                            label={`${selectedTopicMerged.rooms.length} rooms`}
                            size="small"
                            sx={{ height: 19, fontSize: '0.63rem', fontWeight: 700, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }}
                          />
                        )}
                      </Stack>
                    )}
                  </Box>
                </Box>

                {/* Data fields */}
                {selectedNode.data && Object.keys(selectedNode.data).length > 0 && (
                  <Box sx={{ mb: 2.25 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.1, display: 'block', fontSize: '0.63rem', color: '#374151' }}>
                      Details
                    </Typography>
                    <Stack spacing={1.1}>
                      {selectedNode.data.caption && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_caption')}</Typography>
                          <Typography fontSize={13}>{selectedNode.data.caption}</Typography>
                        </Box>
                      )}
                      {selectedNode.data.platform && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.3 }}>{t('knowledge_graph.field_platform')}</Typography>
                          <Chip label={selectedNode.data.platform} size="small" sx={{ height: 21, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: '#111827', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }} />
                        </Box>
                      )}
                      {selectedNode.data.importance && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.3 }}>{t('knowledge_graph.field_importance')}</Typography>
                          <Chip
                            label={selectedNode.data.importance}
                            size="small"
                            sx={{
                              height: 21,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor:
                                selectedNode.data.importance === 'high' ? 'rgba(239,68,68,0.08)' :
                                  selectedNode.data.importance === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.05)',
                              color:
                                selectedNode.data.importance === 'high' ? '#ef4444' :
                                  selectedNode.data.importance === 'medium' ? '#f59e0b' : 'text.secondary',
                              '&:hover': {
                                bgcolor:
                                  selectedNode.data.importance === 'high' ? 'rgba(239,68,68,0.08)' :
                                    selectedNode.data.importance === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.05)',
                              },
                            }}
                          />
                        </Box>
                      )}
                      {selectedNode.type === 'message' && selectedNode.data.emotion && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.4 }}>{t('knowledge_graph.field_emotion')}</Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            <Chip
                              icon={<Iconify icon="solar:emoji-funny-square-bold" width={12} />}
                              label={selectedNode.data.emotion.sentiment}
                              size="small"
                              sx={{
                                height: 21,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor:
                                  selectedNode.data.emotion.sentiment === 'positive' ? 'rgba(16,185,129,0.08)' :
                                    selectedNode.data.emotion.sentiment === 'negative' ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.05)',
                                color:
                                  selectedNode.data.emotion.sentiment === 'positive' ? '#10b981' :
                                    selectedNode.data.emotion.sentiment === 'negative' ? '#ef4444' : 'text.secondary',
                                '&:hover': { bgcolor: 'inherit' },
                              }}
                            />
                            <Chip
                              label={`${(selectedNode.data.emotion.confidence * 100).toFixed(0)}${t('knowledge_graph.confidence_suffix')}`}
                              size="small"
                              sx={{ height: 21, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                            />
                          </Stack>
                        </Box>
                      )}
                      {selectedNode.type === 'message' && selectedNode.data.topicCount > 0 && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.4 }}>{t('knowledge_graph.field_topics')}</Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.4 }}>
                            {getConnectedNodes(selectedNode.id).filter((n) => n.type === 'topic').map((topic) => (
                              <Chip
                                key={topic.id}
                                icon={<Iconify icon="solar:tag-bold" width={11} sx={{ color: '#4C4EFF' }} />}
                                label={topic.name}
                                size="small"
                                onClick={() => setSelectedNode(topic)}
                                sx={{ height: 21, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'rgba(76,78,255,0.07)', color: '#4C4EFF', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' } }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {selectedNode.data.url && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_url')}</Typography>
                          <Typography
                            component="a"
                            href={selectedNode.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#4C4EFF', fontSize: 12.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, wordBreak: 'break-all' }}
                          >
                            {selectedNode.data.url}
                          </Typography>
                        </Box>
                      )}
                      {selectedNode.data.created_at && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_created')}</Typography>
                          <Typography fontSize={12.5}>{new Date(selectedNode.data.created_at).toLocaleString()}</Typography>
                        </Box>
                      )}
                      {selectedNode.data.messageCount && (
                        <Box>
                          <Typography fontSize={10.5} fontWeight={600} sx={{ color: '#374151', mb: 0.2 }}>{t('knowledge_graph.field_message_count')}</Typography>
                          <Typography fontSize={12.5} fontWeight={700}>{selectedNode.data.messageCount}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Room → messages */}
                {selectedNode.type === 'room' && roomMessages.length > 0 && (
                  <>
                    <Divider sx={{ mb: 1.75 }} />
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.875}>
                      <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: 'rgba(99,102,241,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Iconify icon="solar:chat-round-dots-bold" width={14} sx={{ color: '#6366f1' }} />
                      </Box>
                      <Typography fontWeight={700} fontSize={13} sx={{ flex: 1 }}>{t('knowledge_graph.room_messages_title')}</Typography>
                      <Chip label={roomMessages.length} size="small" sx={{ height: 19, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }} />
                    </Stack>
                    <Typography fontSize={11} sx={{ mb: 0.875, color: '#374151' }}>
                      {t('knowledge_graph.room_messages_hint')}
                    </Typography>
                    {roomMessages.map(({ msg, topics }) => (
                      <MessageItem key={msg.id} msg={msg} topics={topics} onNodeClick={setSelectedNode} />
                    ))}
                  </>
                )}

                {/* Topic → rooms with messages */}
                {selectedNode.type === 'topic' && topicDetails.roomsWithMessages.length > 0 && (
                  <>
                    <Divider sx={{ mb: 1.75 }} />
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.875}>
                      <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: 'rgba(236,72,153,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Iconify icon="solar:buildings-bold" width={14} sx={{ color: '#ec4899' }} />
                      </Box>
                      <Typography fontWeight={700} fontSize={13} sx={{ flex: 1 }}>{t('knowledge_graph.topic_rooms_title')}</Typography>
                      <Chip label={topicDetails.roomsWithMessages.length} size="small" sx={{ height: 19, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }} />
                    </Stack>
                    <Typography fontSize={11} sx={{ mb: 1.25, color: '#374151' }}>
                      {t('knowledge_graph.room_messages_hint')}
                    </Typography>
                    <Stack spacing={1.25}>
                      {topicDetails.roomsWithMessages.map(({ room, messages }) => (
                        <Box key={room.id}>
                          <Box
                            onClick={() => setSelectedNode(room)}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.875,
                              px: 1.25, py: 0.875, mb: 0.625, borderRadius: 1.5,
                              bgcolor: 'rgba(236,72,153,0.04)',
                              border: '1px solid rgba(236,72,153,0.14)',
                              cursor: 'pointer',
                              transition: 'border-color 0.15s',
                              '&:hover': { borderColor: 'rgba(236,72,153,0.28)' },
                            }}
                          >
                            <Box sx={{ width: 20, height: 20, borderRadius: '5px', bgcolor: '#ec4899', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Iconify icon="solar:buildings-bold" width={12} sx={{ color: '#fff' }} />
                            </Box>
                            <Typography fontSize={12.5} fontWeight={700} sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ec4899' }}>
                              {room.name}
                            </Typography>
                            {room.data?.platform && (
                              <Chip label={room.data.platform} size="small" sx={{ height: 17, fontSize: '0.58rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', flexShrink: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }} />
                            )}
                            <Chip
                              icon={<Iconify icon="solar:chat-round-dots-bold" width={9} sx={{ color: '#6366f1' }} />}
                              label={messages.length}
                              size="small"
                              sx={{ height: 17, fontSize: '0.58rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', flexShrink: 0, '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}
                            />
                          </Box>
                          <Box sx={{ pl: 0.875 }}>
                            {messages.map(({ msg, topics }) => (
                              <MessageItem key={msg.id} msg={msg} topics={topics} onNodeClick={setSelectedNode} />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}

                {/* Other → connected nodes */}
                {selectedNode.type !== 'room' && selectedNode.type !== 'topic' && (
                  <>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.1, display: 'block', fontSize: '0.63rem', color: '#374151' }}>
                      Connected Nodes
                    </Typography>
                    <Stack spacing={0.625}>
                      {connectedToSelected.slice(0, 10).map((n) => {
                        if (!n) return null;
                        return (
                          <Box
                            key={n.id}
                            onClick={() => setSelectedNode(n)}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.875,
                              px: 1.25, py: 0.75, borderRadius: 1.5,
                              border: `1px solid ${n.color}28`,
                              bgcolor: `${n.color}06`,
                              cursor: 'pointer',
                              transition: 'border-color 0.15s',
                              // only border brightens — no bg change that darkens text
                              '&:hover': { borderColor: `${n.color}45` },
                            }}
                          >
                            <Iconify icon={getTypeIcon(n.type)} width={15} sx={{ color: n.color, flexShrink: 0 }} />
                            <Typography fontSize={12.5} fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </>
                )}
              </Box>
              </Box>{/* end scrollable wrapper */}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* ── Node detail panel — mobile bottom drawer ── */}
      <Drawer
        anchor="bottom"
        open={!!selectedNode && !isMdUp}
        onClose={() => setSelectedNode(null)}
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#fff',
          },
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, mx: 'auto', mt: 1.5, mb: 0.5, flexShrink: 0 }} />
        {selectedNode && (
          <NodeDetailPanel
            selectedNode={selectedNode}
            selectedTopicMerged={selectedTopicMerged}
            roomMessages={roomMessages}
            topicDetails={topicDetails}
            connectedToSelected={connectedToSelected}
            getConnectedNodes={getConnectedNodes}
            onNodeSelect={setSelectedNode}
          />
        )}
      </Drawer>

      <StatsViewer
        open={statsViewOpen}
        onClose={handleStatsViewClose}
        isSmUp={isSmUp}
        statsViewType={statsViewType}
        mergedTopicsList={mergedTopicsList}
        nodesByType={nodesByType}
        getConnectedNodes={getConnectedNodes}
        onMergedTopicClick={handleMergedTopicClick}
        onNodeSelect={setSelectedNode}
        onCenterNode={centerOnNode}
        pendingCenterRef={pendingCenterRef}
      />
    </Box>
  );
}

export default React.memo(KnowledgeGraphView);
