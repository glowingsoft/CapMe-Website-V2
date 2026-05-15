import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function RoomInfoSkeleton() {
  return (
    <Box sx={{ px: 2, pt: 4, pb: 3 }}>
      {/* Room image */}
      <Stack alignItems="center" sx={{ mb: 2.5 }}>
        <Skeleton variant="rounded" width={200} height={200} sx={{ borderRadius: 4 }} />
        <Skeleton variant="text" width={160} height={24} sx={{ mt: 2, borderRadius: 1 }} />
        <Skeleton variant="text" width={120} height={16} sx={{ mt: 0.75, borderRadius: 1 }} />
      </Stack>

      {/* Description */}
      <Skeleton variant="text" width={100} height={16} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="rounded" width="100%" height={90} sx={{ borderRadius: 2, mb: 2.5 }} />

      {/* Visibility */}
      <Skeleton variant="text" width={80} height={16} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: 2, mb: 2.5 }} />

      {/* Action rows */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={48} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>

      {/* Members */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Skeleton variant="text" width={80} height={16} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width={20} height={16} sx={{ borderRadius: 1 }} />
      </Stack>
      <Stack spacing={1}>
        {[1, 2, 3].map((i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={1.5}
            sx={{ p: 1.25, border: '1px solid #f0f0f0', borderRadius: 2.5 }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={15} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width="75%" height={13} sx={{ mt: 0.4, borderRadius: 1 }} />
            </Box>
            <Skeleton variant="circular" width={30} height={30} />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
