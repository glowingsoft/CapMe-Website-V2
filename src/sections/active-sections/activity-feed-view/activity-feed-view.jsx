import React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import CommentDrawer from 'src/sections/active-sections/home-view/components/comment-drawer';
import OldMessagesLabel from 'src/sections/chat/old-messages-label';
import PostCard from 'src/sections/active-sections/home-view/components/post-card';
import SuggestedRooms from 'src/sections/active-sections/home-view/components/suggested-rooms';
import { closeOverlayDrawers, DRAWER_EVENTS } from 'src/utils/drawer-events';

import { suggestedRooms } from 'src/sections/active-sections/home-view/mock';
import { activityCommentsData, activityPosts } from './mock';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'friends', label: 'Friends' },
  { value: 'following', label: 'Following' },
];

const CONTENT_MAX_WIDTH = 920;

export default function ActivityFeedView() {
  const [activeTab, setActiveTab] = React.useState('all');
  const [commentDrawerOpen, setCommentDrawerOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onAccountOpened = () => { setCommentDrawerOpen(false); setSelectedPost(null); setProfileDrawerOpen(false); };
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    const onCloseComment = () => {
      setCommentDrawerOpen(false);
      setSelectedPost(null);
    };
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

  // Filter posts by active tab (wire up to your real logic as needed)
  const filteredPosts = React.useMemo(() => {
    if (activeTab === 'all') return activityPosts;
    const matchesTab = (item) => {
      if (activeTab === 'friends') return item.visibility === 'friends' || item.feedType === 'friends';
      if (activeTab === 'following') return item.feedType === 'following';
      return true;
    };

    const out = [];
    let pendingDate = null;

    activityPosts.forEach((item) => {
      if (item.type === 'date') {
        pendingDate = item;
        return;
      }

      if (!matchesTab(item)) return;
      if (pendingDate) {
        out.push(pendingDate);
        pendingDate = null;
      }
      out.push(item);
    });

    return out;
  }, [activeTab]);

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
            {/* Header: title + tabs */}
            <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%', mx: 'auto', mb: 2 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, mb: 1.5 }}>
                <Box component="span" sx={{ color: '#4C4EFF' }}>Activity</Box>
                {' Feed'}
              </Typography>

              {/* Tabs (match Chat Me) */}
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  minHeight: 34,
                  '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 3, borderRadius: 2 },
                }}
              >
                {TABS.map((t) => (
                  <Tab
                    key={t.value}
                    value={t.value}
                    label={t.label}
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

            <Box
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
              {filteredPosts.map((item, index) =>
                item.type === 'date' ? (
                  <OldMessagesLabel key={index} label={item.label} />
                ) : (
                  <Box key={item.id} sx={{ maxWidth: CONTENT_MAX_WIDTH, width: '100%', mx: 'auto' }}>
                    <PostCard post={item} onCommentClick={handleOpenComments} />
                  </Box>
                )
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
        />
      </Box>
    </Box>
  );
}
