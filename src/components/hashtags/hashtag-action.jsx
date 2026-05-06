import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { extractHashtags } from './hashtag-utils';

import HashtagModal from 'src/sections/active-sections/home-view/components/hashtag-modal';
import { posts, commentsData } from 'src/sections/active-sections/home-view/mock';

export default function HashtagAction({ text }) {
  const hashtags = React.useMemo(() => extractHashtags(text), [text]);
  if (hashtags.length === 0) return null;

  const [anchorEl, setAnchorEl] = useState(null);
  const [modalTag, setModalTag] = useState(null);
  const open = Boolean(anchorEl);

  // Find all messages (posts/comments) with the selected hashtag
  const getMessagesWithHashtag = (tag) => {
    const tagNoHash = tag.startsWith('#') ? tag : `#${tag}`;
    // Search posts
    const postMatches = posts.filter(
      (p) => p.type === 'message' && (p.hashtags || '').includes(tagNoHash)
    );
    // Search comments
    const commentMatches = Object.values(commentsData).flat().filter(
      (c) => (c.text || '').includes(tagNoHash)
    );
    return [...postMatches, ...commentMatches];
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Iconify icon="mdi:tag" width={18} style={{ color: '#4C4EFF' }} />
        <Typography variant="body2" fontWeight={600} sx={{ color: '#4C4EFF' }}>
          {hashtags.length}
        </Typography>
      </Stack>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { borderRadius: 3, p: 1.5, minWidth: 220 } }}
      >
        <Typography fontSize={13} fontWeight={800} sx={{ mb: 1 }}>
          Hashtags ({hashtags.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {hashtags.map((tag, idx) => (
            <Chip
              key={`${tag}-${idx}`}
              label={tag}
              size="small"
              sx={{
                bgcolor: '#4C4EFF',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { opacity: 0.85 },
              }}
              onClick={() => {
                setModalTag(tag);
                setAnchorEl(null);
              }}
            />
          ))}
        </Box>
      </Popover>

      <HashtagModal
        open={!!modalTag}
        onClose={() => setModalTag(null)}
        hashtag={modalTag}
        messages={modalTag ? getMessagesWithHashtag(modalTag) : []}
      />
    </>
  );
}

