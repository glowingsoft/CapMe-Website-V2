import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop';

export function PostCard({
  authorName = 'Alexa Hales',
  authorHandle = '@alexa9123',
  authorAvatar = 'https://i.pravatar.cc/100?u=alexa',
  image = DEFAULT_IMAGE,
  likes = 321,
  comments = 123,
  shares = 21,
  caption = 'Alexa Hales had an amazing discussion with my team about our daily targets.',
  compact = false,
}) {
  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #ECECEC', overflow: 'hidden' }}>
      <Box sx={{ px: 1.4, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Avatar sx={{ width: 28, height: 28 }} src={authorAvatar} />
          <Box>
            <Typography sx={{ fontSize: 13, color: '#1C1C1C', lineHeight: '16px', fontWeight: 500 }}>{authorName}</Typography>
            <Typography sx={{ fontSize: 10, color: '#A1A1A1', lineHeight: '14px' }}>{authorHandle}</Typography>
          </Box>
        </Box>
        <Iconify icon="solar:menu-dots-linear" width={16} sx={{ color: '#A6A6A6' }} />
      </Box>

      {!compact && (
        <Box
          sx={{
            height: 385,
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      <Box sx={{ px: 1.4, py: 1 }}>
        <Box sx={{ display: 'flex', gap: 2.2, color: '#878787' }}>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:heart-bold" width={12} sx={{ color: '#E53935' }} /> {likes}
          </Typography>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:chat-round-linear" width={12} /> {comments}
          </Typography>
          <Typography sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Iconify icon="solar:repeat-linear" width={12} sx={{ color: '#58AF55' }} /> {shares}
          </Typography>
        </Box>

        <Typography sx={{ mt: 0.8, fontSize: 10.5, color: '#909090' }}>
          <Box component="span" sx={{ color: '#1C1C1C', fontWeight: 500 }}>{authorName}</Box> {caption}
        </Typography>
      </Box>
    </Box>
  );
}
