import React, { memo } from 'react';
import Stack from '@mui/material/Stack';

import InterestCard from './components/interest-card';
import { INTERESTS } from './mock';

function InterestsTab() {
  return (
    <Stack spacing={2.5} sx={{ mb: 6 }}>
      {INTERESTS.map((it) => (
        <InterestCard
          key={it.title}
          title={it.title}
          score={it.score}
          confidence={it.confidence}
          description={it.description}
          tags={it.tags}
        />
      ))}
    </Stack>
  );
}

export default memo(InterestsTab);
