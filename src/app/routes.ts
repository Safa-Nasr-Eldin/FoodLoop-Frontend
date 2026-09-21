// Information architecture (R2 public site + R3 workspace). `section` targets an id on the Home page (see SectionLink).

export const PATHS = {
  home: '/',
  login: '/login',
  register: '/register',
  styleSystem: '/dev/style-system',
  marketplace: '/marketplace',
  donations: '/donations',
  newDonation: '/donations/new',
  donation: '/donations/:id',
  editDonation: '/donations/:id/edit',
  organization: '/organization',
} as const

export const donationPath = (id: string) => `/donations/${id}`
export const editDonationPath = (id: string) => `/donations/${id}/edit`

export const EXPLORE_FOOD_PATH = PATHS.marketplace

/** Signed-in product navigation (no auth guard yet — pages are open during frontend development). */
export const WORKSPACE_NAV: NavItem[] = [
  { label: 'Marketplace', to: PATHS.marketplace },
  { label: 'My donations', to: PATHS.donations },
  { label: 'My organization', to: PATHS.organization },
]

export const SECTIONS = {
  howItWorks: 'how-it-works',
  roles: 'roles',
  platform: 'platform',
} as const

export type NavItem = { label: string; to: string; section?: string }
export type NavGroup = { title: string; items: NavItem[] }

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: PATHS.home },
  { label: 'How it works', to: PATHS.home, section: SECTIONS.howItWorks },
  { label: 'Login', to: PATHS.login },
  { label: 'Register', to: PATHS.register },
]

export const FOOTER_NAV: NavGroup[] = [
  {
    title: 'Platform',
    items: [
      { label: 'How it works', to: PATHS.home, section: SECTIONS.howItWorks },
      { label: 'Roles', to: PATHS.home, section: SECTIONS.roles },
      { label: 'Product', to: PATHS.home, section: SECTIONS.platform },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Log in', to: PATHS.login },
      { label: 'Join FoodLoop', to: PATHS.register },
    ],
  },
]

export const LEGAL_NAV: NavItem[] = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Accessibility', to: '/accessibility' },
]

export const PAGE_TITLES: Record<string, string> = {
  [PATHS.home]: 'FoodLoop — Good food. Greater impact.',
  [PATHS.login]: 'Log in — FoodLoop',
  [PATHS.register]: 'Join FoodLoop',
  [PATHS.styleSystem]: 'Style system (dev) — FoodLoop',
}

/** Routes rendered without the site footer (full-height split layouts). */
export const BARE_PATHS: string[] = [PATHS.login, PATHS.register]
