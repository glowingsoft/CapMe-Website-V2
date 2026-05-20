import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';

import { EmptyContent } from 'src/components/empty-content';
import CommentDrawer from 'src/sections/active-sections/home-view/components/comment-drawer';
import PostCard from 'src/sections/active-sections/home-view/components/post-card';
import SuggestedRooms from 'src/sections/active-sections/home-view/components/suggested-rooms';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';
import { useLazyGetActivityFeedsQuery } from 'src/store/Reducer/rooms-api';
import { getSocket } from 'src/socket/socket';

import { suggestedRooms } from 'src/sections/active-sections/home-view/mock';
import { activityCommentsData } from './mock';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all',       labelKey: 'activity_feed.tab_all' },
  { value: 'myrooms',   labelKey: 'activity_feed.tab_my_rooms' },
  { value: 'following', labelKey: 'activity_feed.tab_following' },
  { value: 'me',        labelKey: 'activity_feed.tab_me' },
];

const CONTENT_MAX_WIDTH = 920;
const LIMIT = 20;

// ----------------------------------------------------------------------

function PostCardSkeleton() {
  return (
    <Card sx={{ mb: 2.5, borderRadius: 4, boxShadow: '0px 2px 16px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
      <CardHeader
        sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
        avatar={<Skeleton variant="circular" width={44} height={44} />}
        title={<Skeleton variant="text" width="35%" height={16} sx={{ mb: 0.5 }} />}
        subheader={<Skeleton variant="text" width="50%" height={13} />}
        action={<Skeleton variant="circular" width={30} height={30} sx={{ mt: 1, mr: 0.5 }} />}
      />
      <Skeleton variant="rectangular" width="100%" height={320} />
      <CardContent sx={{ px: 2.5 }}>
        <Skeleton variant="text" width="90%" height={14} />
        <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
      </CardContent>
      <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 3 }}>
        <Skeleton variant="text" width={40} height={20} />
        <Skeleton variant="text" width={40} height={20} />
        <Skeleton variant="text" width={40} height={20} />
      </Box>
    </Card>
  );
}

function PostCardSkeletonList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%', mx: 'auto' }}>
          <PostCardSkeleton />
        </Box>
      ))}
    </>
  );
}

// ----------------------------------------------------------------------

