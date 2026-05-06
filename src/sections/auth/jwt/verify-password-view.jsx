import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

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

import { OtpTimer } from './otp-timer';

// ----------------------------------------------------------------------

export const OtpVerifySchema = zod.object({
  otp: zod.string().length(6, { message: 'Please enter the full 6-digit code.' }).regex(/^\d{6}$/, { message: 'Code must contain digits only.' }),
});

// ----------------------------------------------------------------------

export function JwtVerifyPasswordView() {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { otp: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async () => {
    router.push(paths.auth.jwt.resetPassword);
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
        {/* Logos */}
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
          <Box component="span" sx={{ color: '#4C4EFF' }}>Check</Box>
          {' Your Email'}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2.5, px: 1 }}>
          We sent a 6-digit verification code to your email. Enter it below to continue.
        </Typography>

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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify Code'}
            </Button>
          </Stack>
        </Form>

        {/* Resend timer */}
        <Box sx={{ mt: 3 }}>
          <OtpTimer seconds={30} />
        </Box>

        {/* Back */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 1.5 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} fontWeight={700} color="#4C4EFF" underline="none">
            ← Back to Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
