import React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useLocation } from 'react-router-dom';
import CommentDrawer from './components/comment-drawer';
import LeftDrawer from './components/left-drawer';
import PostCard from './components/post-card';
import SuggestedRooms from './components/suggested-rooms';
import { commentsData, posts, roomsData, suggestedRooms } from './mock';

export default function HomeView() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(true);
  const location = useLocation();

  // Only show left drawer on /dashboard*
  const showLeftDrawer = /^\/dashboard(\/|$)/.test(location.pathname);

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPost(null);
  };

  const handleToggleLeftDrawer = () => {
    setLeftDrawerOpen((prev) => !prev);
  };

  // Drawer width must match LeftDrawer
  const leftDrawerWidth = showLeftDrawer && leftDrawerOpen ? 300 : 0;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#fafbfc', minHeight: '100vh', display: 'flex' }}>
      {/* Left Drawer (pushes content) */}
      {showLeftDrawer && <LeftDrawer open={leftDrawerOpen} onToggle={handleToggleLeftDrawer} roomsData={roomsData} />}
      {/* Main Content (shifted if left drawer open) */}

      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
          marginLeft: { md: `${leftDrawerWidth}px`, xs: 0 },
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={7}>
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
              <Typography fontSize={20} fontWeight={700} color="text.primary">
                Creative Rooms
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                A central place to organize meetups, coffee chats...
              </Typography>
            </Box>

            {posts.map((post) => (
              <PostCard key={post.id} post={post} onCommentClick={() => handleOpenComments(post)} />
            ))}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4} lg={3} mt={10}>
            <SuggestedRooms rooms={suggestedRooms} />
          </Grid>
        </Grid>

        {/* Comments Drawer */}
        <CommentDrawer open={drawerOpen} onClose={handleCloseDrawer} selectedPost={selectedPost} commentsData={commentsData} />
      </Box>
    </Box>
  );
}
