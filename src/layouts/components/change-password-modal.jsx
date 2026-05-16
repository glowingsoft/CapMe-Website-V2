import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useChangePasswordMutation } from 'src/store/Reducer/auth';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales';

export default function ChangePasswordModal({ open, onClose }) {
  const { t } = useTranslate('common');
  const [form, setForm] = useState({ old_password: '', newpassword: '', confirmpassword: '' });
  const [show, setShow] = useState({ old_password: false, newpassword: false, confirmpassword: false });
  const [errors, setErrors] = useState({});

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () => {
    const errs = {};
    if (!form.old_password) errs.old_password = t('change_password_modal.error_current_required');
    if (!form.newpassword) errs.newpassword = t('change_password_modal.error_new_required');
    else if (form.newpassword.length < 6) errs.newpassword = t('change_password_modal.error_new_min');
    if (!form.confirmpassword) errs.confirmpassword = t('change_password_modal.error_confirm_required');
    else if (form.newpassword !== form.confirmpassword) errs.confirmpassword = t('change_password_modal.error_confirm_mismatch');
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await changePassword({
        old_password: form.old_password,
        newpassword: form.newpassword,
        confirmpassword: form.confirmpassword,
      }).unwrap();
      toast.success(t('change_password_modal.toast_success'));
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message ?? t('change_password_modal.toast_error'));
    }
  };

  const handleClose = () => {
    setForm({ old_password: '', newpassword: '', confirmpassword: '' });
    setErrors({});
    setShow({ old_password: false, newpassword: false, confirmpassword: false });
    onClose();
  };

  const fields = [
    { name: 'old_password', label: t('change_password_modal.current_password_label') },
    { name: 'newpassword', label: t('change_password_modal.new_password_label') },
    { name: 'confirmpassword', label: t('change_password_modal.confirm_password_label') },
  ];

  const inputSx = {
    borderRadius: 2.5,
    bgcolor: '#fafbfc',
    fontSize: 15,
    height: 56,
    '& fieldset': { borderColor: '#e8e8e8' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.87)' },
    '&.Mui-focused fieldset': { borderColor: 'rgba(0,0,0,0.87)', borderWidth: '1px' },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <IconButton size="small" onClick={handleClose}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <Stack spacing={2.5}>
          {fields.map(({ name, label }) => (
            <Box key={name}>
              <Typography fontWeight={600} fontSize={14} mb={1} color="text.secondary">
                {label}
              </Typography>
              <TextField
                fullWidth
                size="medium"
                name={name}
                type={show[name] ? 'text' : 'password'}
                value={form[name]}
                onChange={handleChange}
                error={!!errors[name]}
                helperText={errors[name]}
                placeholder="••••••"
                InputProps={{
                  sx: inputSx,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => toggleShow(name)} edge="end">
                        <Iconify icon={show[name] ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <Box sx={{ px: 3, pb: 4, pt: 3 }}>
        <Button
          onClick={handleSubmit}
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
          {isLoading ? t('change_password_modal.updating_btn') : t('change_password_modal.update_btn')}
        </Button>
      </Box>
    </Dialog>
  );
}
