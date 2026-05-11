import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = 'Confirmation',
    description = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    loading = false,
    icon = 'material-symbols:priority-high-rounded',
    iconColor = '#C40000',
    confirmColor = '#C40000',
    children,
}) {
    const iconBg = getSoftIconBg(iconColor);

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
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
            <Box sx={{ px: 3, pt: 3.5, pb: 3, textAlign: 'center' }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <Iconify icon={icon} width={30} sx={{ color: iconColor }} />
                </Box>

                <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.75 }}>
                    {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: children ? 2 : 3 }}>
                    {description}
                </Typography>

                {children}

                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        disabled={loading}
                        onClick={onClose}
                        sx={{
                            borderColor: 'rgba(0,0,0,0.15)',
                            color: 'text.primary',
                            borderRadius: 2,
                            py: 0.95,
                            px: 2.75,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: 100,
                            '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
                        }}
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        onClick={onConfirm}
                        sx={{
                            bgcolor: confirmColor,
                            color: '#fff',
                            borderRadius: 2,
                            py: 0.95,
                            px: 2.75,
                            fontSize: 14,
                            fontWeight: 700,
                            textTransform: 'none',
                            minWidth: 100,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: confirmColor, filter: 'brightness(0.88)', boxShadow: 'none' },
                            '&.Mui-disabled': { bgcolor: confirmColor, color: '#fff', opacity: 0.45 },
                        }}
                    >
                        {loading ? `${confirmLabel}...` : confirmLabel}
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
}

function getSoftIconBg(hexColor) {
    const hex = (hexColor || '').replace('#', '');
    if (hex.length !== 6) return 'rgba(76,78,255,0.10)';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.10)`;
}
