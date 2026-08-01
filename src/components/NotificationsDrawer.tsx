import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Filter,
  Trash2,
  Check
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll
}) => {
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter(
    (n) => channelFilter === 'ALL' || n.channel === channelFilter
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
      <div className="bg-[#141414] border-l border-[#2A2A2A] w-full max-w-md h-full flex flex-col p-6 text-[#E0E0E0] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00FF41]/10 text-[#00FF41] rounded-xl border border-[#00FF41]/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                DevOps Alerts & Notifications
              </h3>
              <p className="font-body text-xs text-[#A1A1AA]">
                Step 11: Real-time carbon-aware alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded-full hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Filter & Actions */}
        <div className="py-3 border-b border-[#2A2A2A] flex justify-between items-center text-xs">
          <div className="flex gap-1.5 overflow-x-auto">
            {['ALL', 'Dashboard', 'Slack', 'Email', 'MS Teams'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded-lg font-code text-[11px] font-semibold transition-all ${
                  channelFilter === ch
                    ? 'bg-[#00FF41] text-black font-bold'
                    : 'bg-[#1A1A1A] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-grow overflow-y-auto py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#71717A]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No notifications for this filter</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-[#141414] border-[#2A2A2A]'
                    : 'bg-[#1A1A1A] border-[#00FF41]/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {item.type === 'DEPLOYED' && (
                      <CheckCircle className="w-4 h-4 text-[#00FF41]" />
                    )}
                    {item.type === 'QUEUED' && (
                      <Clock className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    {item.type === 'OPTIMAL' && (
                      <Zap className="w-4 h-4 text-[#3B82F6]" />
                    )}
                    {item.type === 'FAILURE' && (
                      <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                    )}
                    <span className="font-headline font-bold text-xs text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-code text-[10px] text-[#A1A1AA]">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-2">
                  {item.message}
                </p>

                <div className="flex justify-between items-center text-[10px] font-code">
                  <span className="px-2 py-0.5 rounded bg-[#2A2A2A] text-[#E0E0E0]">
                    Channel: {item.channel}
                  </span>
                  {!item.read && (
                    <span className="text-[#00FF41] font-bold">● New</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#2A2A2A] flex justify-between items-center">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-[#00FF41] hover:underline flex items-center gap-1 font-semibold"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-[#EF4444] hover:underline flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
