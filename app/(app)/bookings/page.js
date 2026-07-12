"use client";

import { useState } from "react";
import { Plus, CalendarClock, Ban, Info } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/currentUser";
import {
  bookableAssets,
  bookings as seedBookings,
  employeeName,
} from "@/lib/mockData";
import { BOOKING_STATUS } from "@/lib/statuses";
import { formatTime } from "@/lib/format";

const DAY_START = 8; // 08:00
const DAY_END = 20; // 20:00
const TOTAL_MIN = (DAY_END - DAY_START) * 60;
const DEFAULT_DATE = "2026-07-13";

const minsInDay = (iso) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};
const dateOf = (iso) => iso.slice(0, 10);

export default function BookingsPage() {
  const { user } = useCurrentUser();
  const resources = bookableAssets();

  const [assetId, setAssetId] = useState(resources[0].id);
  const [date, setDate] = useState(DEFAULT_DATE);
  const [bookings, setBookings] = useState(seedBookings);
  const [open, setOpen] = useState(false);

  const resource = resources.find((r) => r.id === assetId);

  // Bookings for the selected resource + date (ignoring cancelled for the grid).
  const dayBookings = bookings.filter(
    (b) => b.assetId === assetId && dateOf(b.start) === date && b.status !== "CANCELLED"
  );

  // All bookings for this resource (for the list below), newest first.
  const resourceBookings = bookings
    .filter((b) => b.assetId === assetId)
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  function cancelBooking(id) {
    setBookings((list) =>
      list.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bookings"
        title="Resource Booking"
        description="Book shared resources by time slot. Overlapping bookings for the same resource are rejected automatically."
        actions={
          <Button variant="filled" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> New Booking
          </Button>
        }
      />

      {/* Resource + date pickers */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="sm:w-72">
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name} · {r.tag}</option>
          ))}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Day calendar */}
        <Card hover={false} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-light text-foreground">{resource.name}</h3>
            <span className="text-xs text-black/45">
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </span>
          </div>

          <DayTimeline bookings={dayBookings} />
        </Card>

        {/* Booking list */}
        <div>
          <h3 className="mb-2 text-lg font-light text-foreground">All Bookings</h3>
          {resourceBookings.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No bookings yet" />
          ) : (
            <div className="space-y-2">
              {resourceBookings.map((b) => (
                <Card key={b.id} hover={false} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm text-foreground">{b.purpose}</div>
                      <div className="font-mono text-xs text-black/50">
                        {dateOf(b.start)} · {formatTime(b.start)}–{formatTime(b.end)}
                      </div>
                      <div className="mt-0.5 text-xs text-black/45">{employeeName(b.bookedById)}</div>
                    </div>
                    <StatusPill map={BOOKING_STATUS} value={b.status} dot={b.status === "ONGOING"} pulse={b.status === "ONGOING"} />
                  </div>
                  {["UPCOMING", "ONGOING"].includes(b.status) && (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="danger" onClick={() => cancelBooking(b.id)}>
                        <Ban className="h-3.5 w-3.5" strokeWidth={1.5} /> Cancel
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewBookingModal
        open={open}
        onClose={() => setOpen(false)}
        resource={resource}
        date={date}
        bookings={bookings}
        setBookings={setBookings}
        currentUserId={user.id}
      />
    </div>
  );
}

/* ------------------------------- Day timeline ------------------------------ */
function DayTimeline({ bookings }) {
  const hours = [];
  for (let h = DAY_START; h <= DAY_END; h++) hours.push(h);

  return (
    <div className="relative flex" style={{ height: 520 }}>
      {/* Hour labels */}
      <div className="w-14 shrink-0">
        {hours.map((h) => (
          <div key={h} className="relative" style={{ height: 520 / (DAY_END - DAY_START) }}>
            <span className="absolute -top-1.5 right-2 font-mono text-[10px] text-black/35">
              {String(h).padStart(2, "0")}:00
            </span>
          </div>
        ))}
      </div>

      {/* Grid + blocks */}
      <div className="relative flex-1 border-l border-black/[0.06]">
        {hours.map((h, i) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-black/[0.05]"
            style={{ top: (i * 520) / (DAY_END - DAY_START) }}
          />
        ))}

        {bookings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-black/35">
            No bookings on this day
          </div>
        )}

        {bookings.map((b) => {
          const start = Math.max(minsInDay(b.start), DAY_START * 60);
          const end = Math.min(minsInDay(b.end), DAY_END * 60);
          const top = ((start - DAY_START * 60) / TOTAL_MIN) * 520;
          const height = Math.max(((end - start) / TOTAL_MIN) * 520, 22);
          return (
            <div
              key={b.id}
              className="absolute left-1.5 right-1.5 overflow-hidden rounded-[10px] border border-black/[0.08] bg-white px-3 py-1.5"
              style={{ top, height }}
            >
              <div className="truncate text-xs text-foreground">{b.purpose}</div>
              <div className="font-mono text-[10px] text-black/45">
                {formatTime(b.start)}–{formatTime(b.end)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- New booking modal --------------------------- */
function NewBookingModal({ open, onClose, resource, date, bookings, setBookings, currentUserId }) {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState(null);

  function submit(e) {
    e.preventDefault();
    setError(null);

    const newStart = new Date(`${date}T${start}:00`);
    const newEnd = new Date(`${date}T${end}:00`);

    if (newEnd <= newStart) {
      setError("End time must be after the start time.");
      return;
    }

    // Overlap validation against existing (non-cancelled) bookings on this
    // resource + date. Adjacent slots (end == start) are allowed.
    const clash = bookings.find((b) => {
      if (b.assetId !== resource.id || b.status === "CANCELLED") return false;
      if (dateOf(b.start) !== date) return false;
      const bStart = new Date(b.start);
      const bEnd = new Date(b.end);
      return newStart < bEnd && newEnd > bStart;
    });

    if (clash) {
      setError(
        `Overlaps an existing booking (${formatTime(clash.start)}–${formatTime(clash.end)} · ${clash.purpose}). Pick a slot that starts at or after it ends.`
      );
      return;
    }

    setBookings((list) => [
      ...list,
      {
        id: `b-${Date.now()}`,
        assetId: resource.id,
        bookedById: currentUserId,
        start: `${date}T${start}:00`,
        end: `${date}T${end}:00`,
        status: "UPCOMING",
        purpose: purpose || "Booking",
      },
    ]);
    setPurpose("");
    setError(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Booking"
      description={`${resource.name} · ${date}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="filled" type="submit" form="booking-form">Book</Button>
        </>
      }
    >
      <form id="booking-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start">
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="End">
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </Field>
        </div>
        <Field label="Purpose">
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Sprint planning" />
        </Field>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-control border border-red-600/20 bg-red-500/[0.07] px-3.5 py-3">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={1.5} />
            <p className="text-xs leading-relaxed text-red-800">{error}</p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-control border border-black/[0.08] bg-black/[0.02] px-3.5 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
            <p className="text-xs leading-relaxed text-black/50">
              A reminder notification is sent before the slot starts.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
