import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, BrainCircuit, Briefcase, Info, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }

    if (linkUrl) {
      setIsOpen(false);
      navigate(linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC':
        return <BookOpen className="w-4 h-4 text-[#134e2f]" />;
      case 'QUIZ':
        return <BrainCircuit className="w-4 h-4 text-[#006d3d]" />;
      case 'CAREER':
        return <Briefcase className="w-4 h-4 text-[#92400e]" />;
      default:
        return <Info className="w-4 h-4 text-[#134e2f]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-[#f7faf7] hover:bg-[#ecefec] border border-[#c0c9bf] text-[#181c1b] transition group focus:outline-none shadow-sm"
        title="Notifications"
      >
        <Bell className="w-4 h-4 group-hover:scale-105 transition-transform text-[#404942]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[9px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-[#e2e8e2] shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-[#ecefec] flex items-center justify-between bg-[#f7faf7]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#134e2f]" />
              <h3 className="text-sm font-bold text-[#181c1b]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] border border-[#a0d2af] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#006d3d] hover:underline transition flex items-center gap-1 font-semibold"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#ecefec]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#717971] text-xs">
                No notifications right now. You're all caught up!
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.linkUrl)}
                  className={`p-4 transition cursor-pointer flex gap-3 items-start hover:bg-[#f7faf7] ${
                    !item.isRead ? 'bg-[#e8f5e9]/30' : 'opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#ecefec] border border-[#c0c9bf]/40 shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#181c1b] leading-tight">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#006d3d] shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#404942] leading-normal line-clamp-2">
                      {item.message}
                    </p>
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
