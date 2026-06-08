import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { selectUser } from 'src/store/slices/userSlice';
import { useCreatePaymentMutation } from 'src/store/Reducer/payment-api';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'src/components/snackbar';

const TOKEN_PACKAGES = [
  { id: 'pkg20', tokens: 20, price: 2.0 },
  { id: 'pkg40', tokens: 40, price: 4.0 },
  { id: 'pkg60', tokens: 60, price: 6.0 },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    description:
      'Go Premium Monthly—unlock unlimited features, and priority benefits designed to enhance your social experience.',
    price: 8.99,
    period: 'Month',
    token: 'Unlimited',
    billedNote: '$107.88 billed annually',
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    description:
      'Go Premium Yearly—unlock unlimited features, priority benefits and save $7.89',
    price: 99.99,
    period: 'Year',
    token: 'Unlimited',
    billedNote: null,
  },
];

function Field({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        fontSize={13}
        fontWeight={700}
        sx={{ mb: 0.75, color: '#111' }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          bgcolor: '#f4f5f9',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography fontSize={14}>{value || '-'}</Typography>
      </Box>
    </Box>
  );
}

export default function PurchaseTokensModal({ open, onClose, mode = 'tokens', selectedPlan }) {
  const [selectedPkg, setSelectedPkg] = useState('pkg60');

  useEffect(() => {
    setSelectedPkg(mode === 'tokens' ? 'pkg60' : 'monthly');
  }, [mode]);

  const user = useSelector(selectUser);

  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const name =
    user?.basicInfo?.name ||
    user?.displayName ||
    '';

  const email =
    user?.email ||
    user?.basicInfo?.email ||
    '';

  const plans =
    mode === 'tokens'
      ? TOKEN_PACKAGES
      : SUBSCRIPTION_PLANS;

  const pkg =
    mode === 'tokens'
      ? plans.find((item) => item.id === selectedPkg)
      : SUBSCRIPTION_PLANS.find(
        (item) => item.id === selectedPlan
      );

  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      console.log('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      alert('Card details are required');
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email,
        },
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      console.log('NEW PAYMENT METHOD:', paymentMethod.id);

      const payload =
        mode === 'tokens'
          ? {
            amount: pkg.price,
            currency: 'usd',
            payment_method_id: paymentMethod.id,
            tokens: pkg.tokens,
          }
          : {
            amount: pkg.price,
            currency: 'usd',
            payment_method_id: paymentMethod.id,
            plan: pkg.id,
          };

      console.log('PAYLOAD:', payload);

      const response = await createPayment(payload).unwrap();

      console.log('API RESPONSE:', response);

      toast.success('Payment completed successfully');
      onClose?.();
    } catch (err) {
      console.error('PAYMENT ERROR:', err);
      alert(
        err?.data?.message ||
        err?.message ||
        'Payment failed'
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify
                icon="solar:card-bold"
                width={24}
                style={{ color: '#fff' }}
              />

              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                Payment
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 13,
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              {mode === 'tokens' ? 'Purchase ME Tokens' : "Subscribe"}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 3 }}>
          {mode === 'tokens' && (
            <>
              <Typography
                fontSize={14}
                fontWeight={700}
                sx={{ mb: 1.5 }}
              >
                Select Token Package
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                ...
              </Stack>
            </>
          )}
          {mode === 'tokens' && (
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              {plans.map((p) => {
                const active = selectedPkg === p.id;

                return (
                  <Box
                    key={p.id}
                    onClick={() => setSelectedPkg(p.id)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderRadius: 3,
                      transition: '0.2s',
                      position: 'relative',
                      border: active
                        ? '2px solid #4C4EFF'
                        : '1px solid #ddd',
                      bgcolor: active ? '#4C4EFF' : '#fff',
                    }}
                  >
                    <Typography
                      fontWeight={800}
                      fontSize={15}
                      sx={{
                        color: active ? '#fff' : '#111',
                      }}
                    >
                      {`${p.tokens} Tokens`}
                    </Typography>

                    <Typography
                      fontSize={13}
                      sx={{
                        color: active
                          ? 'rgba(255,255,255,0.8)'
                          : 'text.secondary',
                      }}
                    >
                      ${p.price.toFixed(2)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}

          {mode === 'subscription' && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f4f5f9',
                border: '1px solid #e5e7eb',
              }}
            >
              <Typography fontWeight={700}>
                {pkg?.name}
              </Typography>

              <Typography color="text.secondary">
                ${pkg?.price} / {pkg?.period}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          <Field label="Full Name" value={name} />

          <Field label="Email" value={email} />

          <Field
            label="Amount (USD)"
            value={pkg ? `$${pkg.price.toFixed(2)}` : '$0.00'}
          />

          <Box sx={{ mb: 3 }}>
            <Typography
              fontSize={13}
              fontWeight={700}
              sx={{ mb: 0.75, color: '#111' }}
            >
              Card Details
            </Typography>

            <Box
              sx={{
                bgcolor: '#f4f5f9',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                px: 2,
                py: 2,
              }}
            >
              <CardElement
                options={{
                  hidePostalCode: true,
                }}
              />
            </Box>
          </Box>

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={isLoading}
            onClick={handlePayment}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 15,
              textTransform: 'none',
              bgcolor: '#4C4EFF',
              '&:hover': {
                bgcolor: '#3739b7',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              mode === 'tokens'
                ? `Pay $${pkg?.price.toFixed(2)} — Get ${pkg?.tokens} Tokens`
                : `Subscribe to ${pkg?.name} — $${pkg?.price.toFixed(2)}`
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}