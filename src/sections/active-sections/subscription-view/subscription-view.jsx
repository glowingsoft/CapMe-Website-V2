import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import PurchaseTokensModal from './purchase-tokens-modal';

const PLANS = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    description:
      'Go Premium Monthly—unlock unlimited features, and priority benefits designed to enhance your social experience.',
    price: '$8.99',
    period: '/ Month',
    token: 'Unlimited',
    billedNote: '$107.88 billed annually',
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    description:
      'Go Premium Yearly—unlock unlimited features, priority benefits and save $7.89',
    price: '$99.99',
    period: '/ Year',
    token: 'Unlimited',
    billedNote: null,
  },
];

export default function SubscriptionView() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const navigate = useNavigate();
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onNotificationsChange = (e) => setNotificationsDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('notificationsDrawerChange', onNotificationsChange);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('notificationsDrawerChange', onNotificationsChange);
    };
  }, []);

  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen || notificationsDrawerOpen;

  return (
    <Box sx={{ bgcolor: '#f4f5f9', minHeight: 'calc(100vh - 105px)', py: 4, px: 2, mr: anyRightDrawerOpen ? { md: '420px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

        {/* Back button */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 2,
              width: 36,
              height: 36,
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            <Iconify icon="mingcute:left-line" width={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>Subscription</Box>
              {' Plans'}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Manage your plan and tokens.
            </Typography>
          </Box>
        </Stack>

        {/* Banner */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            borderRadius: 4,
            p: 3,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, mb: 1 }}>
            <Box component="span" sx={{ color: '#c7d2fe' }}>Premium</Box>
            {' Plans'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6 }}>
            Enhance your experience with advanced social tools and personalized
            features—try our latest plans.
          </Typography>
        </Box>

        {/* Plan cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  boxShadow: isSelected
                    ? '0 8px 40px rgba(76,78,255,0.18)'
                    : '0 8px 40px rgba(0,0,0,0.10)',
                  border: isSelected ? '2px solid #4C4EFF' : '2px solid transparent',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Plan name */}
                <Typography fontWeight={800} fontSize={20} sx={{ mb: 1 }}>
                  {plan.name}
                </Typography>

                {/* Price */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ color: '#4C4EFF', fontWeight: 800, fontSize: 42, lineHeight: 1 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {plan.period}
                    </Typography>
                  </Box>
                  {plan.billedNote && (
                    <Typography variant="caption" sx={{ color: '#4C4EFF', fontWeight: 600 }}>
                      {plan.billedNote}
                    </Typography>
                  )}
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2, flex: 1 }}>
                  {plan.description}
                </Typography>

                {/* Token */}
                <Typography variant="body2" fontWeight={700}>
                  Available Token:{' '}
                  <Box component="span" sx={{ color: '#4C4EFF', fontWeight: 700 }}>
                    {plan.token}
                  </Box>
                </Typography>

                {/* Selected indicator */}
                <Box
                  sx={{
                    mt: 2.5,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: isSelected ? '#4C4EFF' : 'rgba(0,0,0,0.06)',
                    transition: 'background 0.18s',
                  }}
                />
              </Card>
            );
          })}
        </Stack>

        {/* Trial info */}
        <Box
          sx={{
            bgcolor: '#ebebeb',
            borderRadius: 3,
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#555',
              mt: '5px',
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
            A 7-day free trial is available with all Premium plans—monthly or yearly. You can
            cancel anytime during the trial, and you won't be charged.
          </Typography>
        </Box>

        {/* Action buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setSubscriptionModalOpen(true)}
            sx={{
              bgcolor: '#4C4EFF',
              color: '#fff',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#3739b7', boxShadow: 'none' },
            }}
          >
            Subscribe
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(0,0,0,0.2)',
              color: 'text.primary',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              textTransform: 'none',
              '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
            }}
          >
            Restore Purchase
          </Button>

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#18181B',
              color: '#fff',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2c2c2f', boxShadow: 'none' },
            }}
            onClick={() => setTokenModalOpen(true)}
          >
            Purchase ME Tokens
          </Button>
        </Stack>

        <PurchaseTokensModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} mode='tokens' />

        <PurchaseTokensModal open={subscriptionModalOpen} onClose={() => setSubscriptionModalOpen(false)} mode='subscription' selectedPlan={selectedPlan} />

        {/* Legal footer */}
        {/* <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', lineHeight: 1.8 }}
        >
          Your subscription will automatically renew. Your credit card will be charged through
          your Apple ID unless auto-renew is turned off at least 24-hours before the end of the
          current period. You can turn off auto-renew and cancel the subscription at any time
          from your Apple ID settings. You do not need to subscribe to use the app. To learn
          more, visit our{' '}
          <Box
            component={RouterLink}
            href={paths.dashboard.settings.terms}
            sx={{ color: '#4C4EFF', fontWeight: 600, textDecoration: 'underline' }}
          >
            terms & conditions
          </Box>
          {' '}and{' '}
          <Box
            component={RouterLink}
            href={paths.dashboard.settings.privacy}
            sx={{ color: '#4C4EFF', fontWeight: 600, textDecoration: 'underline' }}
          >
            Privacy Policy.
          </Box>
        </Typography> */}

      </Box>
    </Box>
  );
}
