import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

function SingleMessageSkeleton() {
  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
      }}
    >
      <CardHeader
        avatar={<Skeleton variant="circular" width={42} height={42} />}
        title={<Skeleton variant="text" width={140} height={16} sx={{ borderRadius: 1 }} />}
        subheader={<Skeleton variant="text" width={90} height={13} sx={{ mt: 0.5, borderRadius: 1 }} />}
        action={
          <Skeleton variant="circular" width={28} height={28} sx={{ mt: 1, mr: 0.5 }} />
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 0.5, pb: '12px !important' }}>
        <Skeleton variant="text" width="92%" height={15} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="78%" height={15} sx={{ mt: 0.5, borderRadius: 1 }} />
        <Skeleton variant="text" width="55%" height={15} sx={{ mt: 0.5, borderRadius: 1 }} />

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {[80, 72, 72].map((w, i) => (
            <Skeleton key={i} variant="rounded" width={w} height={28} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MessageSkeleton({ count = 5 }) {
  return (
    <Box sx={{ px: 0.5 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SingleMessageSkeleton key={i} />
      ))}
    </Box>
  );
}
