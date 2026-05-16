import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

// const icon = (name) => (
//   <Iconify icon={name} />
// );

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard-2'),
  parameter: icon('ic-parameter'),

  terms: icon('ic-file'),
  privacy: icon('ic-lock'),
  faqs: icon('ic-faqs'),
  about: icon('ic-tour'),
  contact: icon('ic-contact'),
  support: icon('ic-chat'),
  helpCenter: icon('ic-help-center'),
};

// ----------------------------------------------------------------------

export const getNavDataAdmin = (t) => [
  {
    subheader: t('nav.admin_overview'),
    items: [
      { title: t('nav.admin_dashboard'), path: paths.adminDashboard.root, icon: ICONS.dashboard },

      { title: t('nav.admin_faqs'), path: paths.adminDashboard.content.faqs, icon: ICONS.faqs },
      { title: t('nav.admin_support'), path: paths.adminDashboard.content.support, icon: ICONS.support },
      { title: t('nav.admin_help_center'), path: paths.adminDashboard.content.helpCenter, icon: ICONS.helpCenter },

      { title: t('nav.admin_about_us'), path: paths.adminDashboard.content.about, icon: ICONS.about },
      // { title: 'Contact Us', path: paths.adminDashboard.content.contact, icon: ICONS.contact },

      { title: t('nav.admin_privacy_policy'), path: paths.adminDashboard.content.privacy, icon: ICONS.privacy },
      { title: t('nav.admin_terms_of_service'), path: paths.adminDashboard.content.terms, icon: ICONS.terms },

      // { title: 'Chat', path: paths.adminDashboard.chat, icon: ICONS.chat },

      // { title: 'Ecommerce', path: paths.adminDashboard.general.ecommerce, icon: ICONS.ecommerce },
      // { title: 'Analytics', path: paths.adminDashboard.general.analytics, icon: ICONS.analytics },
      // { title: 'Banking', path: paths.adminDashboard.general.banking, icon: ICONS.banking },
      // { title: 'Booking', path: paths.adminDashboard.general.booking, icon: ICONS.booking },
      // { title: 'File', path: paths.adminDashboard.general.file, icon: ICONS.file },
      // { title: 'Course', path: paths.adminDashboard.general.course, icon: ICONS.course },
    ],
  },
];
