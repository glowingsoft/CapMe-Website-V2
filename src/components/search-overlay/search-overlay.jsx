import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { Icon } from '@iconify/react';
import { useLazySearchOverlayQuery, useGetRoomByIdQuery } from 'src/store/Reducer/rooms-api';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

const CATEGORIES = ['All', 'Rooms', 'Files', 'People'];

const CATEGORY_TYPE_MAP = {
  All: 'all',
  Rooms: 'rooms',
  Files: 'attachment',
  People: 'users',
};

const SCOPE_MAP = ['home', 'explore'];
const LIMIT = 10;

// ----------------------------------------------------------------------

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const VISIBILITY_CONFIG = {
  public:          { icon: 'solar:global-bold',                labelKey: 'search.visibility_public',          color: '#43a047' },
  private:         { icon: 'solar:lock-bold',                  labelKey: 'search.visibility_private',         color: '#29b6f6' },
  private_friends: { icon: 'solar:users-group-rounded-bold',   labelKey: 'search.visibility_private_friends', color: '#7b5ea7' },
  personal:        { icon: 'solar:garage-bold',                labelKey: 'search.visibility_personal',        color: '#4C4EFF' },
};

const S3_BASE = 'https://capmes3.s3.us-east-1.amazonaws.com/';

function buildUrl(url) {
  if (!url) return undefined;
  if (url.toLowerCase().includes('noimg')) return undefined;
  // Strip redundant S3 prefix stored as "https://s3.../https://s3.../filename"
  if (url.startsWith(S3_BASE) && url.slice(S3_BASE.length).startsWith('http')) {
    return buildUrl(url.slice(S3_BASE.length)); // recurse to validate the inner URL
  }
  // Bare S3 base URL with no filename — no real image
  const stripped = url.endsWith('/') ? url.slice(0, -1) : url;
  if (stripped === S3_BASE.slice(0, -1)) return undefined;
  if (url.startsWith('http')) return url;
  return `${S3_BASE}${url}`;
}

function getVisibilityCfg(item) {
  const raw = item?.visibility ?? item?.roomVisibility ?? null;
  if (!raw) return null;
  const key = raw.toLowerCase();
  return VISIBILITY_CONFIG[key] ?? VISIBILITY_CONFIG.public;
}

function getItemType(item) {
  if (item?.type) return item.type;
  if (item?.fileUrl || item?.fileName || item?.originalFileName) return 'attachment';
  // Room objects have members array or createdby field but no message/user-specific fields
  if (Array.isArray(item?.members) || item?.createdby) return 'room';
  // User objects have email but no roomId
  if (item?.email && !item?.roomId) return 'user';
  return '';
}

