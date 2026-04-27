import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod
  .object({
    newPassword: zod.string().min(6, { message: 'New password must be at least 6 characters!' }),
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

  const defaultValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    // router.push(paths.auth.jwt.signIn);
    router.push('/');
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Reset your password</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Please enter your new password and confirm it below.
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="newPassword"
        label="New Password"
        placeholder="Enter your new password"
        type={newPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPassword.onToggle} edge="end">
                <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your new password"
        type={confirmPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Resetting...">
        Reset Password
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}
      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
