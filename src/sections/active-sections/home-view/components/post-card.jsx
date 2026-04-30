import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Iconify } from 'src/components/iconify';

export default function PostCard({ post, onCommentClick }) {
  return (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3,
        boxShadow: '0px 2px 12px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      {/* Header */}
      <CardHeader
        sx={{ px: 2, pt: 2, pb: 1.5 }}
        avatar={<Avatar src={post.user.avatar} sx={{ width: 42, height: 42 }} />}
        title={
          <Typography fontWeight={700} fontSize={14} lineHeight={1.3}>
            {post.user.name}
          </Typography>
        }
        subheader={
          <Typography fontSize={12} color="text.secondary" lineHeight={1.4}>
            {post.user.username}
          </Typography>
        }
        action={
          <IconButton size="small" sx={{ mt: 1, mr: 0.5 }}>
            <Iconify icon="ph:dots-three-vertical-bold" style={{ color: '#000', border: '1px dashed #888', borderRadius: '50%', height: 26, width: 26 }} />
          </IconButton>
        }
      />

      {/* Image — full width, no padding */}
      {post.image && (
        <CardMedia
          component="img"
          image={post.image}
          alt="Post visual"
          sx={{
            width: '100%',
            height: 520,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Stats row — directly below image */}
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          {/* Like */}
          <Stack direction="row" spacing={0.6} alignItems="center">
            <Iconify icon="ic:round-favorite" width={18} style={{ color: '#e53935' }} />
            <Typography variant="caption" fontWeight={500} color="text.secondary">
              {post.stats.likes}
            </Typography>
          </Stack>
          {/* Comment */}
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ cursor: 'pointer' }} onClick={onCommentClick}>
            <Iconify icon="mingcute:chat-3-line" width={18} style={{ color: '#9e9e9e' }} />
            <Typography variant="caption" fontWeight={500} color="text.secondary">
              {post.stats.comments}
            </Typography>
          </Stack>
          {/* Share */}
          <Stack direction="row" spacing={0.6} alignItems="center">
            <Iconify icon="mdi-light:share" width={18} style={{ color: '#43a047' }} />
            <Typography variant="caption" fontWeight={500} color="text.secondary">
              {post.stats.shares}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Post text — bold author name inline with content */}
      <CardContent sx={{ px: 2, pt: 1.5, pb: '6 !important' }}>
        <Typography variant="body2" color="text.primary" lineHeight={1.6}>
          <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
            {post.user.name}{' '}
          </Typography>
          {post.content}
        </Typography>

        {/* Hashtags */}
        {post.hashtags && (
          <Typography variant="body2" sx={{ mt: 0.5, color: '#9e9e9e', fontSize: 13 }}>
            {post.hashtags}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
