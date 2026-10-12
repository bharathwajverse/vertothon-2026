import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, X, Megaphone, Users, UserCheck, LifeBuoy, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  InAppNotification,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationService';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = () => {
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-indigo-600" />;
      case 'approval':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'team_invite':
        return <Users className="w-4 h-4 text-amber-600" />;
      case 'mentor':
        return <LifeBuoy className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          loadNotifications();
        }}
        aria-label="View system notifications"
        aria-expanded={isOpen}
        data-testid="notification-bell-btn"
        className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 relative transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge-unread"
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white animate-pulse"
          />
        )}
      </button>

      {/* Notification Popover Tray */}
      {isOpen && (
        <div
          data-testid="notification-tray"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-xs">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                  data-testid="mark-all-read-btn"
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    notif.read ? 'bg-white' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                  }`}
                  data-testid={`notification-item-${notif.id}`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notif.id)}
                          title="Mark as read"
                          className="text-slate-400 hover:text-brand-600 shrink-0"
                          data-testid={`mark-read-btn-${notif.id}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => {
                            handleMarkRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
