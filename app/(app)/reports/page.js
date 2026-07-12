"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, ShieldAlert } from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/currentUser";
import {
  assets,
  categories,
  departments,
  allocations,
  bookings,
  maintenance,
  getEmployee,
  getAsset,
  categoryName,
} from "@/lib/mockData";
import { ASSET_STATUS, ASSET_STATUS_ORDER } from "@/lib/statuses";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/roles";

const TONE_HEX = {
  success: "#10b981",
  info: "#0ea5e9",
  warn: "#f59e0b",
  danger: "#ef4444",
  neutral: "#9ca3af",
};

export default function ReportsPage() {
  const { user } = useCurrentUser();

  if (!can(user.role, "viewReports")) {
    return (
      <div>
        <PageHeader eyebrow="Reports" title="Reports & Analytics" />
        <EmptyState
          icon={ShieldAlert}
          title="Not available for your role"
          description="Reports are available to Department Heads, Asset Managers, and Admins."
        />
      </div>
    );
  }

  // --- Assets by status ---
  const statusData = ASSET_STATUS_ORDER.map((s) => ({
    name: ASSET_STATUS[s].label,
    value: assets.filter((a) => a.status === s).length,
    fill: TONE_HEX[ASSET_STATUS[s].tone],
  })).filter((d) => d.value > 0);

  // --- Assets by category ---
  const categoryData = categories.map((c) => ({
    name: c.name,
    value: assets.filter((a) => a.categoryId === c.id).length,
  }));

  // --- Maintenance frequency by category ---
  const maintData = categories
    .map((c) => ({
      name: c.name,
      value: maintenance.filter((m) => getAsset(m.assetId)?.categoryId === c.id).length,
    }))
    .filter((d) => d.value > 0);

  // --- Department-wise active allocations ---
  const deptData = departments.map((d) => {
    const value = allocations.filter((al) => {
      if (al.status !== "ACTIVE") return false;
      const dept = al.holderType === "EMPLOYEE" ? getEmployee(al.holderId)?.departmentId : al.holderId;
      return dept === d.id;
    }).length;
    return { name: d.name, value };
  });

  // --- Utilization: most-used vs idle ---
  const usage = assets
    .map((a) => ({
      asset: a,
      count:
        allocations.filter((al) => al.assetId === a.id).length +
        bookings.filter((b) => b.assetId === a.id).length,
    }))
    .sort((x, y) => y.count - x.count);
  const mostUsed = usage.filter((u) => u.count > 0).slice(0, 5);
  const idle = usage.filter((u) => u.count === 0).slice(0, 5);

  // --- Attention: poor condition / under maintenance / oldest ---
  const attention = assets
    .filter((a) => a.condition === "Poor" || a.status === "UNDER_MAINTENANCE")
    .slice(0, 5);

  // --- Booking heatmap (weekday x hour) ---
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = [];
  for (let h = 8; h <= 18; h++) hours.push(h);
  const heat = {};
  bookings
    .filter((b) => b.status !== "CANCELLED")
    .forEach((b) => {
      const d = new Date(b.start);
      const wd = (d.getDay() + 6) % 7; // Mon=0
      for (let h = d.getHours(); h < new Date(b.end).getHours(); h++) {
        const key = `${wd}-${h}`;
        heat[key] = (heat[key] || 0) + 1;
      }
    });
  const maxHeat = Math.max(1, ...Object.values(heat));

  // --- CSV export ---
  function exportCsv() {
    const rows = [
      ["Tag", "Name", "Category", "Status", "Condition", "Location", "Cost"],
      ...assets.map((a) => [
        a.tag, a.name, categoryName(a.categoryId), a.status, a.condition, a.location, a.acquisitionCost,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "assetflow-assets.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Reports & Analytics"
        description="Operational insight across utilization, maintenance, allocation, and booking patterns."
        actions={
          <Button variant="filled" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Assets by status */}
        <Card hover={false}>
          <h3 className="mb-4 text-lg font-light text-foreground">Assets by Status</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-1.5 text-sm">
              {statusData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-black/60">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.fill }} />
                    {d.name}
                  </span>
                  <span className="font-mono text-black/50">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Assets by category */}
        <Card hover={false}>
          <h3 className="mb-4 text-lg font-light text-foreground">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="value" fill="#111111" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Maintenance frequency */}
        <Card hover={false}>
          <h3 className="mb-4 text-lg font-light text-foreground">Maintenance Frequency by Category</h3>
          {maintData.length === 0 ? (
            <p className="text-sm text-black/45">No maintenance recorded.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Department allocations */}
        <Card hover={false}>
          <h3 className="mb-4 text-lg font-light text-foreground">Active Allocations by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Booking heatmap */}
      <Card hover={false} className="mt-3">
        <h3 className="mb-4 text-lg font-light text-foreground">Resource Booking Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex">
              <div className="w-10" />
              {hours.map((h) => (
                <div key={h} className="w-8 text-center font-mono text-[10px] text-black/35">
                  {h}
                </div>
              ))}
            </div>
            {days.map((day, wd) => (
              <div key={day} className="flex items-center">
                <div className="w-10 pr-2 text-right text-xs text-black/45">{day}</div>
                {hours.map((h) => {
                  const v = heat[`${wd}-${h}`] || 0;
                  const intensity = v / maxHeat;
                  return (
                    <div key={h} className="p-0.5">
                      <div
                        title={`${day} ${h}:00 · ${v} booking(s)`}
                        className="h-6 w-7 rounded-[4px] border border-black/[0.04]"
                        style={{
                          background:
                            v === 0 ? "rgba(0,0,0,0.03)" : `rgba(17,17,17,${0.15 + intensity * 0.75})`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-black/40">Darker cells = more bookings in that hour window.</p>
      </Card>

      {/* Utilization + attention lists */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            <h3 className="text-lg font-light text-foreground">Most Used</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {mostUsed.map((u) => (
              <li key={u.asset.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-black/65">{u.asset.name}</span>
                <span className="font-mono text-xs text-black/45">{u.count}×</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card hover={false}>
          <h3 className="mb-3 text-lg font-light text-foreground">Idle Assets</h3>
          {idle.length === 0 ? (
            <p className="text-sm text-black/45">None — everything's in use.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {idle.map((u) => (
                <li key={u.asset.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-black/65">{u.asset.name}</span>
                  <span className="font-mono text-xs text-black/35">0×</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card hover={false}>
          <h3 className="mb-3 text-lg font-light text-foreground">Needs Attention</h3>
          {attention.length === 0 ? (
            <p className="text-sm text-black/45">Nothing flagged.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {attention.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-black/65">{a.name}</span>
                  <StatusPill map={ASSET_STATUS} value={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
