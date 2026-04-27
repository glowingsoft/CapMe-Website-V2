import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'src/components/snackbar';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
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
// import { useAdminLoginMutation, useLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { handleApiError } from 'src/utils/errorHandler';
import { getDeviceType } from 'src/utils/getDeviceType';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

// Mock login function
const mockLogin = async (payload) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response data
  const mockResponse = {
    message: 'Login success',
    data: {
      basicInfo: {
        _id: '692c5523e446ec147ce153aa',
        profileIcon: 'https://dummybucket.s3.us-east-1.amazonaws.com/noimage.png',
        name: payload.userType === 'admin' ? 'Admin User' : 'Suheer',
        email: payload.email,
        phoneNumber: null,
        language: 'en',
      },
      accountState: {
        userType: payload.userType,
        status: 'active',
        verificationStatus: {
          email: 'verified',
          phoneNumber: 'pending',
        },
      },
      metadata: {
        timezone: payload.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
      otpInfo: {
        emailOtp: {
          otp: '835987',
          otpUsed: false,
          otpRequestCount: 1,
          otpRequestTimestamp: new Date().toISOString(),
          otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
        phoneNumberOtp: {
          otp: '',
          otpUsed: false,
          otpRequestCount: 0,
          otpRequestTimestamp: new Date().toISOString(),
        },
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTJjNTUyM2U0NDZlYzE0N2NlMTUzYWEiLCJpYXQiOjE3NjUxNzM1MjB9.WpcTqWkmgAVpx-mn9KNvNIPjPlwO6aONXKJvu30AvZU',
    },
  };

  return mockResponse;
};

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();

  // API hooks commented out
  // const [login] = useLoginMutation();
  // const [adminLogin] = useAdminLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
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

  const goTo = (permission) => {
    switch (permission) {
      case 1:
        router.push(paths.adminDashboard.root);
        break;
      case 2:
        router.push(paths.dashboard.root);
        break;
      default:
        router.push('/');
        break;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const deviceType = getDeviceType();

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userType: data.email.includes('admin') ? 'admin' : 'user',
      deviceType,
      deviceId: '123',
    };

    try {
      // API calls commented out - using mock data instead
      // let response;
      // if (payload.userType === 'admin') {
      //   response = await adminLogin(payload).unwrap();
      // } else {
      //   response = await login(payload).unwrap();
      // }

      // Using mock login function
      const response = await mockLogin(payload);

      console.log('Login Response:', response);

      if (response.error) {
        return toast.error(response.error.data?.message);
      }

      if (!response.data) {
        toast.error('Login failed: No user data received');
        router.push('/');
        return null;
      }

      const user = response.data;

      if (!user) {
        return router.push('/404');
      }

      if (!user?.accountState?.status) {
        toast.error('Your account is inactive. Please contact support.');
        return null;
      }

      const user_type = user?.accountState?.userType === 'user' ? 2 : 1;
      const permission = user_type;

      const UpdatedUserData = {
        ...user,
        permission,
      };

      console.log('Updated User Data', UpdatedUserData);

      dispatch(setUser(UpdatedUserData));
      goTo(user_type);

      reset();
      toast.success('Login successful!');
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error.message);
      handleApiError(error);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Sign in to your account</Typography>

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
      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="6+ characters"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Link component={RouterLink} href={paths.auth.jwt.forgetPassword} variant="body2" color="inherit" sx={{ alignSelf: 'flex-end' }}>
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Sign in...">
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'src/components/snackbar';
// import { z as zod } from 'zod';

// import LoadingButton from '@mui/lab/LoadingButton';
// import Alert from '@mui/material/Alert';
// import IconButton from '@mui/material/IconButton';
// import InputAdornment from '@mui/material/InputAdornment';
// import Link from '@mui/material/Link';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';

// import { RouterLink } from 'src/routes/components';
// import { useRouter } from 'src/routes/hooks';
// import { paths } from 'src/routes/paths';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { Field, Form } from 'src/components/hook-form';
// import { Iconify } from 'src/components/iconify';

// import { useDispatch } from 'react-redux';
// import { useAdminLoginMutation, useLoginMutation } from 'src/store/Reducer/auth';
// import { setUser } from 'src/store/slices/userSlice';
// import { handleApiError } from 'src/utils/errorHandler';
// import { getDeviceType } from 'src/utils/getDeviceType';

// // ----------------------------------------------------------------------

// export const SignInSchema = zod.object({
//   email: zod
//     .string()
//     .min(1, { message: 'Email is required!' })
//     .email({ message: 'Email must be a valid email address!' }),
//   password: zod
//     .string()
//     .min(1, { message: 'Password is required!' })
//     .min(6, { message: 'Password must be at least 6 characters!' }),
// });

// // ----------------------------------------------------------------------

// export function JwtSignInView() {
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const [login] = useLoginMutation();
//   const [adminLogin] = useAdminLoginMutation();

//   const [errorMsg, setErrorMsg] = useState('');

//   const password = useBoolean();

//   const defaultValues = {
//     email: '',
//     password: '',
//   };

//   const methods = useForm({
//     resolver: zodResolver(SignInSchema),
//     defaultValues,
//   });

//   const {
//     reset,
//     handleSubmit,
//     formState: { isSubmitting },
//   } = methods;

//   const goTo = (permission) => {
//     switch (permission) {
//       case 1:
//         router.push(paths.adminDashboard.root);
//         break;
//       case 2:
//         router.push(paths.dashboard.root);
//         break;
//       default:
//         router.push('/');
//         break;
//     }
//   }

//   const onSubmit = handleSubmit(async (data) => {
//     const deviceType = getDeviceType();

//     const payload = {
//       email: data.email.trim().toLowerCase(),
//       password: data.password,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       userType: data.email.includes('admin') ? 'admin' : 'user',
//       deviceType,
//       deviceId: '123'
//     };

//     try {

//       let response;

//       if (payload.userType === 'admin') {
//         response = await adminLogin(payload).unwrap();
//       } else {
//         response = await login(payload).unwrap();
//       }

//       // const response = await login(payload).unwrap();
//       console.log('Login Response:', response);

//       if (response.error) {
//         return toast.error(response.error.data?.message);
//       }

//       if (!response.data) {
//         toast.error('Login failed: No user data received');
//         router.push('/');
//         return null;
//       }

//       const user = response.data;

//       if (!user) {
//         return router.push('/404');
//       }

//       if (!user?.accountState?.status) {
//         toast.error('Your account is inactive. Please contact support.');
//         return null;
//       }

//       const user_type = user?.accountState?.userType === 'user' ? 2 : 1;
//       const permission = user_type

//       const UpdatedUserData = {
//         ...user,
//         permission,
//       }

//       console.log("Updated User Data", UpdatedUserData);

//       dispatch(setUser(UpdatedUserData));
//       goTo(user_type);

//       reset();
//     } catch (error) {
//       setErrorMsg(typeof error === 'string' ? error : error.message);
//       handleApiError(error);
//     }
//   });

//   const renderHead = (
//     <Stack spacing={1.5} sx={{ mb: 5 }}>
//       <Typography variant="h5">Sign in to your account</Typography>

//       <Stack direction="row" spacing={0.5}>
//         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//           {`Don't have an account?`}
//         </Typography>

//         <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
//           Get started
//         </Link>
//       </Stack>
//     </Stack>
//   );

//   const renderForm = (
//     <Stack spacing={3}>
//       <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

//       <Stack spacing={1.5}>
//         <Field.Text
//           name="password"
//           label="Password"
//           placeholder="6+ characters"
//           type={password.value ? 'text' : 'password'}
//           InputLabelProps={{ shrink: true }}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton onClick={password.onToggle} edge="end">
//                   <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         <Link
//           component={RouterLink}
//           href="#"
//           variant="body2"
//           color="inherit"
//           sx={{ alignSelf: 'flex-end' }}
//         >
//           Forgot password?
//         </Link>
//       </Stack>

//       <LoadingButton
//         fullWidth
//         color="inherit"
//         size="large"
//         type="submit"
//         variant="contained"
//         loading={isSubmitting}
//         loadingIndicator="Sign in..."
//       >
//         Sign in
//       </LoadingButton>
//     </Stack>
//   );

//   return (
//     <>
//       {renderHead}

//       {!!errorMsg && (
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {errorMsg}
//         </Alert>
//       )}

//       <Form methods={methods} onSubmit={onSubmit}>
//         {renderForm}
//       </Form>
//     </>
//   );
// }