function MessageVisibilityBadge({ item }) {
  const { t } = useTranslate('common');
  const needsFetch = !item?.visibility && !item?.roomVisibility && !!item?.roomId;
  const { data: room } = useGetRoomByIdQuery(item?.roomId, { skip: !needsFetch });
  const source = needsFetch ? (room ?? item) : item;
  const cfg = getVisibilityCfg(source);
  if (!cfg) return null;
  return (
    <>
      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
        <Icon icon={cfg.icon} width={12} style={{ color: cfg.color }} />
        <Typography component="span" fontSize={11} fontWeight={600} sx={{ color: cfg.color, lineHeight: 1 }}>
          {t(cfg.labelKey)}
        </Typography>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function MessageRow({ item, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const avatarSrc = buildUrl(item.senderImage);
  const attachmentNames = (item.attachments ?? [])
    .map((a) => a.originalFileName ?? a.fileName ?? '')
    .filter(Boolean);
  const preview = attachmentNames.length > 0 ? attachmentNames.join(', ') : item.content;

  const handleClick = () => {
    onClose();
    const room = { id: item.roomId, _id: item.roomId, name: item.roomname ?? '' };
    if (location.pathname?.startsWith('/home')) {
      window.dispatchEvent(new CustomEvent('openRoomMessage', { detail: { room, message: item } }));
    } else {
      navigate('/home', { state: { pendingRoom: room, pendingMessageId: item._id ?? item.id } });
    }
  };

  return (
    <Box onClick={handleClick} sx={rowSx}>
      <Avatar src={avatarSrc} sx={{ ...avatarSx, bgcolor: '#4C4EFF' }}>
        {!avatarSrc && (item.sendername?.charAt(0)?.toUpperCase() ?? '')}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={700} noWrap sx={{ color: '#fff', lineHeight: 1.4 }}>
          {item.sendername ?? '—'}
        </Typography>
        {/* time · visibility · room name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap', overflow: 'hidden' }}>
          <Typography component="span" fontSize={11} sx={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, lineHeight: 1 }}>
            {formatTime(item.createdAt)}
          </Typography>
          <MessageVisibilityBadge item={item} />
          {!!item.roomname && (
            <>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              <Typography component="span" fontSize={11} fontWeight={600} noWrap sx={{ color: '#4C4EFF', lineHeight: 1, minWidth: 0 }}>
                {item.roomname}
              </Typography>
            </>
          )}
        </Box>

        {!!preview && (
          <Typography fontSize={12} noWrap sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.6 }}>
            {preview}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function UserRow({ item, onClose }) {
  const { t } = useTranslate('common');
  const avatarSrc = buildUrl(item.image);

  return (
    <Box onClick={() => {
      onClose();
      window.dispatchEvent(new CustomEvent('openUserProfile', {
        detail: {
          _id: item._id ?? item.id,
          id: item._id ?? item.id,
          name: item.name ?? item.username ?? '',
          email: item.email ?? '',
          image: item.image ?? '',
        },
      }));
    }} sx={rowSx}>
      <Avatar src={avatarSrc} sx={{ ...avatarSx, bgcolor: '#4C4EFF' }}>
        {!avatarSrc && (item.name?.charAt(0)?.toUpperCase() ?? '')}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={700} noWrap sx={{ color: '#fff', lineHeight: 1.4 }}>
          {item.name ?? item.username ?? '—'}
        </Typography>
        {!!item.email && (
          <Typography fontSize={11} noWrap sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {item.email}
          </Typography>
        )}
      </Box>
      <Typography fontSize={11} sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, ml: 1 }}>
        {t('search.type_user')}
      </Typography>
    </Box>
  );
}

function RoomRow({ item, onClose, openRoom }) {
  const { t } = useTranslate('common');
  const avatarSrc = buildUrl(item.image);

  return (
    <Box onClick={() => { onClose(); openRoom({ id: item._id ?? item.id, _id: item._id ?? item.id, name: item.name ?? item.roomname ?? '', image: item.image ?? '', visibility: item.visibility ?? 'public' }); }} sx={rowSx}>
      <Avatar src={avatarSrc} sx={{ ...avatarSx, bgcolor: '#4C4EFF', borderRadius: 1.5 }}>
        {!avatarSrc && ((item.name ?? item.roomname ?? '').charAt(0)?.toUpperCase() || <Icon icon="solar:hashtag-bold-duotone" width={18} color="#fff" />)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={700} noWrap sx={{ color: '#fff', lineHeight: 1.4 }}>
          {item.name ?? item.roomname ?? '—'}
        </Typography>
        {!!item.description && (
          <Typography fontSize={11} noWrap sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {item.description}
          </Typography>
        )}
      </Box>
      <Typography fontSize={11} sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, ml: 1 }}>
        {t('search.type_room')}
      </Typography>
    </Box>
  );
}

function AttachmentRow({ item, onClose }) {
  const { t } = useTranslate('common');
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = item.originalFileName ?? item.fileName ?? item.content ?? '—';
  const ext = displayName.includes('.') ? displayName.split('.').pop()?.toUpperCase() : (item.fileType ?? '');
  const roomName = item.name ?? item.roomname ?? '';
  const isImage = (item.fileType ?? '').toLowerCase().startsWith('image');
  const thumbSrc = isImage ? buildUrl(item.fileUrl ?? item.image) : undefined;

  const handleClick = () => {
    onClose();
    const room = { id: item.roomId, _id: item.roomId, name: roomName };
    // Only attempt message-scroll if this is a full message object (has senderId/sendername).
    // Raw attachment records from type=attachment search lack these fields — just open the room.
    const isFullMessage = !!(item.senderId || item.sendername);
    if (location.pathname?.startsWith('/home')) {
      const event = isFullMessage ? 'openRoomMessage' : 'openRoom';
      const detail = isFullMessage ? { room, message: item } : room;
      window.dispatchEvent(new CustomEvent(event, { detail }));
    } else {
      const state = isFullMessage
        ? { pendingRoom: room, pendingMessageId: item._id ?? item.id }
        : { pendingRoom: room };
      navigate('/home', { state });
    }
  };

  return (
    <Box onClick={handleClick} sx={rowSx}>
      {isImage && thumbSrc ? (
        <Avatar
          src={thumbSrc}
          variant="rounded"
          sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, bgcolor: 'rgba(255,153,0,0.12)' }}
        />
      ) : (
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, bgcolor: 'rgba(255,153,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="solar:file-bold-duotone" width={20} color="#FF9900" />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={700} noWrap sx={{ color: '#fff', lineHeight: 1.4 }}>
          {displayName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!!ext && (
            <Typography component="span" fontSize={11} sx={{ color: 'rgba(255,255,255,0.4)' }}>
              {ext}
            </Typography>
          )}
          {!!roomName && (
            <Typography component="span" fontSize={11} noWrap sx={{ color: '#4C4EFF', fontWeight: 600 }}>
              {ext ? ` · ${roomName}` : roomName}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography fontSize={11} sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, ml: 1 }}>
        {t('search.type_file')}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

function ResultSkeleton() {
  return (
    <Box sx={{ py: 0.5 }}>
      {[...Array(5)].map((_, i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 2.5, py: 1.4 }}>
            <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="45%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 0.5 }} />
              <Skeleton variant="text" width="65%" height={13} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton variant="text" width="30%" height={13} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 0.3 }} />
            </Box>
          </Box>
          {i < 4 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2.5 }} />}
        </Box>
      ))}
    </Box>
  );
}

const rowSx = {
  display: 'flex', alignItems: 'flex-start', gap: 2,
  px: 2.5, py: 1.4, cursor: 'pointer',
  transition: 'background 0.12s',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
};
const avatarSx = { width: 36, height: 36, fontSize: 14, fontWeight: 700, flexShrink: 0 };

// ----------------------------------------------------------------------

function ResultItem({ item, onClose, openRoom }) {
  const type = getItemType(item);
  if (type === 'message')    return <MessageRow    item={item} onClose={onClose} />;
  if (type === 'user')       return <UserRow       item={item} onClose={onClose} />;
  if (type === 'room')       return <RoomRow       item={item} onClose={onClose} openRoom={openRoom} />;
  if (type === 'attachment') return <AttachmentRow item={item} onClose={onClose} />;
  return null;
}

// ----------------------------------------------------------------------

export default function SearchOverlay({ open, onClose, anchorEl, query }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslate('common');
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const categoryLabels = {
    All: t('search.category_all'),
    Rooms: t('search.category_rooms'),
    Files: t('search.category_files'),
    People: t('search.category_people'),
  };

  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debounceRef = useRef(null);
  const scrollRef = useRef(null);
  // Tracks whether the next incoming data should replace (true) or append (false)
  const shouldReplaceRef = useRef(true);

  const [triggerSearch, { data, isFetching }] = useLazySearchOverlayQuery();

  const openRoom = useCallback((room) => {
    if (location.pathname.startsWith('/home')) {
      window.dispatchEvent(new CustomEvent('openRoom', { detail: room }));
    } else {
      navigate('/home', { state: { pendingRoom: room } });
    }
  }, [location.pathname, navigate]);

  // Reset when filters change — don't clear results yet, show skeleton over them
  useEffect(() => {
    shouldReplaceRef.current = true;
    setIsRefreshing(true);
    setPage(1);
    setHasMore(false);
  }, [query, category, tab]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCategory('All');
      setTab(0);
      setPage(1);
      setAllResults([]);
      setHasMore(false);
      setIsRefreshing(false);
      shouldReplaceRef.current = true;
    }
  }, [open]);

  // Trigger search
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerSearch({
        search: query,
        type: CATEGORY_TYPE_MAP[category],
        scope: SCOPE_MAP[tab],
        page,
        limit: LIMIT,
      });
    }, page === 1 ? 150 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, tab, page, open, triggerSearch]);

  // Accumulate results — runs when fetch completes (isFetching → false) OR data changes.
  // Both deps are needed: data-only misses cache hits where data ref stays the same.
  useEffect(() => {
    if (isFetching || !data) return;
    const incoming = data.results ?? [];
    if (shouldReplaceRef.current) {
      setAllResults(incoming);
      shouldReplaceRef.current = false;
      setIsRefreshing(false);
    } else {
      setAllResults((prev) => [...prev, ...incoming]);
    }
    setHasMore(incoming.length >= LIMIT && (data.currentPage ?? 1) < (data.totalPages ?? 1));
  }, [data, isFetching]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      shouldReplaceRef.current = false;
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore]);

  const panelContent = (
    <Paper
      elevation={12}
      onMouseDown={(e) => e.preventDefault()}
      sx={{
        borderRadius: isMdUp ? 2.5 : '0 0 16px 16px',
        overflow: 'hidden',
        bgcolor: '#2a2a2a',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Category chips */}
      <Box sx={{ display: 'flex', gap: 1, px: 2.5, py: 1.4, overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.07)', '&::-webkit-scrollbar': { display: 'none' } }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat} label={categoryLabels[cat]} size="small"
            onClick={() => setCategory(cat)}
            sx={{
              flexShrink: 0, fontWeight: 600, fontSize: 12, height: 28, borderRadius: 1.5,
              bgcolor: category === cat ? '#fff' : 'rgba(255,255,255,0.07)',
              color: category === cat ? '#111' : 'rgba(255,255,255,0.65)',
              border: category === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: category === cat ? '#e8e8e8' : 'rgba(255,255,255,0.12)' },
            }}
          />
        ))}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 1, minHeight: 38,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          bgcolor: 'rgba(255,255,255,0.02)',
          '& .MuiTab-root': { minHeight: 38, fontWeight: 600, fontSize: 13, textTransform: 'none', color: 'rgba(255,255,255,0.45)', px: 2, transition: 'color 0.2s' },
          '& .Mui-selected': { color: '#fff !important', fontWeight: 700 },
          '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 2.5, borderRadius: 1, transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' },
        }}
      >
        <Tab label={t('search.tab_home')} />
        <Tab label={t('search.tab_explore')} />
      </Tabs>

      {/* Results */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          minHeight: 200, maxHeight: '50vh', overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
        }}
      >
        {isRefreshing ? (
          <ResultSkeleton />
        ) : allResults.length > 0 ? (
          <>
            {allResults.map((item, idx) => (
              <Box key={item?.attachment_id ?? item?._id ?? idx}>
                <ResultItem item={item} onClose={onClose} openRoom={openRoom} />
                {idx < allResults.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />
                )}
              </Box>
            ))}
            {isFetching && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1.5 }}>
                <CircularProgress size={16} sx={{ color: '#4C4EFF' }} />
                <Typography fontSize={11} sx={{ color: 'rgba(255,255,255,0.3)' }}>{t('search.loading_more')}</Typography>
              </Box>
            )}
            {!hasMore && (
              <Typography fontSize={11} align="center" sx={{ color: 'rgba(255,255,255,0.2)', py: 1.5 }}>
                {t('search.end_of_results')}
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon="eva:search-fill" width={22} color="rgba(255,255,255,0.25)" />
            </Box>
            <Typography fontSize={13} fontWeight={600} sx={{ color: 'rgba(255,255,255,0.35)' }}>
              {query ? t('search.no_results') : t('search.start_typing')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

  /* ── Desktop: Popper anchored to the search bar ── */
  if (isMdUp) {
    return (
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        modifiers={[
          { name: 'offset', options: { offset: [0, 6] } },
          { name: 'flip', enabled: false },
        ]}
        style={{ zIndex: 1300, width: anchorEl?.offsetWidth ?? 480 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Box>
              <ClickAwayListener onClickAway={(e) => { if (anchorEl && anchorEl.contains(e.target)) return; onClose(); }}>
                <Box>{panelContent}</Box>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    );
  }

  /* ── Mobile: full-width panel fixed below the header ── */
  if (!open) return null;
  return (
    <Fade in={open} timeout={200}>
      <Box
        sx={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 1300,
          px: 1,
        }}
      >
        <ClickAwayListener onClickAway={(e) => { if (anchorEl && anchorEl.contains(e.target)) return; onClose(); }}>
          <Box>{panelContent}</Box>
        </ClickAwayListener>
      </Box>
    </Fade>
  );
}
