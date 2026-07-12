"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Wrench } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  getAsset,
  categoryName,
  holderName,
  allocationsForAsset,
  maintenanceForAsset,
  employeeName,
} from "@/lib/mockData";
import { ASSET_STATUS, MAINTENANCE_STATUS } from "@/lib/statuses";
import { formatDate, formatCurrency } from "@/lib/format";

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-black/45">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const asset = getAsset(id);

  if (!asset) {
    return (
      <div>
        <Button href="/assets" className="mb-4">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back
        </Button>
        <EmptyState title="Asset not found" description="This asset may have been removed." />
      </div>
    );
  }

  const history = allocationsForAsset(asset.id).sort(
    (a, b) => new Date(b.allocatedOn) - new Date(a.allocatedOn)
  );
  const maint = maintenanceForAsset(asset.id).sort(
    (a, b) => new Date(b.raisedOn) - new Date(a.raisedOn)
  );

  return (
    <div>
      <Button href="/assets" className="mb-4">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to directory
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{asset.tag}</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            {asset.name}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <StatusPill map={ASSET_STATUS} value={asset.status} />
            <span className="text-sm text-black/45">{categoryName(asset.categoryId)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/allocations")}>
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.5} /> Allocate / Transfer
          </Button>
          <Button onClick={() => router.push("/maintenance")}>
            <Wrench className="h-3.5 w-3.5" strokeWidth={1.5} /> Raise Maintenance
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Details */}
        <Card hover={false}>
          <h3 className="mb-2 text-lg font-light text-foreground">Details</h3>
          <div className="divide-y divide-black/[0.05]">
            <InfoRow label="Serial Number">
              <span className="font-mono text-xs">{asset.serial}</span>
            </InfoRow>
            <InfoRow label="Category">{categoryName(asset.categoryId)}</InfoRow>
            <InfoRow label="Condition">{asset.condition}</InfoRow>
            <InfoRow label="Location">{asset.location}</InfoRow>
            <InfoRow label="Current Holder">
              {asset.holderType ? holderName(asset.holderType, asset.holderId) : "Unassigned"}
            </InfoRow>
            <InfoRow label="Acquisition Date">{formatDate(asset.acquisitionDate)}</InfoRow>
            <InfoRow label="Acquisition Cost">{formatCurrency(asset.acquisitionCost)}</InfoRow>
            <InfoRow label="Bookable">{asset.isBookable ? "Yes" : "No"}</InfoRow>
          </div>
        </Card>

        {/* History */}
        <div className="space-y-3 lg:col-span-2">
          <div>
            <h3 className="mb-2 text-lg font-light text-foreground">Allocation History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-black/45">No allocation history.</p>
            ) : (
              <Table>
                <THead>
                  <Tr>
                    <Th>Holder</Th>
                    <Th>Allocated</Th>
                    <Th>Returned</Th>
                    <Th>Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {history.map((al) => (
                    <Tr key={al.id}>
                      <Td className="text-foreground">{holderName(al.holderType, al.holderId)}</Td>
                      <Td className="text-black/55">{formatDate(al.allocatedOn)}</Td>
                      <Td className="text-black/55">{al.returnedOn ? formatDate(al.returnedOn) : "—"}</Td>
                      <Td>
                        <StatusPill
                          label={al.status === "ACTIVE" ? "Active" : "Returned"}
                          tone={al.status === "ACTIVE" ? "info" : "neutral"}
                        />
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-lg font-light text-foreground">Maintenance History</h3>
            {maint.length === 0 ? (
              <p className="text-sm text-black/45">No maintenance history.</p>
            ) : (
              <Table>
                <THead>
                  <Tr>
                    <Th>Issue</Th>
                    <Th>Raised By</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {maint.map((m) => (
                    <Tr key={m.id}>
                      <Td className="max-w-xs truncate text-foreground">{m.issue}</Td>
                      <Td className="text-black/55">{employeeName(m.raisedById)}</Td>
                      <Td className="text-black/55">{formatDate(m.raisedOn)}</Td>
                      <Td><StatusPill map={MAINTENANCE_STATUS} value={m.status} /></Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
