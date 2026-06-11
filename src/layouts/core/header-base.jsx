import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { useTranslate } from 'src/locales';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  closeAllDrawers,
  closeChatHistoryDrawer,
  emitChatHistoryChange,
  DRAWER_EVENTS,
  closeOverlayDrawers,
  closeCommentDrawer,
  closeFilterDrawer,
  closeRoomRequestDrawer,
  closeDownloadedMediaDrawer,
} from 'src/utils/drawer-events';

import { Logo } from 'src/components/logo';
import { HeaderSection } from './header-section';
import CustomSearchBar from 'src/components/custom-search-bar';
import SearchOverlay from 'src/components/search-overlay/search-overlay';
import { Icon } from '@iconify/react';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { LanguagePopover } from '../components/language-popover';
import AnnouncementModal from '../components/announcement-modal';



const MONGO_ID_RE = /^[a-f0-9]{24}$/i;

function getSubscriptionLabel(user, t) {
  if (user?.is_friendly_subscription) return t('subscription.friendly');
  if (!user?.is_active_subscription || !user?.subscription?.plan) return t('subscription.no_active');

  const sub = user.subscription;
  const plan = sub.plan ?? '';
  const interval = sub.interval ?? '';

  const isYearly =
    interval === 'year' || interval === 'annual' ||
    plan.includes('year') || plan.includes('annual');
  const period = isYearly ? t('subscription.yearly') : t('subscription.monthly');

  // Use explicit name fields if the backend sends them
  const explicitName = sub.planName ?? sub.name;
  if (explicitName) return `${explicitName} · ${period}`;

  // Raw MongoDB ObjectId — don't show the ID, just show "Premium"
  if (MONGO_ID_RE.test(plan)) return `Premium · ${period}`;

  // Stripe-style slug e.g. "premium_monthly" → "Premium"
  const type = plan
    .replace(/_(monthly|yearly|annual)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${type} · ${period}`;
}

function getSubscriptionColor(user) {
  if (user?.is_friendly_subscription) return '#FF9900';
  if (!user?.is_active_subscription) return '#6B7280';

  const sub = user?.subscription ?? {};
  const interval = sub.interval ?? '';
  const plan = sub.plan ?? '';

  const isYearly =
    interval === 'year' || interval === 'annual' ||
    plan.includes('year') || plan.includes('annual');

  return isYearly ? '#34D399' : '#818CF8';
}

function isSubscriptionActive(user) {
  return !!(user?.is_friendly_subscription || user?.is_active_subscription);
}

// CapmeBox styled component
const CapmeBox = styled(Box)(({ theme }) => ({
  background: '#232323',
  borderRadius: 8,
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'column',
  minWidth: 120,
  marginRight: theme.spacing(2),
}));

const CapmeTitle = styled('span')(() => ({
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 2,
}));

const CapmeTokens = styled('span')(({ theme }) => ({
  color: '#FF9900',
  fontWeight: 700,
  fontSize: 28,
  marginLeft: theme.spacing(1),
}));

const CapmeSubtitle = styled('span')(() => ({
  color: '#bdbdbd',
  fontSize: 12,
  marginTop: 2,
}));

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,

  slotsDisplay: {
    signIn = true,
    account = true,
    purchase = true,
    searchbar = true,
    menuButton = true,
    localization = true,
  } = {},

  ...other
}) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslate('common');
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchAnchorRef = useRef(null);
  const searchInputRef = useRef(null);
  const currentUser = useSelector(selectUser);

  const handleOpenGarage = () => {
    const garageData = currentUser?.garageRoom;
    const garageRoom = {
      id: garageData?._id ?? garageData?.id ?? 'garage',
      _id: garageData?._id ?? garageData?.id ?? 'garage',
      name: garageData?.name ?? 'Garage',
      image: garageData?.image ?? '',
      visibility: garageData?.visibility ?? 'personal',
      isGarage: true,
      color: '#4C4EFF',
    };
    const isExactHome = location.pathname === '/home' || location.pathname === '/home/';
    if (isExactHome) {
      window.dispatchEvent(new CustomEvent('openRoom', { detail: garageRoom }));
    } else {
      navigate('/home', { state: { pendingRoom: garageRoom } });
    }
  };
  const params = new URLSearchParams(location.search);
  const chatMeTab = params.get('tab') || 'prompts';
  const showChatMeActions = (location.pathname === '/home/chat-me' || location.pathname === '/home/banking') && chatMeTab === 'prompts';
  const isHomePage = location.pathname === '/home' || location.pathname === '/home/';

  // Close all persistent right drawers on every page navigation
  useEffect(() => {
    closeChatHistoryDrawer();
    closeAllDrawers();
  }, [location.pathname]);

  useEffect(() => {
    emitChatHistoryChange(chatHistoryOpen);
    if (chatHistoryOpen) {
      closeOverlayDrawers();
      closeCommentDrawer();
      closeFilterDrawer();
      closeRoomRequestDrawer();
      closeDownloadedMediaDrawer();
    }
  }, [chatHistoryOpen]);

  useEffect(() => {
    const closeSearch = () => {
      setSearchOpen(false);
      setSearchQuery('');
      searchInputRef.current?.blur();
    };
    window.addEventListener('openRoom', closeSearch);
    window.addEventListener('openRoomMessage', closeSearch);
    return () => {
      window.removeEventListener('openRoom', closeSearch);
      window.removeEventListener('openRoomMessage', closeSearch);
    };
  }, []);

  useEffect(() => {
    const close = () => setChatHistoryOpen(false);
    window.addEventListener('accountDrawerOpened', close);
    window.addEventListener('openUserProfile', close);
    window.addEventListener(DRAWER_EVENTS.chatHistoryClose, close);
    return () => {
      window.removeEventListener('accountDrawerOpened', close);
      window.removeEventListener('openUserProfile', close);
      window.removeEventListener(DRAWER_EVENTS.chatHistoryClose, close);
    };
  }, []);

  return (
    <>
      <HeaderSection
        sx={{
          background: '#141414',
          py: 1,
          ...sx,
        }}
        layoutQuery={layoutQuery}
        slots={{
          ...slots,
          leftAreaStart: slots?.leftAreaStart,
          leftArea: (
            <>
              {slots?.leftAreaStart}

              {/* -- Capme Box -- */}
              <CapmeBox sx={{ display: { xs: 'none', lg: 'flex' } }}>
                <Box sx={{ py: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '15rem' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <CapmeTitle>{t('app_name')}</CapmeTitle>
                    <CapmeSubtitle style={{ color: getSubscriptionColor(currentUser), display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isSubscriptionActive(currentUser) && (
                        <Box
                          component="span"
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: '#22C55E',
                            flexShrink: 0,
                            boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                            animation: 'subtlePulse 2s ease-in-out infinite',
                            '@keyframes subtlePulse': {
                              '0%, 100%': { boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' },
                              '50%': { boxShadow: '0 0 0 4px rgba(34,197,94,0.1)' },
                            },
                          }}
                        />
                      )}
                      {getSubscriptionLabel(currentUser, t)}
                    </CapmeSubtitle>
                  </Box>
                  <CapmeTokens>
                    {isSubscriptionActive(currentUser) ? '∞' : (currentUser?.subscription?.tokens ?? 0)}
                  </CapmeTokens>
                </Box>
              </CapmeBox>

              {/* -- Menu button -- */}
              {menuButton && (
                <MenuButton
                  data-slot="menu-button"
                  onClick={onOpenNav}
                  sx={{
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
              )}

              {/* -- Logo -- */}
              <Logo data-slot="logo" />

              {/* -- Divider -- */}
              <StyledDivider data-slot="divider" />

              {/* -- Workspace popover -- */}
              {/* {workspaces && <WorkspacesPopover data-slot="workspaces" data={data?.workspaces} />} */}

              {/* {slots?.leftAreaEnd} */}
            </>
          ),
          rightArea: (
            <>
              {slots?.rightAreaStart}

              <Box
                data-area="right"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: { xs: 1, sm: 1.5 },
                  width: '100%',
                  maxWidth: 600,
                }}
              >
                {/* -- Searchbar (home page only) -- */}
                {searchbar && isHomePage && (
                  <Box ref={searchAnchorRef} sx={{ flex: 1, mr: 2 }}>
                    <CustomSearchBar
                      placeholder={t('header.search_placeholder')}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                      onFocus={() => setSearchOpen(true)}
                      inputRef={searchInputRef}
                    />
                  </Box>
                )}

                {/* -- Help link -- */}
                {/* {helpLink && (
                  <Link data-slot="help-link" href={paths.faqs} component={RouterLink} color="inherit" sx={{ typography: 'subtitle2' }}>
                    Need help?
                  </Link>
                )} */}

                {/* -- Language popover -- */}
                {localization && (
                  <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                    <LanguagePopover data-slot="localization" data={data?.langs} />
                  </Box>
                )}

                {/* -- Notifications popover -- */}
                {/* {notifications && (
                <NotificationsDrawer data-slot="notifications" data={data?.notifications} />
              )} */}

                {/* -- Contacts popover -- */}
                {/* {contacts && <ContactsPopover data-slot="contacts" data={data?.contacts} />} */}

                {/* -- Settings button -- */}
                {/* {settings && <SettingsButton data-slot="settings" />} */}

                {/* -- Chat Me actions (Prompts tab only) -- */}
                {showChatMeActions && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                      }}
                      aria-label={t('header.premium')}
                      onClick={() => navigate(paths.dashboard.settings.subscription)}
                    >
                      <Icon icon="solar:crown-bold" width={20} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(paths.dashboard.settings.knowledgeGraph)}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                      }}
                      aria-label={t('nav.graph')}
                    >
                      <Icon icon="ph:graph-fill" width={20} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setChatHistoryOpen((p) => !p)}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: chatHistoryOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                      }}
                      aria-label={t('header.chat_history')}
                    >
                      <Icon icon="mingcute:menu-line" width={20} />
                    </IconButton>
                  </Box>
                )}

                {/* -- Announcement button -- */}
                <IconButton
                  size="small"
                  onClick={() => setAnnouncementOpen(true)}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                  }}
                  aria-label={t('header.announcements')}
                >
                  <Icon icon="solar:danger-circle-bold" width={20} />
                </IconButton>

                {/* -- Garage room button -- */}
                <IconButton
                  size="small"
                  onClick={handleOpenGarage}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                  }}
                  aria-label={t('header.garage_room')}
                >
                  <Icon icon="solar:garage-bold" width={20} />
                </IconButton>

                {/* -- Account drawer -- */}
                {account && <AccountDrawer data-slot="account" data={data?.account} />}

                {/* -- Profile drawer --
              {account && <ProfileDrawer data-slot="account" data={data?.account} />}  */}

                {/* -- Sign in button -- */}
                {signIn && <SignInButton />}

                {/* -- Purchase button -- */}
                {purchase && (
                  <Button
                    data-slot="purchase"
                    variant="contained"
                    rel="noopener"
                    target="_blank"
                    href={paths.minimalStore}
                    sx={{
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    }}
                  >
                    {t('header.purchase')}
                  </Button>
                )}
              </Box>

              {slots?.rightAreaEnd}
            </>
          ),
        }}
        slotProps={slotProps}
        {...other}
      />

      <AnnouncementModal
        open={announcementOpen}
        onClose={() => setAnnouncementOpen(false)}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(''); }}
        anchorEl={searchAnchorRef.current}
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
    </>
  );
}
