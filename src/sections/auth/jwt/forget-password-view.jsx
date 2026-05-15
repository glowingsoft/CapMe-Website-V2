import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useForgotPasswordMutation } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

export const ForgotPasswordSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function JwtForgetPasswordView() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPassword] = useForgotPasswordMutation();

  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await forgotPassword({ email: data.email.trim().toLowerCase() }).unwrap();
      sessionStorage.setItem('forgot_email', data.email.trim().toLowerCase());
      router.push(paths.auth.jwt.verifyPassword);
    } catch (error) {
      const msg = error?.data?.message ?? error?.data?.error ?? error?.message ?? 'Failed to send OTP. Please try again.';
      setErrorMsg(typeof msg === 'string' ? msg : 'Failed to send OTP. Please try again.');
    }
  });

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
          <Box component="span" sx={{ color: '#4C4EFF' }}>Forgot</Box>
          {' Password?'}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2.5 }}>
          No worries, We&apos;ll send you reset instructions.
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
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>
                Email Address <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <Field.Text
                name="email"
                placeholder="johndoe@gmail.com"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:mail-line" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' },
                  '& .MuiInputLabel-root': { display: 'none' },
                  '& legend': { display: 'none' },
                  '& fieldset': { top: 0 },
                }}
              />
            </Box>

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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send OTP'}
            </Button>
          </Stack>
        </Form>

        {/* Back to sign in */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 3 }}>
          Remember your password?{' '}
          <Link component={RouterLink} href={paths.auth.jwt.signIn} fontWeight={700} color="#4C4EFF" underline="none">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
