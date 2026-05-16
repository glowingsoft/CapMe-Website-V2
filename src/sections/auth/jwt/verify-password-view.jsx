import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useVerifyPasswordOtpMutation, useForgotPasswordMutation } from 'src/store/Reducer/auth';
import { useTranslate } from 'src/locales';

import { OtpTimer } from './otp-timer';

// ----------------------------------------------------------------------

export const OtpVerifySchema = zod.object({
  otp: zod.string().length(6, { message: 'Please enter the full 6-digit code.' }).regex(/^\d{6}$/, { message: 'Code must contain digits only.' }),
});

// ----------------------------------------------------------------------

export function JwtVerifyPasswordView() {
  const router = useRouter();
  const { t } = useTranslate('common');
  const email = sessionStorage.getItem('forgot_email') ?? '';
  const [errorMsg, setErrorMsg] = useState('');

  const [verifyPasswordOtp] = useVerifyPasswordOtpMutation();
  const [forgotPassword] = useForgotPasswordMutation();

  const handleResend = async () => {
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('OTP resent! Please check your email.');
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const methods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { otp: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await verifyPasswordOtp({ email, pin: Number(data.otp) }).unwrap();
      router.push(paths.auth.jwt.resetPassword);
    } catch (error) {
      const msg = error?.data?.message ?? error?.data?.error ?? error?.message ?? 'Verification failed. Please try again.';
      setErrorMsg(typeof msg === 'string' ? msg : 'Verification failed. Please try again.');
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
          {t('auth.verify_password.title')}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: email ? 1 : 2.5, px: 1 }}>
          {t('auth.verify_password.subtitle')}
        </Typography>
        {!!email && (
          <Typography align="center" fontSize={13} fontWeight={700} sx={{ mb: 2.5 }}>
            {email}
          </Typography>
        )}

        {/* Error */}
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {/* OTP Form */}
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Field.Code
              name="otp"
              sx={{
                '& .MuiOtpInput-TextField': {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    fontSize: 20,
                    fontWeight: 700,
                  },
                },
              }}
            />

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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('auth.verify_password.submit')}
            </Button>
          </Stack>
        </Form>

        {/* Resend timer */}
        <Box sx={{ mt: 3 }}>
          <OtpTimer seconds={30} onResend={handleResend} />
        </Box>

        {/* Back */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 1.5 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} fontWeight={700} color="#4C4EFF" underline="none">
            {t('auth.verify_password.back_to_sign_in')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
