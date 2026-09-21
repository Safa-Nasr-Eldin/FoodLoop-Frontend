// Placeholder information architecture. Paths are the intended future routes;
// no router is installed in R1, so nav items only update local active state.

export type NavItem = { label: string; href: string }
export type NavGroup = { title: string; items: NavItem[] }

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Impact', href: '/impact' },
  { label: 'Organisations', href: '/organisations' },
]

export const FOOTER_NAV: NavGroup[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Browse surplus', href: '/marketplace' },
      { label: 'Donate food', href: '/donate' },
      { label: 'Deliver with us', href: '/couriers' },
      { label: 'For organisations', href: '/organisations' },
    ],
  },
  {
    title: 'FoodLoop',
    items: [
      { label: 'Our mission', href: '/mission' },
      { label: 'Impact report', href: '/impact' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export const LEGAL_NAV: NavItem[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
]
