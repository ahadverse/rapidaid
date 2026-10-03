export const publicNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const;

export const roleHome = {
  PATIENT: '/dashboard',
  DRIVER: '/driver',
  ADMIN: '/admin',
} as const;
