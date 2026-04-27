import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { LayoutSection } from 'src/layouts/core/layout-section';
import Typography from '@mui/material/Typography';
import { Main } from './main';

function HeaderRailLogo() {
  return (
    <Box sx={{ width: 112, height: 74, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Box component="img" src="/logo/logo-single.svg" alt="Capme logo" sx={{ width: 52, height: 52 }} />
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
  const actionSx = {
    width: { xs: 48, md: 56 },
    height: { xs: 48, md: 56 },
    border: '1px solid #FFFFFF4D',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  };

  return (
    <Box
      sx={{
        height: { xs: 48, md: 56 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, md: '15px' },
        flexShrink: 0,
      }}
    >
      <Box sx={actionSx}>
        <Iconify icon="solar:danger-circle-linear" sx={{ width: { xs: 20, md: 22.56 }, height: { xs: 20, md: 22.56 } }} />
      </Box>

      <Box sx={actionSx}>
        <Iconify icon="solar:users-group-rounded-linear" sx={{ width: { xs: 16, md: 17.55 }, height: { xs: 16, md: 17.55 } }} />
      </Box>

      <Avatar
        alt="Profile"
        src="https://i.pravatar.cc/112?img=12"
        sx={{ width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 }, border: '1px solid #FFFFFF4D' }}
      />
    </Box>
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
