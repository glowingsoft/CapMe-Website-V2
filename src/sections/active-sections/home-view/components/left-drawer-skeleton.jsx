import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

function RoomItemSkeleton() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.2, borderRadius: 3 }}>
      <Skeleton variant="circular" width={38} height={38} sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="60%" height={16} sx={{ borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Skeleton variant="text" width="80%" height={13} sx={{ mt: 0.4, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
      <Skeleton variant="circular" width={22} height={22} sx={{ flexShrink: 0, bgcolor: 'rgba(255,255,255,0.05)' }} />
    </Stack>
  );
}

function SectionSkeleton({ count }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" width={110} height={16} sx={{ mb: 1, mt: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Stack spacing={0.3}>
        {Array.from({ length: count }).map((_, i) => (
          <RoomItemSkeleton key={i} />
        ))}
      </Stack>
    </Box>
  );
}

export default function LeftDrawerSkeleton() {
  return (
    <Box sx={{ px: 3, pt: 1 }}>
      <SectionSkeleton count={2} />
      <SectionSkeleton count={4} />
    </Box>
  );
}
