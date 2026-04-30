import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    px: 4,
                    py: 4,
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                },
            }}
            BackdropProps={{
                sx: {
                    bgcolor: 'rgba(15, 15, 20, 0.55)',
                    backdropFilter: 'blur(3px)',
                },
            }}
        >
            {/* Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                <Box
                    sx={{
                        width: 78,
                        height: 78,
                        borderRadius: '50%',
                        bgcolor: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 12px 28px ${iconColor}44`,
                    }}
                >
                    <Iconify icon={icon} width={46} sx={{ color: '#fff' }} />
                </Box>
            </Box>

            <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#514BFF', mb: 1.5 }}>
                {title}
            </Typography>

            <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
                {description}
            </Typography>

            {children}

            <Button
                fullWidth
                disabled={loading}
                onClick={onConfirm}
                sx={{
                    height: 52,
                    borderRadius: 2,
                    bgcolor: confirmColor,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: `0 12px 28px ${confirmColor}66`,
                    mt: 3,
                    '&:hover': {
                        bgcolor: confirmColor,
                        opacity: 0.9,
                    },
                    '&.Mui-disabled': {
                        bgcolor: confirmColor,
                        color: '#fff',
                        opacity: 0.6,
                    },
                }}
            >
                {loading ? `${confirmLabel}...` : confirmLabel}
            </Button>

            <Button
                disabled={loading}
                onClick={onClose}
                sx={{
                    mt: 1.5,
                    color: '#777',
                    fontSize: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: 'transparent',
                        color: '#444',
                    },
                }}
            >
                {cancelLabel}
            </Button>
        </Dialog>
    );
}
