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

export const dashboardNav: Record<Role, DashboardNavItem[]> = {
  PATIENT: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/request', label: 'New request', icon: Siren },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ],
  DRIVER: [
    { href: '/driver', label: 'My trips', icon: Route },
    { href: '/driver/earnings', label: 'Earnings', icon: Wallet },
    { href: '/driver/profile', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/dispatch', label: 'Dispatch', icon: ListOrdered },
    { href: '/admin/trips', label: 'Trips', icon: Route },
    { href: '/admin/ambulances', label: 'Ambulances', icon: Ambulance },
    { href: '/admin/drivers', label: 'Drivers', icon: UserCog },
    { href: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/audit-logs', label: 'Audit logs', icon: ScrollText },
  ],
};

export const roleLabel: Record<Role, string> = {
  PATIENT: 'Patient',
  DRIVER: 'Driver',
  ADMIN: 'Admin',
};
