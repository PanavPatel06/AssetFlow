"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Boxes } from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/currentUser";
import { assets, categories, categoryName, holderName } from "@/lib/mockData";
import { ASSET_STATUS, ASSET_STATUS_ORDER } from "@/lib/statuses";
import { can } from "@/lib/roles";

function AssetsInner() {
  const params = useSearchParams();
  const { user } = useCurrentUser();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");

  const filtered = assets.filter((a) => {
    const text = `${a.tag} ${a.name} ${a.serial} ${a.location}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (category && a.categoryId !== category) return false;
    if (status && a.status !== status) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Assets"
        title="Asset Directory"
        description="Register, search, and track every asset centrally — by tag, serial, category, status, or location."
        actions={
          can(user.role, "registerAsset") && (
            <Button href="/assets/new" variant="filled">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Register Asset
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" strokeWidth={1.5} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tag, serial, name, location…"
            className="pl-9"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-52">
          <option value="">All statuses</option>
          {ASSET_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{ASSET_STATUS[s].label}</option>
          ))}
        </Select>
      </div>

      <div className="mb-2 text-xs text-black/40">
        {filtered.length} of {assets.length} assets
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="No assets match" description="Try clearing your search or filters." />
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th>Tag</Th>
              <Th>Asset</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Holder</Th>
              <Th>Location</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.map((a) => (
              <Tr key={a.id} className="cursor-pointer hover:bg-black/[0.02]">
                <Td className="font-mono text-xs text-black/55">
                  <Link href={`/assets/${a.id}`} className="block">{a.tag}</Link>
                </Td>
                <Td>
                  <Link href={`/assets/${a.id}`} className="block text-foreground hover:underline">
                    {a.name}
                  </Link>
                  {a.isBookable && (
                    <span className="text-[11px] uppercase tracking-widest text-black/35">Bookable</span>
                  )}
                </Td>
                <Td className="text-black/60">{categoryName(a.categoryId)}</Td>
                <Td><StatusPill map={ASSET_STATUS} value={a.status} /></Td>
                <Td className="text-black/60">
                  {a.holderType ? holderName(a.holderType, a.holderId) : "—"}
                </Td>
                <Td className="text-black/60">{a.location}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

export default function AssetsPage() {
  // useSearchParams requires a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <AssetsInner />
    </Suspense>
  );
}
