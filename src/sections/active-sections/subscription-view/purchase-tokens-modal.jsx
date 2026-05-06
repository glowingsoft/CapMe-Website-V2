import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { selectUser } from 'src/store/slices/userSlice';

const PACKAGES = [
  { id: 'pkg20', tokens: 20, price: 2.0 },
  { id: 'pkg40', tokens: 40, price: 4.0 },
  { id: 'pkg60', tokens: 60, price: 6.0 },
];

function Field({ label, sx, children }) {
  return (
    <Box sx={sx}>
      <Typography fontSize={13} fontWeight={700} sx={{ mb: 0.75, color: '#111' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function StyledInput({ startAdornment, disabled, ...props }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: disabled ? '#f0f0f0' : '#f4f5f9',
        border: '1.5px solid #f0f0f0',
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
        ...(!disabled && { '&:focus-within': { borderColor: '#4C4EFF' } }),
        transition: 'border-color 0.15s',
      }}
    >
      {startAdornment && (
        <Box sx={{ color: '#bdbdbd', flexShrink: 0, display: 'flex' }}>{startAdornment}</Box>
      )}
      <InputBase
        disabled={disabled}
        fullWidth
        sx={{ fontSize: 14, '& input': { p: 0, color: disabled ? '#888' : 'inherit' } }}
        {...props}
      />
      {disabled && (
        <Iconify icon="solar:lock-bold" width={14} style={{ color: '#bdbdbd', flexShrink: 0 }} />
      )}
    </Box>
  );
}

export default function PurchaseTokensModal({ open, onClose }) {
  const [selectedPkg, setSelectedPkg] = useState('pkg60');
  const user = useSelector(selectUser);

  const name = user?.basicInfo?.name ?? user?.displayName ?? '';
  const email = user?.email ?? user?.basicInfo?.email ?? '';

  const pkg = PACKAGES.find((p) => p.id === selectedPkg);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>

        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:card-bold" width={24} style={{ color: '#fff' }} />
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                Payment
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
              ME Tokens
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 3 }}>

          {/* Package selector */}
          <Typography fontSize={14} fontWeight={700} sx={{ mb: 1.5, color: '#111' }}>
            Select Package
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
            {PACKAGES.map((p) => {
              const isActive = selectedPkg === p.id;
              return (
                <Box
                  key={p.id}
                  onClick={() => setSelectedPkg(p.id)}
                  sx={{
                    flex: 1,
                    position: 'relative',
                    border: isActive ? '2px solid #4C4EFF' : '1.5px solid #e0e0e0',
                    borderRadius: 3,
                    bgcolor: isActive ? '#4C4EFF' : '#fff',
                    py: 1.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#4C4EFF' },
                  }}
                >
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#4C4EFF',
                        border: '2px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="mingcute:check-line" width={12} style={{ color: '#fff' }} />
                    </Box>
                  )}
                  <Typography fontWeight={800} fontSize={15} sx={{ color: isActive ? '#fff' : '#111' }}>
                    {p.tokens} Tokens
                  </Typography>
                  <Typography fontSize={13} sx={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                    ${p.price.toFixed(2)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Row 1: Full Name */}
          <Field label="Full Name" sx={{ mb: 2 }}>
            <StyledInput value={name} disabled />
          </Field>

          {/* Row 2: Email */}
          <Field label="Email" sx={{ mb: 2 }}>
            <StyledInput value={email} disabled />
          </Field>

          {/* Amount */}
          <Field label="Amount (USD)" sx={{ mb: 2 }}>
            <StyledInput
              value={pkg?.price.toFixed(2) ?? ''}
              disabled
              startAdornment={<Typography fontSize={14} color="text.secondary">$</Typography>}
            />
          </Field>

          {/* Card number */}
          <Field label="Card Number" sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f4f5f9',
                border: '1.5px solid #f0f0f0',
                borderRadius: 2,
                px: 1.5,
                py: 1.25,
                '&:focus-within': { borderColor: '#4C4EFF' },
                transition: 'border-color 0.15s',
              }}
            >
              <Iconify icon="solar:card-bold" width={18} style={{ color: '#bdbdbd', flexShrink: 0 }} />
              <InputBase placeholder="1234  5678  9012  3456" fullWidth sx={{ fontSize: 14, '& input': { p: 0 } }} />
            </Box>
          </Field>

          {/* Expiry + CVC + ZIP */}
          <Stack direction="row" spacing={2}>
            <Field label="Expiry" sx={{ flex: 1 }}>
              <StyledInput placeholder="MM / YY" />
            </Field>
            <Field label="CVC" sx={{ flex: 1 }}>
              <StyledInput placeholder="CVC" />
            </Field>
            <Field label="ZIP" sx={{ flex: 1 }}>
              <StyledInput placeholder="ZIP" />
            </Field>
          </Stack>

          {/* Pay button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              bgcolor: '#4C4EFF',
              color: '#fff',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: 15,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#3739b7', boxShadow: 'none' },
            }}
          >
            Pay ${pkg?.price.toFixed(2)} — Get {pkg?.tokens} Tokens
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}
