export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'announcement' | 'approval' | 'team_invite' | 'mentor' | 'system';
  link?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'vertothon_in_app_notifications_v1';

export const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    title: 'Platform Ready: VERTOTHON 2026',
    message: 'Welcome to VERTOTHON 2026! Check-in desks are live at the venue.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    type: 'announcement',
    link: '/app/announcements',
  },
  {
    id: 'notif-2',
    title: 'Participant Badge Pass Available',
    message: 'Your official QR participant pass is ready for print/download in My Profile.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
    type: 'approval',
    link: '/app/profile',
  },
  {
    id: 'notif-3',
    title: 'Mentor Desks Active',
    message: 'Technical mentors in AI and Web3 are currently available in the Help Desk.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    type: 'mentor',
    link: '/app/mentoring',
  },
  {
    id: 'notif-4',
    title: 'Team Formation Open',
    message: 'Discover teams or recruit collaborators before the 12:00 PM hacking kickoff.',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    read: true,
    type: 'team_invite',
    link: '/app/teams',
  },
];

export function getStoredNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: InAppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch {
    // Ignore storage quota
  }
}

export function markNotificationAsRead(id: string): InAppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(updated);
  return updated;
}

export function markAllNotificationsAsRead(): InAppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(updated);
  return updated;
}
