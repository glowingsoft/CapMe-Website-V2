import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function JwtForgetPasswordView() {
  const router = useRouter();

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    // Navigate to reset password page after submission
    router.push(paths.auth.jwt.verifyPassword);
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Forget your password?</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`Don't have an account?`}
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Get started
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="email" label="Email address" placeholder="Enter your email" InputLabelProps={{ shrink: true }} />

      <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Forget Password...">
        Forget Password
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