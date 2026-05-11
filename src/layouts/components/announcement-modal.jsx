import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

const MOCK_HTML = `
  <p>We've rolled out a major platform update — improved room performance, new emoji reactions, and enhanced media sharing are all live.</p>
  <p style="margin-top:12px">Your <strong>Garage Room</strong> is now available as a private space for personal notes. Check it out from the header.</p>
  <p style="margin-top:12px">If you run into any issues please reach out to support.</p>
`;

export default function AnnouncementModal({ open, onClose, html = MOCK_HTML }) {
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
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(15, 15, 20, 0.55)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 3 }}>
        <Box
          dangerouslySetInnerHTML={{ __html: html }}
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

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onClose}
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
