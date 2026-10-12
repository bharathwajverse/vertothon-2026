import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  QrCode,
  FolderGit2,
  Award,
  Settings,
} from 'lucide-react';
import { NavigationItem } from '../../types';

export const NAVIGATION_ITEMS: (NavigationItem & { icon: React.ElementType })[] = [
  {
    id: 'dashboard',
    label: 'Control Room',
    href: '/',
    icon: LayoutDashboard,
    iconName: 'LayoutDashboard',
  },
  {
    id: 'participants',
    label: 'Participants',
    href: '/participants',
    icon: Users,
    iconName: 'Users',
    badge: '642',
  },
  {
    id: 'teams',
    label: 'Teams',
    href: '/teams',
    icon: UserCheck,
    iconName: 'UserCheck',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    iconName: 'Calendar',
  },
  {
    id: 'checkin',
    label: 'Check-in Desk',
    href: '/checkin',
    icon: QrCode,
    iconName: 'QrCode',
    badge: 'Live',
  },
  {
    id: 'projects',
    label: 'Submissions',
    href: '/projects',
    icon: FolderGit2,
    iconName: 'FolderGit2',
  },
  {
    id: 'judging',
    label: 'Judging & Scoring',
    href: '/judging',
    icon: Award,
    iconName: 'Award',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    iconName: 'Settings',
  },
];
