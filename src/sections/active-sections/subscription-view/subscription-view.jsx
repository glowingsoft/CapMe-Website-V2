import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { selectUser } from 'src/store/slices/userSlice';
import { useLazyGetSubscriptionPlansQuery } from 'src/store/Reducer/payment-api';
import PurchaseTokensModal from './purchase-tokens-modal';

function getActivePlanId(user, plans) {
  if (user?.is_friendly_subscription) return null;
  if (!user?.is_active_subscription) return null;
  const userPlan = user?.subscription?.plan ?? '';
  // Match against stripePlanId or _id
  const matched = plans.find(
    (p) => p.stripePlanId === userPlan || p._id === userPlan
  );
  return matched?._id ?? null;
}

function formatInterval(interval) {
  return interval === 'year' ? '/ Year' : '/ Month';
}

export default function SubscriptionView() {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);

  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const isActiveSubscription = !!(currentUser?.is_active_subscription || currentUser?.is_friendly_subscription);
  const activePlanId = getActivePlanId(currentUser, plans);

  const [fetchPlans, { isFetching }] = useLazyGetSubscriptionPlansQuery();

  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchPlans().then((res) => {
      const data = res?.data?.data ?? res?.data ?? [];
      const active = Array.isArray(data) ? data.filter((p) => p.isActive) : [];
      setPlans(active);
      if (active.length > 0 && !selectedPlanId) setSelectedPlanId(active[0]._id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          {isFetching
            ? [0, 1].map((i) => (
                <Skeleton key={i} variant="rounded" sx={{ flex: 1, height: 260, borderRadius: 4 }} />
              ))
            : plans.map((plan) => {
                const isSelected = selectedPlanId === plan._id;
                const isActivePlan = activePlanId === plan._id;
                const period = formatInterval(plan.interval);
                const tokenLabel = 'Unlimited';

                const expiryDate = isActivePlan && currentUser?.subscription?.end
                  ? new Date(currentUser.subscription.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;

                // Only show selection highlight when no subscription is active
                const showSelected = !isActiveSubscription && isSelected;
                const isYearly = plan.interval === 'year' || plan.interval === 'annual';

                return (
                  <Card
                    key={plan._id}
                    onClick={() => !isActiveSubscription && setSelectedPlanId(plan._id)}
                    sx={{
                      flex: 1,
                      borderRadius: 4,
                      boxShadow: isActivePlan
                        ? '0 8px 40px rgba(34,197,94,0.18)'
                        : showSelected
                        ? '0 8px 40px rgba(76,78,255,0.18)'
                        : isYearly
                        ? '0 8px 40px rgba(245,158,11,0.13)'
                        : '0 8px 40px rgba(0,0,0,0.10)',
                      border: isActivePlan
                        ? '2px solid #22C55E'
                        : showSelected
                        ? '2px solid #4C4EFF'
                        : isYearly
                        ? '2px solid rgba(245,158,11,0.35)'
                        : '2px solid transparent',
                      p: 3,
                      pt: isYearly ? 4.5 : 3,
                      cursor: isActiveSubscription ? 'default' : 'pointer',
                      transition: 'all 0.18s',
                      bgcolor: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    {/* Popular ribbon — yearly only */}
                    {isYearly && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -1,
                          left: 20,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.45,
                          background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                          borderRadius: '0 0 10px 10px',
                          boxShadow: '0 4px 12px rgba(245,158,11,0.40)',
                        }}
                      >
                        <Box
                          component="svg"
                          viewBox="0 0 24 24"
                          sx={{ width: 11, height: 11, fill: '#fff' }}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </Box>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                          Most Popular
                        </Typography>
                      </Box>
                    )}

                    {/* Active plan tick badge */}
                    {isActivePlan && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: '#22C55E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
                        }}
                      >
                        <Box
                          component="svg"
                          viewBox="0 0 24 24"
                          sx={{ width: 16, height: 16, fill: 'none', stroke: '#fff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </Box>
                      </Box>
                    )}

                    {/* Plan name */}
                    <Typography fontWeight={800} fontSize={20} sx={{ mb: 1, pr: isActivePlan ? 4 : 0 }}>
                      {plan.name}
                      {isActivePlan && (
                        <Box component="span" sx={{ ml: 1.5, fontSize: 11, fontWeight: 700, color: '#22C55E', bgcolor: 'rgba(34,197,94,0.10)', borderRadius: 1, px: 0.8, py: 0.3, verticalAlign: 'middle' }}>
                          Active
                        </Box>
                      )}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography sx={{ color: '#4C4EFF', fontWeight: 800, fontSize: 42, lineHeight: 1 }}>
                          ${plan.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {period}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2, flex: 1 }}>
                      {plan.description}
                    </Typography>

                    {/* Token */}
                    <Typography variant="body2" fontWeight={700}>
                      Available Token:{' '}
                      <Box component="span" sx={{ color: '#4C4EFF', fontWeight: 700 }}>
                        {tokenLabel}
                      </Box>
                    </Typography>

                    {/* Expiry date */}
                    {expiryDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1 }}>
                        <Box component="span" sx={{ fontSize: 11, color: '#22C55E' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#22C55E', fontWeight: 600 }}>
                          Expires {expiryDate}
                        </Typography>
                      </Box>
                    )}

                    {/* Selected / active indicator */}
                    <Box
                      sx={{
                        mt: 2.5,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isActivePlan ? '#22C55E' : showSelected ? '#4C4EFF' : 'rgba(0,0,0,0.06)',
                        transition: 'background 0.18s',
                      }}
                    />
                  </Card>
                );
              })}
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            disabled={isActiveSubscription || !selectedPlanId}
            onClick={() => setSubscriptionModalOpen(true)}
            startIcon={<Iconify icon="solar:crown-bold" width={18} />}
            sx={{
              background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
              color: '#fff',
              borderRadius: 2.5,
              px: 3.5,
              py: 1.4,
              fontWeight: 700,
              fontSize: 15,
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(76,78,255,0.30)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
                boxShadow: '0 8px 24px rgba(76,78,255,0.40)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                background: 'rgba(76,78,255,0.25)',
                color: 'rgba(255,255,255,0.6)',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {isActiveSubscription ? 'Already Subscribed' : 'Subscribe'}
          </Button>

          <Button
            variant="contained"
            size="large"
            disabled={isActiveSubscription}
            onClick={() => setTokenModalOpen(true)}
            startIcon={<Iconify icon="solar:ticket-bold" width={18} />}
            sx={{
              background: 'linear-gradient(135deg, #18181B 0%, #374151 100%)',
              color: '#fff',
              borderRadius: 2.5,
              px: 3.5,
              py: 1.4,
              fontWeight: 700,
              fontSize: 15,
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #2c2c2f 0%, #4b5563 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.30)',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            Purchase ME Tokens
          </Button>
        </Stack>

        <PurchaseTokensModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} mode="tokens" />

        <PurchaseTokensModal
          open={subscriptionModalOpen}
          onClose={() => setSubscriptionModalOpen(false)}
          mode="subscription"
          selectedPlanId={selectedPlanId}
          plans={plans}
        />

      </Box>
    </Box>
  );
}
