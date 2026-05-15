import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export default function MessageDeleteModal({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = 'Delete Message',
    description = 'Are you sure you want to delete this message? This action cannot be undone.',
}) {
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
                        bgcolor: '#fff3e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <Iconify icon="solar:trash-bin-trash-bold" width={30} sx={{ color: '#e53935' }} />
                </Box>

                <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.75 }}>
                    {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
                    {description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            minWidth: 100,
                            borderColor: 'rgba(0,0,0,0.15)',
                            color: 'text.primary',
                            borderRadius: 2,
                            py: 0.95,
                            px: 2.75,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onConfirm}
                        disabled={loading}
                        sx={{
                            minWidth: 100,
                            borderRadius: 2,
                            py: 0.95,
                            px: 2.75,
                            fontSize: 14,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': { filter: 'brightness(0.88)', boxShadow: 'none' },
                            '&.Mui-disabled': { opacity: 0.45 },
                        }}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
