"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  AlertTriangle,
  Wrench,
  CalendarClock,
  ClipboardCheck,
  Boxes,
  Bell,
  CheckCheck,
} from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/currentUser";
import { notifications as seedNotifications, activityLog, employeeName } from "@/lib/mockData";
import { formatDateTime, timeAgo } from "@/lib/format";

const TABS = [
  { id: "notifications", label: "Notifications" },
  { id: "log", label: "Activity Log" },
];

// Map notification type -> icon + accent tone.
const TYPE_META = {
  TRANSFER: { icon: ArrowLeftRight, tone: "text-sky-600" },
  OVERDUE: { icon: AlertTriangle, tone: "text-red-600" },
  MAINTENANCE: { icon: Wrench, tone: "text-amber-600" },
  BOOKING: { icon: CalendarClock, tone: "text-sky-600" },
  AUDIT: { icon: ClipboardCheck, tone: "text-amber-600" },
  ASSET: { icon: Boxes, tone: "text-emerald-600" },
};

export default function ActivityPage() {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState("notifications");
  const [notifications, setNotifications] = useState(seedNotifications);

  const mine = notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unread = mine.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((list) =>
      list.map((n) => (n.userId === user.id ? { ...n, read: true } : n))
    );
  }
  function toggleRead(id) {
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }

  const log = [...activityLog].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div>
      <PageHeader
        eyebrow="Activity"
        title="Activity & Alerts"
        description="Stay informed without digging — your notifications, plus a full audit log of who did what and when."
        actions={
          tab === "notifications" && unread > 0 ? (
            <Button onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Mark all read
            </Button>
          ) : null
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === "notifications" &&
        (mine.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="No notifications for this account." />
        ) : (
          <div className="space-y-2">
            {mine.map((n) => {
              const m = TYPE_META[n.type] || { icon: Bell, tone: "text-black/45" };
              const Icon = m.icon;
              return (
                <Card
                  key={n.id}
                  hover={false}
                  className={cn(
                    "flex items-start gap-3 py-4",
                    !n.read && "border-black/15 bg-card"
                  )}
                >
                  <div className={cn("mt-0.5 shrink-0", m.tone)}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", n.read ? "text-black/55" : "text-foreground")}>
                      {n.message}
                    </p>
                    <span className="text-xs text-black/40">{timeAgo(n.createdAt)}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <button
                      onClick={() => toggleRead(n.id)}
                      className="text-xs text-black/40 transition-colors hover:text-foreground"
                    >
                      {n.read ? "Mark unread" : "Mark read"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

      {tab === "log" && (
        <Table>
          <THead>
            <Tr>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Module</Th>
              <Th>When</Th>
            </Tr>
          </THead>
          <TBody>
            {log.map((l) => (
              <Tr key={l.id} className="hover:bg-black/[0.02]">
                <Td className="text-foreground">{employeeName(l.actorId)}</Td>
                <Td className="text-black/60">{l.action}</Td>
                <Td>
                  <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] uppercase tracking-widest text-black/50">
                    {l.entity}
                  </span>
                </Td>
                <Td className="font-mono text-xs text-black/45">{formatDateTime(l.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
