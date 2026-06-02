import { useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { Iconify } from 'src/components/iconify';
import Avatar from '@mui/material/Avatar';
import { LayoutSection } from 'src/layouts/core/layout-section';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import AnnouncementModal from 'src/layouts/components/announcement-modal';
import { Main } from './main';

function HeaderRailLogo() {
  return (
    <Box sx={{ width: 112, height: 74, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Box component="img" src={`${import.meta.env.BASE_URL}logo/logo-single.svg`} alt="Capme logo" sx={{ width: 52, height: 52 }} />
    </Box>
  );
}

function DefaultHeaderLeft() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 303,
        minWidth: 0,
        height: '100%',
        borderRadius: '15px',
        bgcolor: 'rgba(255,255,255,0.04)',
        p: '9px 7px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 3, md: 6, lg: '133px' },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 109,
            height: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Typography
            sx={{
              width: 109,
              height: 28,
              fontFamily: 'Varela, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '140%',
              letterSpacing: '1%',
              color: '#FFFFFF',
            }}
          >
            Capme
          </Typography>

          <Typography
            sx={{
              width: 115,
              height: 20,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '140%',
              letterSpacing: '1%',
              color: '#9F9F9F',
            }}
          >
            Available Tokens
          </Typography>
        </Box>

        <Typography
          sx={{
            width: 45,
            height: 49,
            fontFamily: 'Varela, sans-serif',
            fontWeight: 400,
            fontSize: '35px',
            lineHeight: '140%',
            letterSpacing: '1%',
            color: '#F68B2B',
            textAlign: 'right',
          }}
        >
          42
        </Typography>
      </Box>
    </Box>
  );
}

function DefaultHeaderCenter() {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        height: 68,
        borderRadius: '12.03px',
        bgcolor: '#242424',
        boxShadow: '0px 4px 27px 0px #00000026',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 1.5, sm: 2.25, md: '23px' },
      }}
    >
      <Iconify icon="eva:search-fill" sx={{ width: 30, height: 30, color: '#FFFFFF' }} />

      <InputBase
        placeholder="Search Here..."
        sx={{
          ml: { xs: 1, sm: '15px' },
          flex: 1,
          minWidth: 0,
          '& input': {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '31.97px',
            color: '#9F9F9F',
          },
          '& input::placeholder': { color: '#9F9F9F', opacity: 1 },
        }}
      />
    </Box>
  );
}

function DefaultHeaderRight() {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const currentUser = useSelector(selectUser);
  const garageRoomData = currentUser?.garageRoom;

  const garageRoom = {
    id: garageRoomData?._id ?? garageRoomData?.id ?? 'garage',
    _id: garageRoomData?._id ?? garageRoomData?.id ?? 'garage',
    name: garageRoomData?.name ?? 'Garage',
    image: garageRoomData?.image ?? '',
    visibility: garageRoomData?.visibility ?? 'personal',
    isGarage: true,
    color: '#4C4EFF',
  };

  const handleOpenGarage = () => {
    const isExactHome = location.pathname === '/home' || location.pathname === '/home/';
    if (isExactHome) {
      window.dispatchEvent(new CustomEvent('openRoom', { detail: garageRoom }));
    } else {
      navigate('/home', { state: { pendingRoom: garageRoom } });
    }
  };

  const actionSx = {
    width: { xs: 48, md: 56 },
    height: { xs: 48, md: 56 },
    border: '1px solid #FFFFFF4D',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
  };

  return (
    <>
      <Box
        sx={{
          height: { xs: 48, md: 56 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: '15px' },
          flexShrink: 0,
        }}
      >
        <Box sx={actionSx} onClick={() => setAnnouncementOpen(true)}>
          <Iconify icon="solar:danger-circle-bold" sx={{ width: { xs: 20, md: 22.56 }, height: { xs: 20, md: 22.56 } }} />
        </Box>

        <Box sx={actionSx} onClick={handleOpenGarage}>
          <Iconify icon="solar:garage-bold" sx={{ width: { xs: 20, md: 22 }, height: { xs: 20, md: 22 } }} />
        </Box>

        <Avatar
          alt="Profile"
          src={currentUser?.image?.includes('noImg') ? undefined : currentUser?.image}
          sx={{ width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 }, border: '1px solid #FFFFFF4D', bgcolor: '#4C4EFF', fontWeight: 700, fontSize: 20, color: '#fff' }}
        >
          {currentUser?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Box>

      <AnnouncementModal
        open={announcementOpen}
        onClose={() => setAnnouncementOpen(false)}
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function CapmeLayout({ children, sx, headerSlots = {}, layoutQuery = 'lg' }) {
  return (
    <LayoutSection
      headerSection={
        <Box
          sx={{
            width: '100%',
            height: 140,
            bgcolor: '#131313',
            display: 'flex',
            alignItems: 'center',
            px: { xs: 1.5, md: '12px' },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '100%', mx: 0, height: 74, display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <HeaderRailLogo />

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2, lg: 4 } }}>
              <Box sx={{ flex: '0 1 303px', minWidth: { xs: 190, sm: 220 }, maxWidth: 303, height: 74 }}>
                {headerSlots.leftArea || <DefaultHeaderLeft />}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, height: 68, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2, md: '20px' } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {headerSlots.centerArea || <DefaultHeaderCenter />}
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  {headerSlots.rightArea || <DefaultHeaderRight />}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      }
      footerSection={null}
      sx={sx}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
