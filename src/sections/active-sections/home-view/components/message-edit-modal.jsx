import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';

import { Iconify } from 'src/components/iconify';

export default function MessageEditModal({
    open,
    onClose,
    onConfirm,
    initialContent = '',
    loading = false,
}) {
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent, open]);

    const handleConfirm = () => {
        if (content.trim()) {
            onConfirm(content);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
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
            <Box sx={{ px: 3, pt: 3.5, pb: 3 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <Iconify icon="solar:pen-bold" width={30} sx={{ color: '#4C4EFF' }} />
                </Box>

                <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.75, textAlign: 'center' }}>
                    Edit Message
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2, textAlign: 'center' }}>
                    Update your message content
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Edit your message..."
                    variant="outlined"
                    sx={{ mb: 2.5 }}
                />

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
                        onClick={handleConfirm}
                        disabled={loading || !content.trim()}
                        sx={{
                            minWidth: 100,
                            borderRadius: 2,
                            py: 0.95,
                            px: 2.75,
                            fontSize: 14,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#4C4EFF',
                            color: '#fff',
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#3F41D8', boxShadow: 'none' },
                            '&.Mui-disabled': { bgcolor: '#4C4EFF', color: '#fff', opacity: 0.45 },
                        }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
