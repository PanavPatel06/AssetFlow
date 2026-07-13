"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  PackageOpen,
  Wrench,
  CalendarClock,
  ArrowLeftRight,
  Undo2,
  Plus,
  AlertTriangle,
} from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusPill from "@/components/ui/StatusPill";
import { useCurrentUser } from "@/lib/currentUser";
import { apiFetch } from "@/lib/apiClient";
import { formatDate, relativeDays, timeAgo, NOW } from "@/lib/format";

function holderName(holderUser, holderDepartment) {
  return holderUser?.name || holderDepartment?.name || "—";
}

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch("/api/dashboard").then(setData);
  }, []);

  if (!user || !data) return null;

  const firstName = user.name.split(" ")[0];
  const hour = NOW.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { kpis, overdue, upcoming, recentActivity } = data;

  const kpiCards = [
    { label: "Assets Available", value: kpis.assetsAvailable, icon: PackageCheck, href: "/assets?status=AVAILABLE" },
    { label: "Assets Allocated", value: kpis.assetsAllocated, icon: PackageOpen, href: "/assets?status=ALLOCATED" },
    { label: "Maintenance Active", value: kpis.maintenanceActive, icon: Wrench, href: "/maintenance" },
    { label: "Active Bookings", value: kpis.activeBookings, icon: CalendarClock, href: "/bookings" },
    { label: "Pending Transfers", value: kpis.pendingTransfers, icon: ArrowLeftRight, href: "/allocations", note: kpis.pendingTransfers ? "needs review" : null, tone: kpis.pendingTransfers ? "warn" : null },
    { label: "Upcoming Returns", value: kpis.upcomingReturns, icon: Undo2, href: "/allocations" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`${greeting}, ${firstName}`}
        description="Your real-time operational snapshot across assets, bookings, maintenance, and returns."
        actions={
          <>
            <Button href="/assets/new" variant="filled">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Register Asset
            </Button>
            <Button href="/bookings">Book Resource</Button>
            <Button href="/maintenance">Raise Request</Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpiCards.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Overdue + Upcoming returns */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card hover={false} className="border-red-600/15 bg-red-500/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" strokeWidth={1.5} />
              <h3 className="text-lg font-light text-foreground">Overdue Returns</h3>
            </div>
            <StatusPill label={`${overdue.length} overdue`} tone="danger" />
          </div>
          {overdue.length === 0 ? (
            <p className="text-sm text-black/45">Nothing overdue. Nice.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {overdue.map((al) => (
                <li key={al.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/assets/${al.asset.id}`} className="block truncate text-sm text-foreground hover:underline">
                      {al.asset.name}
                    </Link>
                    <span className="text-xs text-black/45">
                      {holderName(al.holderUser, al.holderDepartment)} · {al.asset.tag}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-red-700">
                    due {relativeDays(al.expectedReturn)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card hover={false}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-light text-foreground">Upcoming Returns</h3>
            <StatusPill label={`${upcoming.length} upcoming`} tone="info" />
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-black/45">No upcoming returns scheduled.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {upcoming.map((al) => (
                <li key={al.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/assets/${al.asset.id}`} className="block truncate text-sm text-foreground hover:underline">
                      {al.asset.name}
                    </Link>
                    <span className="text-xs text-black/45">
                      {holderName(al.holderUser, al.holderDepartment)} · {al.asset.tag}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-black/45">
                    {formatDate(al.expectedReturn)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Live activity feed */}
      <Card hover={false} className="mt-3">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-live" />
          <h3 className="text-lg font-light text-foreground">Recent Activity</h3>
          <Link href="/activity" className="ml-auto text-xs text-black/45 hover:text-foreground">
            View all →
          </Link>
        </div>
        <ul className="space-y-3">
          {recentActivity.map((log) => (
            <li key={log.id} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/20" />
              <div className="min-w-0 flex-1">
                <span className="text-foreground">{log.actor?.name}</span>{" "}
                <span className="text-black/55">{log.action}</span>
              </div>
              <span className="shrink-0 font-mono text-xs text-black/35">
                {timeAgo(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
