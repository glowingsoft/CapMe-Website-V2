import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { PostCard } from './post-card';

function DateSeparator({ label }) {
  return (
    <Box sx={{ py: 1.3, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ px: 1.5, py: 0.4, borderRadius: 10, bgcolor: '#FFFFFF', color: '#6F6F6F', fontSize: 10, border: '1px solid #ECECEC' }}>
        {label}
      </Box>
    </Box>
  );
}

function MessageInput() {
  return (
    <Box sx={{ mt: 1.1, bgcolor: '#FFFFFF', border: '1px solid #ECECEC', borderRadius: 1.5, height: 32, display: 'flex', alignItems: 'center', px: 1.2 }}>
      <Box sx={{ flex: 1, color: '#B1B1B1', fontSize: 11 }}>Write a message...</Box>
      <Iconify icon="solar:arrow-right-linear" width={16} sx={{ color: '#5A57FF' }} />
    </Box>
  );
}

export function Feed() {
  return (
    <Box sx={{ flex: 1, minWidth: 0, px: 2.2, py: 1.7, overflow: 'auto', bgcolor: '#FFFFFF' }}>
      <Typography sx={{ color: '#1C1C1C', fontFamily: 'Varela, sans-serif', fontSize: 24, lineHeight: '32px' }}>
        Creative Rooms
      </Typography>
      <Typography sx={{ color: '#8D8D8D', fontSize: 12, mt: 0.2, mb: 1.4 }}>
        A central place to organize meetups, coffee chats...
      </Typography>

      <Box sx={{ maxWidth: 560 }}>
        <PostCard />

        <DateSeparator label="Tuesday, July 20th" />

        <PostCard
          compact
          caption="Just wrapped up a super productive study on AI/ML. Feeling more confident for the exams ahead! #studytime #focusmode #studielife #exam"
        />

        <MessageInput />
      </Box>
    </Box>
  );
}
