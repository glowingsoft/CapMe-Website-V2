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

export default function ChangePasswordModal({ open, onClose }) {
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
    if (!form.old_password) errs.old_password = 'Current password is required';
    if (!form.newpassword) errs.newpassword = 'New password is required';
    else if (form.newpassword.length < 6) errs.newpassword = 'Password must be at least 6 characters';
    if (!form.confirmpassword) errs.confirmpassword = 'Please confirm your new password';
    else if (form.newpassword !== form.confirmpassword) errs.confirmpassword = 'Passwords do not match';
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
      toast.success('Password updated successfully');
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to update password');
    }
  };

  const handleClose = () => {
    setForm({ old_password: '', newpassword: '', confirmpassword: '' });
    setErrors({});
    setShow({ old_password: false, newpassword: false, confirmpassword: false });
    onClose();
  };

  const fields = [
    { name: 'old_password', label: 'Current Password' },
    { name: 'newpassword', label: 'New Password' },
    { name: 'confirmpassword', label: 'Confirm New Password' },
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
          {isLoading ? 'Updating…' : 'Update Password'}
        </Button>
      </Box>
    </Dialog>
  );
}
