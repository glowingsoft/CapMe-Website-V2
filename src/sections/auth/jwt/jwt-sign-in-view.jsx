import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'src/components/snackbar';
import { z as zod } from 'zod';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useGoogleLogin } from '@react-oauth/google';
import { signInWithPassword, signInWithGoogle } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';
import { setUser } from 'src/store/slices/userSlice';

import { handleApiError } from 'src/utils/errorHandler';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

export function JwtSignInView() {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const dispatch = useDispatch();
  const { t } = useTranslate('common');
  const [errorMsg, setErrorMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const password = useBoolean();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setGoogleLoading(true);
      // Fetch user profile from Google
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const googleUser = await res.json();
      const user = await signInWithGoogle(googleUser);
      dispatch(setUser(user));
      await checkUserSession();
      router.replace(paths.dashboard.root);
      toast.success(t('auth.sign_in.toast_success'));
    } catch (err) {
      toast.error(err?.data?.message ?? 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google login failed'),
  });

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const user = await signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      console.log("LOGIN User Data", user);
      

      dispatch(setUser(user));
      await checkUserSession();
      router.replace(paths.dashboard.root);
      reset();
      toast.success(t('auth.sign_in.toast_success'));
    } catch (error) {
      if (error?.status === 403) {
        const msg = error?.data?.message ?? error?.data?.error ?? 'Please verify your email before signing in.';
        toast.error(msg);
        sessionStorage.setItem('otp_email', data.email.trim().toLowerCase());
        router.push(paths.auth.jwt.verifyOtp);
        return;
      }
      setErrorMsg(typeof error === 'string' ? error : error.message);
      handleApiError(error);
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
        {/* Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}logo/logo-single.svg`}
            alt="Capme"
            sx={{ width: 64, height: 64, objectFit: 'contain' }}
          />
        </Box>

        {/* Title */}
        <Typography
          align="center"
          sx={{ fontSize: 26, fontWeight: 800, mb: 0.8, lineHeight: 1.2 }}
        >
          {t('auth.sign_in.title')}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2.5 }}>
          {t('auth.sign_in.subtitle')}
        </Typography>

        {/* Error */}
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2}>
            {/* Email */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>
                {t('auth.sign_in.email_label')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
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

            {/* Password */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>
                {t('auth.sign_in.password_label')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <Field.Text
                name="password"
                placeholder="••••••"
                type={password.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:lock-line" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end" size="small">
                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                      </IconButton>
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

            {/* Remember me + Forgot password */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={<Checkbox size="small" sx={{ p: 0, mr: 1 }} />}
                label={<Typography fontSize={13}>{t('auth.sign_in.remember_me')}</Typography>}
                sx={{ m: 0, alignItems: 'center' }}
              />
              <Link
                component={RouterLink}
                href={paths.auth.jwt.forgetPassword}
                fontSize={13}
                fontWeight={600}
                color="#4C4EFF"
                underline="none"
              >
                {t('auth.sign_in.forgot_password')}
              </Link>
            </Stack>

            {/* Sign in button */}
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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : t('auth.sign_in.submit')}
            </Button>
          </Stack>
        </Form>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography fontSize={12} color="text.disabled" fontWeight={500}>
            {t('auth.sign_in.or_continue_with')}
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* Social buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            startIcon={googleLoading ? <CircularProgress size={16} /> : <Iconify icon="logos:google-icon" width={18} />}
            sx={{
              borderRadius: 2,
              borderColor: '#e8e8e8',
              color: '#111',
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'none',
              '&:hover': { borderColor: '#ccc', bgcolor: '#fafafa' },
            }}
          >
            {t('auth.sign_in.google')}
          </Button>
        </Stack>

        {/* Footer */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 2 }}>
          {t('auth.sign_in.no_account')}{' '}
          <Link component={RouterLink} href={paths.auth.jwt.signUp} fontWeight={700} color="#4C4EFF" underline="none">
            {t('auth.sign_in.sign_up_link')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
