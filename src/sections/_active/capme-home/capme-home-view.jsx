import { useState } from 'react';

import Box from '@mui/material/Box';

import { Feed } from './feed';
import { LeftRail } from './left-rail';
import { RoomsPanel } from './rooms-panel';
import { SuggestedRooms } from './suggested-rooms';

export function CapmeHomeView() {
  const [roomsOpen, setRoomsOpen] = useState(true);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', minHeight: 1312, display: 'flex', bgcolor: '#0A0C12' }}>
      <LeftRail />

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
        <Box sx={{ height: 34, bgcolor: '#FFFFFF', flexShrink: 0 }} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative', bgcolor: '#FFFFFF' }}>
          <RoomsPanel open={roomsOpen} onToggle={() => setRoomsOpen((prev) => !prev)} />

          <Feed />

          <SuggestedRooms />
        </Box>
      </Box>
    </Box>
  );
}
