import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { RHFUploadAvatar } from 'src/components/hook-form/rhf-upload';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export const SignUpSchema = zod.object({
  avatar: zod.any().optional(),
  fullName: zod.string().min(1, { message: 'Full name is required!' }),
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod.string().min(1, { message: 'Phone number is required!' }).min(7, { message: 'Please enter a valid phone number!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
  terms: zod.literal(true, { errorMap: () => ({ message: 'You must accept the Terms & Conditions.' }) }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const password = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { avatar: null, fullName: '', email: '', phoneNumber: '', password: '', terms: false },
  });

  const { handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = methods;
  const termsChecked = watch('terms');

  const onSubmit = handleSubmit(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Account created! Please sign in.');
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : error);
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
          py: 3,
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
        <Typography align="center" sx={{ fontSize: 26, fontWeight: 800, mb: 0.8, lineHeight: 1.2 }}>
          <Box component="span" sx={{ color: '#4C4EFF' }}>Create</Box>
          {' Account'}
        </Typography>
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mb: 2 }}>
          Join Capme and start exploring your world.
        </Typography>

        {/* Error */}
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={1.5}>
            {/* Upload Image */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                {/* Concentric circles */}
                {[14, 28, 46, 66, 88].map((size, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 144 + size,
                      height: 144 + size,
                      borderRadius: '50%',
                      border: `1px solid rgba(76,78,255,${i === 0 ? 0.35 : 0.14 - i * 0.02})`,

                      pointerEvents: 'none',
                    }}
                  />
                ))}
                <RHFUploadAvatar
                  name="avatar"
                  sx={{
                    '& .upload-placeholder': {
                      color: '#4C4EFF',
                      bgcolor: 'rgba(76,78,255,0.08)',
                    },
                  }}
                />
              </Box>
              <Typography fontSize={12} fontWeight={500} sx={{ mt: 2, color: 'text.disabled' }}>
                Upload Your Image
              </Typography>
            </Box>

            {/* Full Name */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>Full Name <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
              <Field.Text
                name="fullName"
                placeholder="John Doe"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:user-3-line" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>Email <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
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
                sx={fieldSx}
              />
            </Box>

            {/* Phone Number */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>Phone Number <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
              <Field.Phone
                name="phoneNumber"
                sx={{
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                  borderColor: 'rgba(145,145,145,0.2)',
                  minHeight: 56,
                }}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.8 }}>Password <Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
              <Field.Text
                name="password"
                placeholder="6+ characters"
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
                sx={fieldSx}
              />
            </Box>

            {/* Terms checkbox */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={!!termsChecked}
                    onChange={(e) => setValue('terms', e.target.checked, { shouldValidate: true })}
                    sx={{ p: 0, mr: 1, color: errors.terms ? 'error.main' : undefined }}
                  />
                }
                label={
                  <Typography fontSize={13} color={errors.terms ? 'error.main' : 'text.secondary'}>
                    I accept the{' '}
                    <Link
                      component={RouterLink}
                      href={paths.dashboard.settings.terms}
                      fontWeight={700}
                      color="#4C4EFF"
                      underline="none"
                    >
                      Terms &amp; Conditions
                    </Link>
                  </Typography>
                }
                sx={{ m: 0, alignItems: 'center' }}
              />
              {errors.terms && (
                <FormHelperText error sx={{ mt: 0.5, ml: 0.5 }}>
                  {errors.terms.message}
                </FormHelperText>
              )}
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
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
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

        {/* Google */}
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

        {/* Footer */}
        <Typography align="center" fontSize={13} color="text.secondary" sx={{ mt: 2 }}>
          Already Have An Account?{' '}
          <Link component={RouterLink} href={paths.auth.jwt.signIn} fontWeight={700} color="#4C4EFF" underline="none">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
