import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Slide from '@mui/material/Slide';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


export default function ProfilePageShell({ open, onClose, children }) {
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  if (isLgUp) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        disableScrollLock
        ModalProps={{ sx: { pointerEvents: 'none' } }}
        PaperProps={{
          sx: {
            width: 420,
            borderTopLeftRadius: 20,
            mt: '105px',
            height: 'calc(100dvh - 105px)',
            bgcolor: '#fff',
            p: 0,
            pointerEvents: 'auto',
            overflow: 'hidden',
          },
        }}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit timeout={280}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Slide>
  );
}
