import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { Icon } from '@iconify/react';
import { Iconify } from 'src/components/iconify';
import { selectUser, updateSubscription } from 'src/store/slices/userSlice';
import {
  useCreatePaymentMutation,
  useCreateSubscriptionMutation,
  useLazyValidateSubscriptionQuery,
} from 'src/store/Reducer/payment-api';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'src/components/snackbar';

const TOKEN_PACKAGES = [
  { id: 'pkg20', tokens: 20, price: 2.0, popular: false },
  { id: 'pkg40', tokens: 40, price: 4.0, popular: false },
  { id: 'pkg60', tokens: 60, price: 6.0, popular: true },
];

const CARD_ELEMENT_OPTIONS = { hidePostalCode: true };

export default function PurchaseTokensModal({ open, onClose, mode = 'tokens', selectedPlanId, plans = [] }) {
  const [selectedPkg, setSelectedPkg] = useState('pkg60');
  const [cardFocused, setCardFocused] = useState(false);

  useEffect(() => {
    if (mode === 'tokens') setSelectedPkg('pkg60');
  }, [mode]);

  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [createPayment, { isLoading: isPaymentLoading }] = useCreatePaymentMutation();
  const [createSubscription, { isLoading: isSubscriptionLoading }] = useCreateSubscriptionMutation();
  const [validateSubscription] = useLazyValidateSubscriptionQuery();

  const isLoading = isPaymentLoading || isSubscriptionLoading;

  const name = user?.basicInfo?.name || user?.displayName || '';
  const email = user?.email || user?.basicInfo?.email || '';

  const pkg =
    mode === 'tokens'
      ? TOKEN_PACKAGES.find((item) => item.id === selectedPkg)
      : plans.find((item) => item._id === selectedPlanId);

  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card details are required');
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name, email },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (mode === 'subscription') {
        if (!selectedPlanId) {
          toast.error('No plan selected. Please try again.');
          return;
        }

        await createSubscription({
          planId: selectedPlanId,
          paymentMethodId: paymentMethod.id,
        }).unwrap();

        const res = await validateSubscription();
        if (res?.data) dispatch(updateSubscription(res.data));

        toast.success('Subscription activated successfully!');
      } else {
        await createPayment({
          amount: pkg.price,
          currency: 'usd',
          payment_method_id: paymentMethod.id,
          tokens: pkg.tokens,
        }).unwrap();

        toast.success('Payment completed successfully');
      }

      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Payment failed');
    }
  };

  const intervalLabel = pkg?.interval === 'year' ? 'Year' : 'Month';

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
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                icon={mode === 'tokens' ? 'solar:ticket-bold' : 'solar:crown-bold'}
                width={20}
                style={{ color: '#fff' }}
              />
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
                {mode === 'tokens' ? 'Purchase ME Tokens' : 'Subscribe to Plan'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {mode === 'tokens' ? 'Top up your token balance instantly' : 'Unlock premium features'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 3, py: 3 }}>

          {/* Token packages */}
          {mode === 'tokens' && (
            <Box sx={{ mb: 3 }}>
              <Typography fontSize={13} fontWeight={700} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Select Package
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {TOKEN_PACKAGES.map((p) => {
                  const active = selectedPkg === p.id;
                  return (
                    <Box
                      key={p.id}
                      onClick={() => setSelectedPkg(p.id)}
                      sx={{
                        flex: 1,
                        pt: p.popular ? 1 : 1.75,
                        pb: 1.75,
                        cursor: 'pointer',
                        textAlign: 'center',
                        borderRadius: 3,
                        transition: 'all 0.18s',
                        position: 'relative',
                        border: active ? '2px solid #4C4EFF' : '1.5px solid #e5e7eb',
                        bgcolor: active ? 'rgba(76,78,255,0.05)' : '#fafafa',
                        boxShadow: active ? '0 4px 16px rgba(76,78,255,0.15)' : 'none',
                      }}
                    >
                      {p.popular && (
                        <Box sx={{ mb: 0.5 }}>
                          <Chip
                            label="Popular"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: active ? '#4C4EFF' : '#111',
                              color: '#fff',
                              borderRadius: 1,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        </Box>
                      )}
                      <Typography fontWeight={800} fontSize={16} sx={{ color: active ? '#4C4EFF' : '#111' }}>
                        {p.tokens}
                      </Typography>
                      <Typography fontSize={11} fontWeight={600} sx={{ color: active ? '#4C4EFF' : 'text.secondary' }}>
                        Tokens
                      </Typography>
                      <Typography fontSize={13} fontWeight={700} sx={{ color: active ? '#4C4EFF' : '#555', mt: 0.5 }}>
                        ${p.price.toFixed(2)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Subscription plan summary */}
          {mode === 'subscription' && pkg && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(76,78,255,0.06) 0%, rgba(123,94,167,0.06) 100%)',
                border: '1.5px solid rgba(76,78,255,0.15)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon="solar:crown-bold" width={18} style={{ color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography fontWeight={800} fontSize={15}>{pkg.name}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      Billed per {intervalLabel.toLowerCase()}
                    </Typography>
                  </Box>
                </Stack>
                <Typography fontWeight={800} fontSize={20} sx={{ color: '#4C4EFF' }}>
                  ${pkg.price}
                </Typography>
              </Stack>

              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(76,78,255,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="solar:ticket-bold" width={14} style={{ color: '#4C4EFF' }} />
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Tokens:{' '}
                  <Box component="span" sx={{ color: '#4C4EFF', fontWeight: 800 }}>
                    {pkg.tokens === 0 || pkg.tokens == null ? 'Unlimited' : pkg.tokens}
                  </Box>
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2.5 }}>
            <Typography fontSize={11} color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Payment Details
            </Typography>
          </Divider>

          {/* Info rows */}
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}
              sx={{ bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1.25 }}
            >
              <Icon icon="solar:user-bold" width={16} style={{ color: '#4C4EFF', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={11} color="text.secondary" fontWeight={600}>Full Name</Typography>
                <Typography fontSize={14} fontWeight={600} noWrap>{name || '—'}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}
              sx={{ bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1.25 }}
            >
              <Icon icon="solar:letter-bold" width={16} style={{ color: '#4C4EFF', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={11} color="text.secondary" fontWeight={600}>Email</Typography>
                <Typography fontSize={14} fontWeight={600} noWrap>{email || '—'}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}
              sx={{ bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1.25 }}
            >
              <Icon icon="solar:dollar-minimalistic-bold" width={16} style={{ color: '#4C4EFF', flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={11} color="text.secondary" fontWeight={600}>Amount (USD)</Typography>
                <Typography fontSize={14} fontWeight={700} sx={{ color: '#111' }}>
                  {pkg ? `$${pkg.price.toFixed(2)}` : '$0.00'}
                </Typography>
              </Box>
            </Stack>

          </Stack>

          {/* Card input */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
              <Icon icon="solar:card-bold" width={15} style={{ color: '#4C4EFF' }} />
              <Typography fontSize={12} fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Card Details
              </Typography>
            </Stack>

            <Box
              sx={{
                bgcolor: cardFocused ? '#fff' : '#f8f9fb',
                border: `1.5px solid ${cardFocused ? '#4C4EFF' : '#e5e7eb'}`,
                borderRadius: 2,
                px: 2,
                py: 1.75,
                transition: 'all 0.18s',
              }}
            >
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onFocus={() => setCardFocused(true)}
                onBlur={() => setCardFocused(false)}
              />
            </Box>
          </Box>

          {/* Pay button */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={isLoading}
            onClick={handlePayment}
            sx={{
              py: 1.6,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: 15,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
              boxShadow: '0 4px 16px rgba(76,78,255,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3739b7 0%, #6a4e96 100%)',
                boxShadow: '0 6px 20px rgba(76,78,255,0.45)',
              },
              '&.Mui-disabled': { background: 'rgba(76,78,255,0.3)', boxShadow: 'none' },
            }}
          >
            {isLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : mode === 'tokens' ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Icon icon="solar:ticket-bold" width={18} />
                <span>Pay ${pkg?.price.toFixed(2)} — Get {pkg?.tokens} Tokens</span>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Icon icon="solar:crown-bold" width={18} />
                <span>Subscribe to {pkg?.name} — ${pkg?.price?.toFixed(2)}</span>
              </Stack>
            )}
          </Button>

          <Typography fontSize={11} color="text.secondary" textAlign="center" sx={{ mt: 1.5 }}>
            Secured by Stripe · Your card details are encrypted
          </Typography>

        </Box>
      </DialogContent>
    </Dialog>
  );
}
