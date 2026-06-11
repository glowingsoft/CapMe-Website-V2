import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DrawerHeader from './drawer-header';

export default function CommentDrawerShell({ open, onClose, title, children }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  if (isMdUp) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
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
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {title && <DrawerHeader title={title} onBack={onClose} showEdit={false} showShare={false} />}
        {children}
      </Drawer>
    );
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      swipeAreaWidth={30}
      PaperProps={{
        sx: {
          borderRadius: '20px 20px 0 0',
          height: '90vh',
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Drag handle — replaces the header on mobile */}
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: 'rgba(0,0,0,0.15)',
          borderRadius: 2,
          mx: 'auto',
          mt: 1.5,
          mb: 0.5,
          flexShrink: 0,
        }}
      />
      {children}
    </SwipeableDrawer>
  );
}
