'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Flame,
  X,
  Layers,
  UserPlus,
  FileText,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';
import { useOptics, NotificationItem } from '../../context/OpticsContext';
import styles from './NotificationPopover.module.css';

export const NotificationPopover: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    unreadCount,
    handleMarkAllNotificationsRead,
    handleClearNotification,
    handleClearAllNotifications,
    handleNotificationClick,
  } = useOptics();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  if (!isNotificationOpen) return null;

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeTask}`}>
            <Layers className="w-3.5 h-3.5" />
          </div>
        );
      case 'status':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeStatus}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      case 'assign':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeAssign}`}>
            <Flame className="w-3.5 h-3.5" />
          </div>
        );
      case 'mention':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeMention}`}>
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        );
      case 'doc':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeDoc}`}>
            <FileText className="w-3.5 h-3.5" />
          </div>
        );
      case 'invite':
        return (
          <div className={`${styles.iconBadge} ${styles.badgeInvite}`}>
            <UserPlus className="w-3.5 h-3.5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className={`${styles.iconBadge} ${styles.badgeSystem}`}>
            <Bell className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div
      className={styles.popover}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Bell className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber, #b45309)' }} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className={styles.countBadge}>
              {unreadCount}
            </span>
          )}
        </div>

        <div className={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllNotificationsRead}
                  className={styles.textActionBtn}
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3 h-3 inline mr-1" />
                  Read all
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAllNotifications}
                className={styles.textActionBtn}
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Clear
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(false)}
            className={styles.closeBtn}
            aria-label="Close notifications"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & 15-Day Limit Tag */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`${styles.tabBtn} ${activeTab === 'unread' ? styles.tabBtnActive : ''}`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className={styles.timeLimitTag} title="Notifications are retained for up to 15 days">
          <Clock className="w-2.5 h-2.5 inline mr-1" />
          Max 15 days
        </div>
      </div>

      {/* Notifications List */}
      <div className={styles.list}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Bell className="w-5 h-5 opacity-40" />
            </div>
            <p className={styles.emptyTitle}>
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className={styles.emptyDesc}>
              {activeTab === 'unread'
                ? 'You are all caught up with your workspace activity.'
                : 'Workspace updates and team interactions from the last 15 days will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
              onClick={() => handleNotificationClick(n)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNotificationClick(n);
                }
              }}
            >
              {renderIcon(n.type)}

              <div className={styles.content}>
                <p className={styles.itemTitle}>{n.title}</p>
                <p className={styles.itemMessage}>{n.message}</p>
                <span className={styles.itemTime}>{n.time}</span>
              </div>

              <button
                type="button"
                className={styles.dismissBtn}
                title="Dismiss notification"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearNotification(n.id);
                }}
                aria-label="Dismiss notification"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
