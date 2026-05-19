import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useGetAnnouncementQuery } from 'src/store/Reducer/auth';

export default function AnnouncementModal({ open, onClose }) {
  const { data, isLoading } = useGetAnnouncementQuery(undefined, { skip: !open });

  const title = data?.title ?? '';
  const content = data?.content ?? '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 15, 20, 0.55)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 3 }}>
        {isLoading ? (
          <>
            <Skeleton variant="text" width="60%" height={22} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="75%" height={16} sx={{ mb: 3 }} />
          </>
        ) : (
          <>
            {title ? (
              <Typography fontWeight={700} fontSize={16} sx={{ mb: 1.5, color: 'text.primary' }}>
                {title}
              </Typography>
            ) : null}
            <Box
              dangerouslySetInnerHTML={{ __html: content }}
              sx={{
                fontSize: 14,
                lineHeight: 1.75,
                color: 'text.secondary',
                mb: 3,
                '& p': { m: 0 },
                '& strong': { color: 'text.primary', fontWeight: 700 },
                '& a': { color: '#4C4EFF', textDecoration: 'underline' },
              }}
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onClose}
            disabled={isLoading}
            sx={{
              minWidth: 120,
              bgcolor: '#4C4EFF',
              color: '#fff',
              borderRadius: 2,
              py: 0.95,
              px: 2.75,
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#3739CC', boxShadow: 'none' },
            }}
          >
            Got it
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
