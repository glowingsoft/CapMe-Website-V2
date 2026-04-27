import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const OtpVerifySchema = zod.object({
  otp: zod.string().min(4, { message: 'OTP is required!' }).max(6, { message: 'OTP must be 4-6 digits!' }),
});

// ----------------------------------------------------------------------

export function JwtVerifyPasswordView() {
  const router = useRouter();

  const defaultValues = {
    otp: '',
  };

  const methods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    // Navigate to reset password page after OTP verification
    router.push(paths.auth.jwt.resetPassword);
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Verify OTP</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Please enter the One-Time Password (OTP) sent to your email address to continue.
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="otp" label="OTP Code" placeholder="Enter OTP" InputLabelProps={{ shrink: true }} inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }} />

      <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Verifying...">
        Verify OTP
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
