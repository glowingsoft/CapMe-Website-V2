import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

import { useDispatch } from 'react-redux';
import { setUser } from 'src/store/slices/userSlice';
import { handleApiError } from 'src/utils/errorHandler';
import { getDeviceType } from 'src/utils/getDeviceType';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

const mockLogin = async (payload) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    message: 'Login success',
    data: {
      basicInfo: {
        _id: '692c5523e446ec147ce153aa',
        profileIcon: 'https://dummybucket.s3.us-east-1.amazonaws.com/noimage.png',
        name: payload.userType === 'admin' ? 'Admin User' : 'Hashir',
        email: payload.email,
        phoneNumber: null,
        language: 'en',
      },
      accountState: {
        userType: payload.userType,
        status: 'active',
        verificationStatus: { email: 'verified', phoneNumber: 'pending' },
      },
      metadata: {
        timezone: payload.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
      token: 'mock-token',
    },
  };
};

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  const goTo = (permission) => {
    if (permission === 1) router.push(paths.adminDashboard.root);
    else if (permission === 2) router.push(paths.dashboard.root);
    else router.push('/');
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userType: data.email.includes('admin') ? 'admin' : 'user',
      deviceType: getDeviceType(),
      deviceId: '123',
    };

    try {
      const response = await mockLogin(payload);
      if (!response.data) { toast.error('Login failed'); return; }
      const user = response.data;
      if (!user?.accountState?.status) { toast.error('Account inactive.'); return; }
      const user_type = user.accountState.userType === 'user' ? 2 : 1;
      dispatch(setUser({ ...user, permission: user_type }));
      goTo(user_type);
      reset();
      toast.success('Login successful!');
    } catch (error) {
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
            src="/logo/logo-single.svg"
            alt="Capme"
            sx={{ width: 64, height: 64, objectFit: 'contain' }}
          />
        </Box>

        {/* Title */}
        <Typography
          align="center"
          sx={{ fontSize: 26, fontWeight: 800, mb: 0.8, lineHeight: 1.2 }}
        >
          <Box component="span" sx={{ color: '#4C4EFF' }}>Welcome</Box>
          {' Back'}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2.5 }}>
          Start by entering the email address you use for work.
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

            {/* Password */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>
                Password <Box component="span" sx={{ color: 'error.main' }}>*</Box>
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
                label={<Typography fontSize={13}>Remember Me</Typography>}
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
                Forgot Password?
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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Stack>
        </Form>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography fontSize={12} color="text.disabled" fontWeight={500}>
            Or Continue With
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* Social buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Iconify icon="logos:google-icon" width={18} />}
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
            Google
          </Button>
        </Stack>

        {/* Footer */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 2 }}>
          Don&apos;t Have An Account?{' '}
          <Link component={RouterLink} href={paths.auth.jwt.signUp} fontWeight={700} color="#4C4EFF" underline="none">
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