export default function ActivityFeedView() {
  const { t } = useTranslate('common');
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchInput, setSearchInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [allPosts, setAllPosts] = React.useState([]);
  const [hasMore, setHasMore] = React.useState(false);
  const shouldReplaceRef = React.useRef(true);
  const scrollRef = React.useRef(null);

  const [commentDrawerOpen, setCommentDrawerOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  const [triggerFeed, { data, isFetching }] = useLazyGetActivityFeedsQuery();
  // true from mount so skeleton always shows before first data arrives
  const [isLoading, setIsLoading] = React.useState(true);

  // Debounce the raw input so the API fires 400 ms after the user stops typing
  React.useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset on tab / search change
  React.useEffect(() => {
    shouldReplaceRef.current = true;
    setAllPosts([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(true);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeTab, searchQuery]);

  // Fetch whenever page/tab/search changes
  React.useEffect(() => {
    triggerFeed({ type: activeTab, search: searchQuery, page, limit: LIMIT });
  }, [activeTab, searchQuery, page, triggerFeed]);

  // Accumulate results
  React.useEffect(() => {
    if (isFetching || !data) return;
    const incoming = data.data ?? [];
    if (shouldReplaceRef.current) {
      setAllPosts(incoming);
      shouldReplaceRef.current = false;
    } else {
      setAllPosts((prev) => {
        const seen = new Set(prev.map((p) => String(p.id ?? p._id)));
        return [...prev, ...incoming.filter((p) => !seen.has(String(p.id ?? p._id)))];
      });
    }
    setHasMore((data.currentPage ?? 1) < (data.totalPages ?? 1));
    setIsLoading(false);
  }, [data, isFetching]);

  // Infinite scroll
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      shouldReplaceRef.current = false;
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setCommentDrawerOpen(false); setSelectedPost(null); setProfileDrawerOpen(false); };
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    const onCloseComment = () => { setCommentDrawerOpen(false); setSelectedPost(null); };
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('accountDrawerOpened', onAccountOpened);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener(DRAWER_EVENTS.notificationsChange, onNotificationsChange);
    window.addEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('accountDrawerOpened', onAccountOpened);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener(DRAWER_EVENTS.notificationsChange, onNotificationsChange);
      window.removeEventListener(DRAWER_EVENTS.commentClose, onCloseComment);
    };
  }, []);

  // Socket: update like counts when server confirms a like
  React.useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMessageLiked = ({ messageId, likesCount, action }) => {
      setAllPosts((prev) =>
        prev.map((p) =>
          String(p.id ?? p._id) === String(messageId)
            ? { ...p, stats: { ...p.stats, likes: likesCount }, likeAction: action }
            : p
        )
      );
      setSelectedPost((prev) =>
        prev && String(prev.id ?? prev._id) === String(messageId)
          ? { ...prev, stats: { ...prev.stats, likes: likesCount }, likeAction: action }
          : prev
      );
    };
    socket.on('messageLiked', onMessageLiked);
    return () => socket.off('messageLiked', onMessageLiked);
  }, []);

  // Window events: update comment counts when comments are added/removed
  React.useEffect(() => {
    const onCommentAdded = (e) => {
      const { messageId } = e.detail || {};
      if (!messageId) return;
      setAllPosts((prev) =>
        prev.map((p) =>
          String(p.id ?? p._id) === String(messageId)
            ? { ...p, stats: { ...p.stats, comments: (p.stats?.comments ?? 0) + 1 } }
            : p
        )
      );
    };
    const onCommentRemoved = (e) => {
      const { messageId } = e.detail || {};
      if (!messageId) return;
      setAllPosts((prev) =>
        prev.map((p) =>
          String(p.id ?? p._id) === String(messageId)
            ? { ...p, stats: { ...p.stats, comments: Math.max(0, (p.stats?.comments ?? 0) - 1) } }
            : p
        )
      );
    };
    window.addEventListener('commentAdded', onCommentAdded);
    window.addEventListener('commentRemoved', onCommentRemoved);
    return () => {
      window.removeEventListener('commentAdded', onCommentAdded);
      window.removeEventListener('commentRemoved', onCommentRemoved);
    };
  }, []);

  const anyRightDrawerOpen = commentDrawerOpen || accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;
  const contentRightOffset = anyRightDrawerOpen ? 90 : 0;

  const handleOpenComments = React.useCallback((post) => {
    setSelectedPost(post);
    setCommentDrawerOpen(true);
    setProfileDrawerOpen(false);
    closeOverlayDrawers();
  }, []);

  const handleCloseComments = React.useCallback(() => {
    setCommentDrawerOpen(false);
    setSelectedPost(null);
  }, []);

  const isPaginating = isFetching && !isLoading;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f5f9', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden' }}>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pl: { xs: 2, md: 4 },
          pb: { xs: 2, md: 4 },
          pt: { xs: 2, md: '17px' },
          pr: { xs: 2, md: 4 },
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden', minHeight: 0 }}>
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              mr: contentRightOffset ? { md: `${contentRightOffset}px` } : 0,
              transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          >
            {/* Header */}
            <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%', mx: 'auto', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 1.5, gap: { xs: 1.5, sm: 2 } }}>
                <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, flexShrink: 0 }}>
                  <Box component="span" sx={{ color: '#4C4EFF' }}>{t('activity_feed.title').split(' ')[0]}</Box>
                  {` ${t('activity_feed.title').split(' ').slice(1).join(' ')}`}
                </Typography>

                {/* Inline search field */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    height: 38,
                    bgcolor: '#fff',
                    border: '1.5px solid',
                    borderColor: searchInput ? '#4C4EFF' : 'rgba(0,0,0,0.12)',
                    borderRadius: 2,
                    width: { xs: '100%', sm: 260 },
                    flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Iconify icon="eva:search-fill" width={18} style={{ color: searchInput ? '#4C4EFF' : '#9e9e9e', flexShrink: 0 }} />
                  <InputBase
                    placeholder={t('activity_feed.search_placeholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    sx={{ flex: 1, fontSize: 13, '& input': { p: 0 } }}
                  />
                  {searchInput && (
                    <Iconify
                      icon="eva:close-fill"
                      width={16}
                      onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                      style={{ color: '#9e9e9e', cursor: 'pointer', flexShrink: 0 }}
                    />
                  )}
                </Box>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  minHeight: 34,
                  '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 3, borderRadius: 2 },
                }}
              >
                {TABS.map((tabItem) => (
                  <Tab
                    key={tabItem.value}
                    value={tabItem.value}
                    label={t(tabItem.labelKey)}
                    sx={{
                      minHeight: 34,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      px: 2,
                      borderRadius: 1,
                      alignItems: 'flex-start',
                      '&.Mui-selected': { color: '#4C4EFF' },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Scrollable feed */}
            <Box
              ref={scrollRef}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pr: 0.5,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.15) transparent',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
              }}
            >
              {isLoading ? (
                <PostCardSkeletonList count={4} />
              ) : allPosts.length === 0 ? (
                <EmptyContent
                  title={t('activity_feed.no_posts_title')}
                  description={t('activity_feed.no_posts_subtitle')}
                  sx={{ py: 10 }}
                />
              ) : (
                <>
                  {allPosts.map((item, index) => (
                    <Box key={item._id ?? item.id ?? index} sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%', mx: 'auto' }}>
                      <PostCard post={item} onCommentClick={handleOpenComments} noAutoFetch menuActions={['copy']} />
                    </Box>
                  ))}

                  {isPaginating && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={28} sx={{ color: '#4C4EFF' }} />
                    </Box>
                  )}

                  {!hasMore && allPosts.length > 0 && !isFetching && (
                    <Typography fontSize={12} align="center" sx={{ color: 'rgba(0,0,0,0.3)', py: 2 }}>
                      {t('activity_feed.no_more_posts')}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ flex: '0 0 300px', display: { xs: 'none', lg: 'block' } }}>
            <SuggestedRooms rooms={suggestedRooms} />
          </Box>
        </Box>

        <CommentDrawer
          open={commentDrawerOpen}
          onClose={handleCloseComments}
          selectedPost={selectedPost}
          commentsData={activityCommentsData}
          roomId={selectedPost?.roomId}
        />
      </Box>
    </Box>
  );
}
