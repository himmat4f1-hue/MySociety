// Central config describing every module/route in the app and which roles can access it.
// This mirrors the "Role-Based Access Summary" from the product design.
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  UserCheck,
  MessageSquareWarning,
  Wrench,
  Megaphone,
  Dumbbell,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  Video,
  ScrollText,
  TrendingUp,
  PiggyBank,
  CalendarDays,
  Vote,
} from 'lucide-react';

export const ALL_ROLES = ['admin', 'security', 'resident', 'accountant', 'secretary', 'chairman'];

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ALL_ROLES },
  { name: 'Residents', path: '/residents', icon: Users, roles: ['admin', 'security', 'secretary', 'chairman'] },
  { name: 'Units / Flats', path: '/units', icon: Building2, roles: ['admin', 'secretary', 'chairman'] },
  { name: 'Finance', path: '/finance', icon: Wallet, roles: ['admin', 'accountant', 'secretary', 'chairman'] },
  { name: 'Visitors', path: '/visitors', icon: UserCheck, roles: ['admin', 'security', 'secretary', 'chairman'] },
  { name: 'Complaints', path: '/complaints', icon: MessageSquareWarning, roles: ALL_ROLES },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ALL_ROLES },
  { name: 'Notice Board', path: '/notices', icon: Megaphone, roles: ALL_ROLES },
  { name: 'Amenities', path: '/amenities', icon: Dumbbell, roles: ALL_ROLES },
  { name: 'Documents', path: '/documents', icon: FileText, roles: ['admin', 'secretary', 'chairman', 'accountant'] },
  { name: 'Meetings', path: '/meetings', icon: CalendarDays, roles: ALL_ROLES },
  { name: 'Voting / Polls', path: '/voting', icon: Vote, roles: ALL_ROLES },
  { name: 'Emergency (SOS)', path: '/emergency', icon: ShieldAlert, roles: ALL_ROLES },
  { name: 'Camera Requests', path: '/camera-requests', icon: Video, roles: ['admin', 'security', 'secretary', 'chairman', 'resident'] },
  { name: 'Society Policies', path: '/policies', icon: ScrollText, roles: ALL_ROLES },
  { name: 'Investments & Assets', path: '/investments', icon: TrendingUp, roles: ['admin', 'accountant', 'secretary', 'chairman'] },
  { name: 'Funds', path: '/funds', icon: PiggyBank, roles: ALL_ROLES },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'accountant', 'secretary', 'chairman'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
];
