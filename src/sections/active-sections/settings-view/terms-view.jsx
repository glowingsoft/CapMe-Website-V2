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
    title: 'Acceptance of Terms',
    body: `By accessing or using Capme, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.`,
  },
  {
    title: 'Use of the Service',
    body: `You agree to use Capme only for lawful purposes. You must not use the platform to post content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable. You are responsible for all activity under your account.`,
  },
  {
    title: 'User Content',
    body: `You retain ownership of content you post on Capme. By posting, you grant Capme a non-exclusive, royalty-free licence to use, display, and distribute your content within the platform. You represent that your content does not infringe any third-party rights.`,
  },
  {
    title: 'Account Termination',
    body: `We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activity, or misuse the platform in any way that harms other users or the integrity of the service.`,
  },
  {
    title: 'Intellectual Property',
    body: `All platform content, trademarks, and code are the property of Capme or its licensors. You may not copy, reproduce, or distribute any part of the platform without prior written consent.`,
  },
  {
    title: 'Limitation of Liability',
    body: `Capme is provided on an "as is" basis. To the maximum extent permitted by law, we disclaim all warranties and shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.`,
  },
  {
    title: 'Changes to Terms',
    body: `We may update these terms from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: 'Governing Law',
    body: `These terms are governed by the laws of the jurisdiction in which Capme operates. Any disputes shall be resolved through binding arbitration or the courts of that jurisdiction.`,
  },
];

export default function TermsView() {
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
              <Box component="span" sx={{ color: '#4C4EFF' }}>Terms</Box>
              {' & Conditions'}
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
              Please read these Terms and Conditions carefully before using the Capme platform. These terms govern your access to and use of our services.
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
