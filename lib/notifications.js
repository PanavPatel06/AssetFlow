"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "./apiClient";

// Single shared source of the current user's notifications, mounted once in
// AppShell. TopBar's unread badge and the Activity screen both read/mutate
// through this so they can never drift out of sync with each other.
const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications } = await apiFetch("/api/notifications");
      setNotifications(notifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  async function markOne(id, read = true) {
    const { notification } = await apiFetch(`/api/notifications/${id}`, {
      method: "PATCH",
      body: { read },
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? notification : n)));
  }

  async function markAllRead() {
    await apiFetch("/api/notifications/mark-all-read", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markOne, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside <NotificationsProvider>");
  }
  return ctx;
}
