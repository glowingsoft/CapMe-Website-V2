import { useMemo, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { allLangs, useTranslate } from 'src/locales';
import { _contacts, _notifications } from 'src/_mock';
import { varAlpha, stylesMode } from 'src/theme/styles';

import { bulletColor } from 'src/components/nav-section';
import { useSettingsContext } from 'src/components/settings';

import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from 'src/socket/socket';
import { updateSubscriptionTokens, updateSubscription } from 'src/store/slices/userSlice';
import { selectUnreadCount, markAllAsRead } from 'src/store/slices/notificationsSlice';
import { useLazyValidateSubscriptionQuery } from 'src/store/Reducer/payment-api';
import { paths } from 'src/routes/paths';

import { Main } from './main';
import GlobalDrawers from '../components/global-drawers';
import { NavMobile } from './nav-mobile';
import { layoutClasses } from '../classes';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../config-nav-account';
import { HeaderBase } from '../core/header-base';
import { _workspaces } from '../config-nav-workspace';
import { LayoutSection } from '../core/layout-section';
import { getNavData } from '../config-nav-dashboard';
import { getNavDataAdmin } from '../config-nav-admin-dashboard';

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, children, data }) {
  const theme = useTheme();

  const mobileNavOpen = useBoolean();

  const { user } = useSelector((state) => state.user);

  const settings = useSettingsContext();

  const navColorVars = useNavColorVars(theme, settings);

  const layoutQuery = 'lg';

  const { t } = useTranslate('common');

  const dispatch = useDispatch();
  const location = useLocation();
  const unreadCount = useSelector(selectUnreadCount);
  const userId = user?._id ?? user?.id;

  const [validateSubscription] = useLazyValidateSubscriptionQuery();

  useEffect(() => {
    if (!userId) return;
    validateSubscription().then((res) => {
      if (res?.data) dispatch(updateSubscription(res.data));
    });
  }, [userId, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userId) {
      connectSocket(userId);
    } else {
      disconnectSocket();
    }
  }, [userId]);

  useEffect(() => {
    if (location.pathname === paths.dashboard.notifications && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  }, [location.pathname, unreadCount, dispatch]);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    if (!socket) return;
    const onTokenUpdate = (data) => {
      console.log('[Socket] token_update received — raw payload:', data);
      const tokens = typeof data === 'number' ? data : (data?.tokens ?? data?.subscription?.tokens);
      console.log('[Socket] token_update — resolved tokens:', tokens);
      if (tokens !== undefined) dispatch(updateSubscriptionTokens(tokens));
    };
    socket.on('token_update', onTokenUpdate);
    return () => socket.off('token_update', onTokenUpdate);
  }, [userId, dispatch]);

  const navData = useMemo(() => {
    if (user?.permission === 1) {
      return getNavDataAdmin(t);
    }
    return data?.nav ?? getNavData(t, unreadCount);
  }, [user?.permission, data?.nav, t, unreadCount]);

  const isNavMini = settings.navLayout === 'mini';

  const isNavHorizontal = settings.navLayout === 'horizontal';

  const isNavVertical = isNavMini || settings.navLayout === 'vertical';

  return (
    <>
      <NavMobile data={navData} open={mobileNavOpen.value} onClose={mobileNavOpen.onFalse} cssVars={navColorVars.section} />

      <LayoutSection
        /** **************************************
         * Header
         *************************************** */
        headerSection={
          <HeaderBase
            layoutQuery={layoutQuery}
            disableElevation={isNavVertical}
            onOpenNav={mobileNavOpen.onTrue}
            data={{
              nav: navData,
              langs: allLangs,
              account: _account,
              contacts: _contacts,
              workspaces: _workspaces,
              notifications: _notifications,
            }}
            slotsDisplay={{
              signIn: false,
              purchase: false,
              helpLink: false,
            }}
            slots={{
              topArea: (
                <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                  This is an info Alert.
                </Alert>
              ),
              bottomArea: isNavHorizontal ? <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navColorVars.section} /> : null,
            }}
            slotProps={{
              toolbar: {
                sx: {
                  [`& [data-slot="logo"]`]: {
                    display: 'none',
                  },
                  [`& [data-area="right"]`]: {
                    gap: { xs: 0, sm: 0.75 },
                  },
                  ...(isNavHorizontal && {
                    bgcolor: 'var(--layout-nav-bg)',
                    [`& .${iconButtonClasses.root}`]: {
                      color: 'var(--layout-nav-text-secondary-color)',
                    },
                    [theme.breakpoints.up(layoutQuery)]: {
                      height: 'var(--layout-nav-horizontal-height)',
                    },
                    [`& [data-slot="workspaces"]`]: {
                      color: 'var(--layout-nav-text-primary-color)',
                    },
                    [`& [data-slot="logo"]`]: {
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    },
                    [`& [data-slot="divider"]`]: {
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'flex',
                      },
                    },
                  }),
                },
              },
              container: {
                maxWidth: false,
                sx: {
                  ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
                },
              },
            }}
          />
        }
        /** **************************************
         * Sidebar
         *************************************** */
        sidebarSection={
          isNavHorizontal ? null : (
            <NavVertical
              data={navData}
              isNavMini={isNavMini}
              sx={{
                background: '#141414',
              }}
              layoutQuery={layoutQuery}
              cssVars={navColorVars.section}
              onToggleNav={() => settings.onUpdateField('navLayout', settings.navLayout === 'vertical' ? 'mini' : 'vertical')}
            />
          )
        }
        /** **************************************
         * Footer
         *************************************** */
        footerSection={null}
        /** **************************************
         * Style
         *************************************** */
        cssVars={{
          ...navColorVars.layout,
          '--layout-transition-easing': 'linear',
          '--layout-transition-duration': '120ms',
          '--layout-nav-mini-width': '88px',
          '--layout-nav-vertical-width': '300px',
          '--layout-nav-horizontal-height': '64px',
          '--layout-dashboard-content-pt': theme.spacing(1),
          '--layout-dashboard-content-pb': theme.spacing(8),
          '--layout-dashboard-content-px': theme.spacing(5),
        }}
        sx={{
          [`& .${layoutClasses.hasSidebar}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
            },
          },
          ...sx,
        }}
      >
        <GlobalDrawers />
        <Main isNavHorizontal={isNavHorizontal}>{children}</Main>
      </LayoutSection>
    </>
  );
}

// ----------------------------------------------------------------------

function useNavColorVars(theme, settings) {
  const {
    vars: { palette },
  } = theme;

  return useMemo(() => {
    switch (settings.navColor) {
      case 'integrate':
        return {
          layout: {
            '--layout-nav-bg': palette.background.default,
            '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.8),
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.12),
            '--layout-nav-text-primary-color': palette.text.primary,
            '--layout-nav-text-secondary-color': palette.text.secondary,
            '--layout-nav-text-disabled-color': palette.text.disabled,
            [stylesMode.dark]: {
              '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.08),
              '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.96),
            },
          },
          section: {},
        };
      case 'apparent':
        return {
          layout: {
            '--layout-nav-bg': palette.grey[900],
            '--layout-nav-horizontal-bg': varAlpha(palette.grey['900Channel'], 0.96),
            '--layout-nav-border-color': 'transparent',
            '--layout-nav-text-primary-color': palette.common.white,
            '--layout-nav-text-secondary-color': palette.grey[500],
            '--layout-nav-text-disabled-color': palette.grey[600],
            [stylesMode.dark]: {
              '--layout-nav-bg': palette.grey[800],
              '--layout-nav-horizontal-bg': varAlpha(palette.grey['800Channel'], 0.8),
            },
          },
          section: {
            // caption
            '--nav-item-caption-color': palette.grey[600],
            // subheader
            '--nav-subheader-color': palette.grey[600],
            '--nav-subheader-hover-color': palette.common.white,
            // item
            '--nav-item-color': palette.grey[500],
            '--nav-item-root-active-color': palette.primary.light,
            '--nav-item-root-open-color': palette.common.white,
            // bullet
            '--nav-bullet-light-color': bulletColor.dark,
            // sub
            ...(settings.navLayout === 'vertical' && {
              '--nav-item-sub-active-color': palette.common.white,
              '--nav-item-sub-open-color': palette.common.white,
            }),
          },
        };
      default:
        throw new Error(`Invalid color: ${settings.navColor}`);
    }
  }, [
    palette.background.default,
    palette.background.defaultChannel,
    palette.common.white,
    palette.grey,
    palette.primary.light,
    palette.text.disabled,
    palette.text.primary,
    palette.text.secondary,
    settings.navColor,
    settings.navLayout,
  ]);
}
