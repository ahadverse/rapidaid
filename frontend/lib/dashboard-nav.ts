import {
  Ambulance,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListOrdered,
  Route,
  ScrollText,
  Siren,
  User,
  UserCog,
  Users,
  Wallet,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/api/types';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  label?: string;
  items: DashboardNavItem[];
};

export const dashboardNav: Record<Role, DashboardNavGroup[]> = {
  PATIENT: [
    {
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/request', label: 'New request', icon: Siren },
        { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
      ],
    },
  ],
  DRIVER: [
    {
      items: [
        { href: '/driver', label: 'My trips', icon: Route },
        { href: '/driver/earnings', label: 'Earnings', icon: Wallet },
        { href: '/driver/profile', label: 'Profile', icon: User },
      ],
    },
  ],
  ADMIN: [
    { items: [{ href: '/admin', label: 'Overview', icon: LayoutDashboard }] },
    {
      label: 'Operations',
      items: [
        { href: '/admin/dispatch', label: 'Dispatch', icon: ListOrdered },
        { href: '/admin/trips', label: 'Trips', icon: Route },
      ],
    },
    {
      label: 'Fleet and people',
      items: [
        { href: '/admin/ambulances', label: 'Ambulances', icon: Ambulance },
        { href: '/admin/drivers', label: 'Drivers', icon: UserCog },
        { href: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
        { href: '/admin/users', label: 'Users', icon: Users },
      ],
    },
    {
      label: 'Insights',
      items: [
        { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { href: '/admin/audit-logs', label: 'Audit logs', icon: ScrollText },
      ],
    },
  ],
};

export const roleLabel: Record<Role, string> = {
  PATIENT: 'Patient',
  DRIVER: 'Driver',
  ADMIN: 'Admin',
};
