// Central config describing every module/route in the app and which roles can access it.
// This mirrors the "Role-Based Access Summary" from the product design + the detailed
// per-role UI/UX specs (Member, Chairman, Secretary, Accountant, Treasurer, Security Staff,
// Committee Member, Tenant, Housekeeping Staff).
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
  Settings,
  ShieldAlert,
  Video,
  PiggyBank,
  CalendarDays,
  Vote,
  Receipt,
  Clock4,
  ClipboardList,
  Boxes,
  FileSignature,
  PawPrint,
  Users2,
  Car,
  HomeIcon,
  ClipboardCheck,
  UserCheck2,
  ListChecks,
  Tag,
  Gavel,
  History,
  Boxes as BoxesIcon,
  ShieldCheck,
  Star,
  LifeBuoy,
  Scale,
  Droplets,
} from 'lucide-react';

export const ALL_ROLES = [
  'security',
  'resident',
  'accountant',
  'secretary',
  'chairman',
  'treasurer',
  'committee_member',
  'tenant',
  'housekeeping',
];

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ALL_ROLES },

  // Owner/tenant self-service
  { name: 'My Dues', path: '/app/my-dues', icon: Receipt, roles: ['resident', 'tenant'] },
  { name: 'List Property for Sale', path: '/app/list-property', icon: Tag, roles: ['resident', 'tenant'] },
  { name: 'Pets', path: '/app/pets', icon: PawPrint, roles: ALL_ROLES.filter((r) => !['housekeeping', 'accountant', 'treasurer'].includes(r)) },

  { name: 'Family & Personal Data', path: '/app/family-data', icon: Users2, roles: ['secretary', 'chairman', 'resident', 'tenant'] },
  { name: 'Vehicles & Parking', path: '/app/vehicles', icon: Car, roles: ALL_ROLES },
  { name: 'Home Services', path: '/app/home-services', icon: HomeIcon, roles: ['secretary', 'chairman', 'resident', 'tenant'] },
  { name: 'Role Checklist', path: '/app/role-checklist', icon: ClipboardCheck, roles: ALL_ROLES },
  { name: 'Rules, Policies & Documents', path: '/app/rules', icon: Gavel, roles: ALL_ROLES },
  { name: 'Service Providers', path: '/app/service-providers', icon: Wrench, roles: ALL_ROLES },
  { name: 'Inventory', path: '/app/inventory', icon: BoxesIcon, roles: ['secretary', 'chairman', 'treasurer', 'committee_member'] },
  { name: 'Insurance', path: '/app/insurance', icon: ShieldCheck, roles: ['secretary', 'chairman', 'treasurer', 'committee_member'] },
  { name: 'Feedback & Ratings', path: '/app/feedback', icon: Star, roles: ALL_ROLES },
  { name: 'Support Tickets', path: '/app/support-tickets', icon: LifeBuoy, roles: ALL_ROLES },
  { name: 'Legal Compliance', path: '/app/legal-compliance', icon: Scale, roles: ['secretary', 'chairman', 'treasurer', 'committee_member'] },
  { name: 'Audit Log', path: '/app/audit-log', icon: History, roles: ['secretary', 'chairman'] },
  { name: 'Utility Usage', path: '/app/utility-readings', icon: Droplets, roles: ['secretary', 'chairman', 'treasurer', 'committee_member'] },
  // Meeting Attendance & Agenda Items consolidated into the Meetings page
  // itself (per-meeting cards + detail view) - no separate menus.

  { name: 'Residents', path: '/app/residents', icon: Users, roles: ['security', 'secretary', 'chairman', 'treasurer', 'committee_member'] },
  { name: 'Staff Shifts', path: '/app/shifts', icon: Clock4, roles: ['security', 'secretary', 'chairman', 'housekeeping'] },
  { name: 'Daily Tasks', path: '/app/tasks', icon: ClipboardList, roles: ['secretary', 'chairman', 'housekeeping'] },
  { name: 'Supplies', path: '/app/supplies', icon: Boxes, roles: ['secretary', 'chairman', 'housekeeping'] },
  { name: 'Lease Management', path: '/app/leases', icon: FileSignature, roles: ['secretary', 'chairman', 'committee_member', 'tenant'] },
  { name: 'Units / Flats', path: '/app/units', icon: Building2, roles: ['secretary', 'chairman'] },
  { name: 'Finance', path: '/app/finance', icon: Wallet, roles: ['accountant', 'secretary', 'chairman', 'treasurer', 'committee_member'] },
  { name: 'Visitors & Gate Passes', path: '/app/visitors', icon: UserCheck, roles: ['security', 'secretary', 'chairman', 'resident', 'tenant'] },
  { name: 'Complaints', path: '/app/complaints', icon: MessageSquareWarning, roles: ALL_ROLES },
  { name: 'Maintenance', path: '/app/maintenance', icon: Wrench, roles: ALL_ROLES },
  { name: 'Notice Board', path: '/app/notices', icon: Megaphone, roles: ALL_ROLES },
  { name: 'Amenities', path: '/app/amenities', icon: Dumbbell, roles: ALL_ROLES },
  { name: 'Meetings', path: '/app/meetings', icon: CalendarDays, roles: ALL_ROLES.filter((r) => r !== 'housekeeping') },
  { name: 'Voting & Elections', path: '/app/voting', icon: Vote, roles: ALL_ROLES.filter((r) => r !== 'housekeeping' && r !== 'security') },
  // Emergency (SOS) intentionally has NO sidebar entry - it's accessed via
  // the Emergency button next to the notification bell in the Topbar
  // instead (see components/Topbar.jsx), since it needs to be reachable
  // from anywhere, not buried in the menu.
  // Camera Requests merged into Complaints & Requests (use category="Camera"
  // there instead) - no separate menu.
  { name: 'Funds', path: '/app/funds', icon: PiggyBank, roles: ALL_ROLES.filter((r) => r !== 'housekeeping') },
  { name: 'Society Structure', path: '/app/society-structure', icon: Building2, roles: ['chairman', 'secretary'] },
  { name: 'Settings', path: '/app/settings', icon: Settings, roles: ['secretary', 'chairman'] },
];
