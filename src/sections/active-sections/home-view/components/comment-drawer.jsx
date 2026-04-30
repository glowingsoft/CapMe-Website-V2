import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Iconify } from 'src/components/iconify';

export default function CommentDrawer({ open, onClose, selectedPost, commentsData }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 450,
          borderTopLeftRadius: 20,
          mt: 13,
          bgcolor: '#fff',
          p: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, borderBottom: '1px solid #eee' }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <Iconify icon="mingcute:close-line" width={24} />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Comment
        </Typography>
      </Box>
      {selectedPost && (
        <Box sx={{ px: 2, py: 2 }}>
          {/* Main comment (post) */}
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
            <Avatar src={selectedPost.user.avatar} />
            <Box>
              <Typography fontWeight={700}>{selectedPost.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPost.user.username}
              </Typography>

              <Typography sx={{ mt: 1, fontSize: 13 }}>{selectedPost.content}</Typography>
              {selectedPost.hashtags && <Typography sx={{ color: '#222', fontWeight: 600, fontSize: 13, mt: 1 }}>{selectedPost.hashtags}</Typography>}

              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <Iconify icon="ic:round-favorite" width={18} style={{ color: '#e53935' }} />
                  <Typography variant="caption" fontWeight={500} color="text.secondary">
                    {selectedPost.stats.likes}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
                  <Typography variant="caption" fontWeight={500} color="text.secondary">
                    {selectedPost.stats.comments}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <Iconify icon="mdi-light:share" width={18} style={{ color: '#43a047' }} />
                  <Typography variant="caption" fontWeight={500} color="text.secondary">
                    {selectedPost.stats.shares}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          <Typography sx={{ mb: 1, mt: 2, color: '#888', fontSize: 13 }}>{commentsData[selectedPost.id]?.length || 0} Replies</Typography>

          <Box sx={{ borderBottom: '1px solid #eee', mb: 2 }} />
          {/* Comments list */}
          <Stack spacing={2}>
            {commentsData[selectedPost.id]?.map((comment) => (
              <Stack key={comment.id} direction="row" spacing={2} alignItems="flex-start">
                <Avatar src={comment.avatar} />
                <Box>
                  <Typography fontWeight={700}>{comment.user}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.username}
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 13 }}>{comment.text}</Typography>

                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <Iconify icon="ic:round-favorite" width={18} style={{ color: '#e53935' }} />
                      <Typography variant="caption" fontWeight={500} color="text.secondary">
                        {comment.likes}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
                      <Typography variant="caption" fontWeight={500} color="text.secondary">
                        {comment.replies}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            ))}
          </Stack>
          {/* Input box placeholder */}
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: 2, p: 1 }}>
            <Iconify icon="ic:round-plus" width={24} style={{ color: '#888', marginRight: 8 }} />
            <input type="text" placeholder="Write a comment..." style={{ flexGrow: 1, border: 'none', outline: 'none', fontSize: 14 }} />
            <Iconify icon="ic:round-send" width={24} style={{ color: '#4C4EFF', marginLeft: 8, cursor: 'pointer' }} />
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
