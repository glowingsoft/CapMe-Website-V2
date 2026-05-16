import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { PhoneInput } from 'src/components/phone-input';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';

export default function AccountEditModal({ open, onClose, user, onSave, isLoading = false }) {
    const { t } = useTranslate('common');
    const [form, setForm] = useState({ name: '', phone: '' });
    const [previewUrl, setPreviewUrl] = useState(null);

    // Sync form fields whenever the modal opens or user data changes
    useEffect(() => {
        if (open) {
            setForm({
                name: user?.basicInfo?.name || user?.displayName || '',
                phone: user?.mobile || user?.basicInfo?.phone || '',
            });
            setPreviewUrl(user?.photoURL || null);
        }
    }, [open, user]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhoneChange = (value) => {
        setForm((prev) => ({ ...prev, phone: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setForm((prev) => ({ ...prev, photo: file }));
    };

    // Parent controls close (after API resolves) — modal does not self-close
    const handleSave = () => {
        if (onSave) onSave(form);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    px: 1,
                    boxShadow: '0px 20px 60px rgba(0,0,0,0.15)',
                },
            }}
        >
            {/* Close button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, px: 2 }}>
                <IconButton size="small" onClick={onClose}>
                    <Iconify icon="mingcute:close-line" width={20} />
                </IconButton>
            </Box>

            {/* Avatar section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
                <Box sx={{ position: 'relative' }}>
                    {/* Animated ring effect */}
                    {[14, 28, 46, 66, 88].map((size, i) => (
                        <Box
                            key={i}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 96 + size,
                                height: 96 + size,
                                borderRadius: '50%',
                                border: `1px solid rgba(76,78,255,${i === 0 ? 0.35 : 0.14 - i * 0.02})`,
                                pointerEvents: 'none',
                            }}
                        />
                    ))}

                    <Avatar
                        src={previewUrl || undefined}
                        alt={form.name}
                        sx={{
                            width: 96,
                            height: 96,
                            bgcolor: '#4C4EFF',
                            fontSize: 36,
                            fontWeight: 700,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {!previewUrl && (form.name?.charAt(0).toUpperCase() || 'A')}
                    </Avatar>

                    {/* Camera button */}
                    <IconButton
                        size="small"
                        component="label"
                        sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: -4,
                            zIndex: 2,
                            bgcolor: '#4C4EFF',
                            color: '#fff',
                            width: 28,
                            height: 28,
                            '&:hover': { bgcolor: '#3b3bd6' },
                        }}
                    >
                        <Iconify icon="ic:round-photo-camera" width={16} />
                        <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    </IconButton>
                </Box>
            </Box>

            <DialogContent sx={{ pt: 3, pb: 1 }}>
                <Stack spacing={2.5}>
                    {/* Full Name */}
                    <Box>
                        <Typography fontWeight={600} fontSize={14} mb={1} color="text.secondary">
                            {t('account_edit_modal.full_name_label')}
                        </Typography>
                        <TextField
                            placeholder="Alexa Hales"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            fullWidth
                            size="medium"
                            InputProps={{
                                sx: {
                                    borderRadius: 2.5,
                                    bgcolor: '#fafbfc',
                                    fontSize: 15,
                                    height: 56,
                                    '& fieldset': { borderColor: '#e8e8e8' },
                                    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.87)' },
                                    '&.Mui-focused fieldset': { borderColor: 'rgba(0,0,0,0.87)', borderWidth: '1px' },
                                },
                            }}
                        />
                    </Box>

                    {/* Phone Number */}
                    <Box>
                        <Typography fontWeight={600} fontSize={14} mb={1} color="text.secondary">
                            {t('account_edit_modal.phone_label')}
                        </Typography>
                        <PhoneInput
                            value={form.phone}
                            onChange={handlePhoneChange}
                            placeholder="3002300"
                            defaultCountry="PK"
                            sx={{ height: 56 }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            {/* Save button */}
            <Box sx={{ px: 3, pb: 4, pt: 3 }}>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
                    sx={{
                        bgcolor: '#4C4EFF',
                        borderRadius: 3,
                        fontWeight: 700,
                        fontSize: 16,
                        py: 1.5,
                        boxShadow: 'none',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#3b3bd6', boxShadow: 'none' },
                        '&.Mui-disabled': { bgcolor: '#8486ff', color: '#fff' },
                    }}
                >
                    {isLoading ? t('account_edit_modal.saving_btn') : t('account_edit_modal.save_btn')}
                </Button>
            </Box>
        </Dialog>
    );
}
