"use client";

import { useRef, useState } from "react";
import { Plus, CalendarClock, Ban, Info, GripVertical } from "@/components/icons";
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
const HEIGHT = 520; // px height of the day column
const SNAP = 15; // snap dragging to 15-minute increments
const DEFAULT_DATE = "2026-07-13";

const minsInDay = (iso) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};
const dateOf = (iso) => iso.slice(0, 10);
const pad = (n) => String(n).padStart(2, "0");
const fmtMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export default function BookingsPage() {
  const { user } = useCurrentUser();
  const resources = bookableAssets();

  // Default to a resource that actually has bookings today, so the timeline
  // opens with content instead of an empty grid.
  const [assetId, setAssetId] = useState(
    () =>
      (
        resources.find((r) =>
          seedBookings.some(
            (b) => b.assetId === r.id && dateOf(b.start) === DEFAULT_DATE
          )
        ) || resources[0]
      ).id
  );
  const [date, setDate] = useState(DEFAULT_DATE);
  const [bookings, setBookings] = useState(seedBookings);
  const [open, setOpen] = useState(false);

  const resource = resources.find((r) => r.id === assetId);

  const dayBookings = bookings.filter(
    (b) => b.assetId === assetId && dateOf(b.start) === date && b.status !== "CANCELLED"
  );

  const resourceBookings = bookings
    .filter((b) => b.assetId === assetId)
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  function cancelBooking(id) {
    setBookings((list) =>
      list.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );
  }

  // Set a booking's start + end (same day) from dragging or resizing. Values
  // are snapped to 15 min and clamped to the day; rejected (reverts) if the new
  // slot would overlap another booking on the same resource.
  function updateBookingTimes(id, startMin, endMin) {
    setBookings((list) => {
      const b = list.find((x) => x.id === id);
      if (!b) return list;
      const day = dateOf(b.start);
      let s = Math.round(startMin / SNAP) * SNAP;
      let e = Math.round(endMin / SNAP) * SNAP;
      s = Math.max(DAY_START * 60, Math.min(s, DAY_END * 60 - SNAP));
      e = Math.min(DAY_END * 60, Math.max(e, s + SNAP));

      const clash = list.some(
        (o) =>
          o.id !== id &&
          o.assetId === b.assetId &&
          o.status !== "CANCELLED" &&
          dateOf(o.start) === day &&
          s < minsInDay(o.end) &&
          e > minsInDay(o.start)
      );
      if (clash) return list; // reject -> block snaps back

      return list.map((x) =>
        x.id === id
          ? { ...x, start: `${day}T${fmtMin(s)}:00`, end: `${day}T${fmtMin(e)}:00` }
          : x
      );
    });
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

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="sm:w-72">
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name} · {r.tag}</option>
          ))}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card hover={false} className="lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-light text-foreground">{resource.name}</h3>
            <span className="text-xs text-black/45">
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </span>
          </div>
          <p className="mb-4 text-xs text-black/40">
            Drag a booking to move it, or drag its top/bottom edge to change the timing.
          </p>

          <DayTimeline bookings={dayBookings} onUpdate={updateBookingTimes} />
        </Card>

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
const MIN_H = (SNAP / TOTAL_MIN) * HEIGHT; // px height of the minimum (15 min) slot
const EDGE = 9; // px hit-zone at top/bottom for resize vs. move

function DayTimeline({ bookings, onUpdate }) {
  const hours = [];
  for (let h = DAY_START; h <= DAY_END; h++) hours.push(h);
  const rowH = HEIGHT / (DAY_END - DAY_START);

  // Live drag/resize state: { id, mode, top, height }.
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);

  const topFor = (b) => ((minsInDay(b.start) - DAY_START * 60) / TOTAL_MIN) * HEIGHT;
  const heightFor = (b) =>
    Math.max(((minsInDay(b.end) - minsInDay(b.start)) / TOTAL_MIN) * HEIGHT, MIN_H);

  function onPointerDown(e, b) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offY = e.clientY - rect.top;
    const originTop = topFor(b);
    const originHeight = heightFor(b);
    // Grab near an edge -> resize that edge; otherwise move the whole block.
    const mode = offY < EDGE ? "top" : offY > rect.height - EDGE ? "bottom" : "move";
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: b.id, mode, startY: e.clientY, originTop, originHeight };
    setDrag({ id: b.id, mode, top: originTop, height: originHeight });
  }

  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    const delta = e.clientY - d.startY;
    let top = d.originTop;
    let height = d.originHeight;

    if (d.mode === "move") {
      top = Math.max(0, Math.min(d.originTop + delta, HEIGHT - d.originHeight));
    } else if (d.mode === "top") {
      const bottom = d.originTop + d.originHeight;
      top = Math.max(0, Math.min(d.originTop + delta, bottom - MIN_H));
      height = bottom - top;
    } else {
      // bottom edge
      height = Math.max(MIN_H, Math.min(d.originHeight + delta, HEIGHT - d.originTop));
    }
    setDrag({ id: d.id, mode: d.mode, top, height });
  }

  function onPointerUp() {
    const d = dragRef.current;
    if (!d || !drag) return;
    const startMin = DAY_START * 60 + (drag.top / HEIGHT) * TOTAL_MIN;
    const endMin = DAY_START * 60 + ((drag.top + drag.height) / HEIGHT) * TOTAL_MIN;
    onUpdate(d.id, startMin, endMin);
    dragRef.current = null;
    setDrag(null);
  }

  return (
    <div className="relative flex" style={{ height: HEIGHT }}>
      <div className="w-14 shrink-0">
        {hours.map((h) => (
          <div key={h} className="relative" style={{ height: rowH }}>
            <span className="absolute -top-1.5 right-2 font-mono text-[10px] text-black/35">
              {pad(h)}:00
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex-1 border-l border-black/[0.06]">
        {hours.map((h, i) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-black/[0.05]"
            style={{ top: i * rowH }}
          />
        ))}

        {bookings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-black/35">
            No bookings on this day
          </div>
        )}

        {bookings.map((b) => {
          const active = drag?.id === b.id;
          const top = active ? drag.top : topFor(b);
          const height = active ? drag.height : heightFor(b);
          // Live time labels from the current preview geometry.
          const startMin = Math.round((DAY_START * 60 + (top / HEIGHT) * TOTAL_MIN) / SNAP) * SNAP;
          const endMin = Math.round((DAY_START * 60 + ((top + height) / HEIGHT) * TOTAL_MIN) / SNAP) * SNAP;
          return (
            <div
              key={b.id}
              onPointerDown={(e) => onPointerDown(e, b)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className={`group absolute left-1.5 right-1.5 touch-none select-none overflow-hidden rounded-[10px] border px-2 py-1.5 ${
                active
                  ? "z-10 cursor-grabbing border-black/25 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  : "cursor-grab border-black/[0.08] bg-white hover:border-black/20"
              }`}
              style={{ top, height }}
            >
              {/* Resize affordance bars (visual only; edge detection is by position) */}
              <span className="pointer-events-none absolute inset-x-0 top-0 flex h-2 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="h-0.5 w-6 rounded-full bg-black/20" />
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-2 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="h-0.5 w-6 rounded-full bg-black/20" />
              </span>

              <div className="flex items-start gap-1">
                <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-black/25" strokeWidth={1.5} />
                <div className="min-w-0">
                  <div className="truncate text-xs text-foreground">{b.purpose}</div>
                  <div className="font-mono text-[10px] text-black/45">
                    {fmtMin(startMin)}–{fmtMin(endMin)}
                  </div>
                </div>
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
