import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide when you create an account (name, email address, profile photo), content you post on the platform, and usage data such as pages visited, features used, and interactions with other users.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use your information to operate and improve the Capme platform, personalise your experience, send service-related communications, analyse usage patterns to enhance features, and comply with legal obligations.`,
  },
  {
    title: 'Sharing of Information',
    body: `We do not sell your personal data. We may share information with trusted third-party service providers who assist in operating the platform (hosting, analytics, customer support) under strict confidentiality agreements.`,
  },
  {
    title: 'Cookies & Tracking',
    body: `We use cookies and similar technologies to maintain sessions, remember preferences, and gather analytics. You can manage cookie preferences through your browser settings, though some features may be affected.`,
  },
  {
    title: 'Data Retention',
    body: `We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting our support team.`,
  },
  {
    title: 'Security',
    body: `We implement industry-standard security measures including encryption in transit (TLS) and at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: 'Your Rights',
    body: `Depending on your location, you may have rights to access, correct, or delete your personal data; restrict or object to processing; and data portability. To exercise these rights, contact us at privacy@capme.app.`,
  },
  {
    title: "Children's Privacy",
    body: `Capme is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy periodically. We will notify you of material changes via email or an in-app notice. Your continued use of the platform constitutes acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicyView() {
  const navigate = useNavigate();
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

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
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: '#f4f5f9',
        height: 'calc(100vh - 105px)',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
        mr: anyRightDrawerOpen ? { md: '420px' } : 0,
        transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>

        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', '&:hover': { bgcolor: '#f0f0f0' } }}
          >
            <Iconify icon="mingcute:left-line" width={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>Privacy</Box>
              {' Policy'}
            </Typography>
            <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.3 }}>
              Last updated: January 2025
            </Typography>
          </Box>
        </Stack>

        {/* Card */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 1 }}>
            <Typography fontSize={14} color="text.secondary" lineHeight={1.8}>
              Your privacy matters to us. This policy explains what data we collect, how we use it, and the choices you have regarding your information when you use the Capme platform.
            </Typography>
          </Box>

          <Divider sx={{ mx: { xs: 3, md: 4 }, my: 2 }} />

          {SECTIONS.map((section, i) => (
            <Box key={section.title}>
              <Box sx={{ px: { xs: 3, md: 4 }, py: 2 }}>
                <Typography fontSize={15} fontWeight={700} sx={{ mb: 1 }}>
                  <Box component="span" sx={{ color: '#4C4EFF' }}>{i + 1}.</Box>
                  {` ${section.title}`}
                </Typography>
                <Typography fontSize={14} color="text.secondary" lineHeight={1.85}>
                  {section.body}
                </Typography>
              </Box>
              {i < SECTIONS.length - 1 && <Divider sx={{ mx: { xs: 3, md: 4 } }} />}
            </Box>
          ))}

          <Box sx={{ pb: 3 }} />
        </Box>
      </Box>
    </Box>
  );
}
