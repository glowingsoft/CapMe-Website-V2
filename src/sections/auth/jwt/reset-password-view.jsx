import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { toast } from 'src/components/snackbar';
import { useResetPasswordMutation } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod
  .object({
    newPassword: zod.string().min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(6, { message: 'Please confirm your new password!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function JwtResetPasswordView() {
  const router = useRouter();
  const newPassword = useBoolean();
  const confirmPassword = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');
  const [resetPassword] = useResetPasswordMutation();

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const email = sessionStorage.getItem('forgot_email') ?? '';
      await resetPassword({
        email,
        newpassword: data.newPassword,
        retypenewpassword: data.confirmPassword,
      }).unwrap();
      sessionStorage.removeItem('forgot_email');
      toast.success('Password reset successfully! Please sign in.');
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      const msg = error?.data?.message ?? error?.data?.error ?? error?.message ?? 'Failed to reset password. Please try again.';
      setErrorMsg(typeof msg === 'string' ? msg : 'Failed to reset password. Please try again.');
    }
  });

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' },
    '& .MuiInputLabel-root': { display: 'none' },
    '& legend': { display: 'none' },
    '& fieldset': { top: 0 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: '#fff',
          borderRadius: 4,
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          px: { xs: 3, sm: 5 },
          py: 4,
        }}
      >
        {/* Logo + icon */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, gap: 1 }}>
          <Box
            component="img"
            src="/logo/logo-single.svg"
            alt="Capme"
            sx={{ width: 64, height: 64, objectFit: 'contain' }}
          />
          <Iconify icon="solar:key-bold-duotone" width={52} sx={{ color: '#4C4EFF' }} />
        </Box>

        {/* Title */}
        <Typography align="center" sx={{ fontSize: 26, fontWeight: 800, mb: 0.8, lineHeight: 1.2 }}>
          <Box component="span" sx={{ color: '#4C4EFF' }}>Reset</Box>
          {' Password'}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2.5 }}>
          Your new password must be different from your previous password.
        </Typography>

        {/* Error */}
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {/* New Password */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>New Password <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
              <Field.Text
                name="newPassword"
                placeholder="6+ characters"
                type={newPassword.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:lock-line" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={newPassword.onToggle} edge="end" size="small">
                        <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            {/* Confirm Password */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>Confirm Password <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
              <Field.Text
                name="confirmPassword"
                placeholder="Re-enter your password"
                type={confirmPassword.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:lock-line" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={confirmPassword.onToggle} edge="end" size="small">
                        <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            {/* Submit */}
            <Button
              fullWidth
              type="submit"
              size="large"
              sx={{
                bgcolor: '#4C4EFF',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 2.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#3739b7' },
              }}
            >
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Reset Password'}
            </Button>
          </Stack>
        </Form>

        {/* Back */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 3 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} fontWeight={700} color="#4C4EFF" underline="none">
            ← Back to Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
