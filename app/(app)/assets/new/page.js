"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { assets, categories, getCategory } from "@/lib/mockData";

export default function NewAssetPage() {
  const router = useRouter();

  // Auto-generate the next asset tag (AF-0001 style).
  const nextTag = `AF-${String(assets.length + 1).padStart(4, "0")}`;

  const [form, setForm] = useState({
    name: "",
    categoryId: categories[0].id,
    serial: "",
    acquisitionDate: "",
    acquisitionCost: "",
    condition: "Good",
    location: "",
    isBookable: false,
    custom: {},
  });
  const update = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const selectedCategory = getCategory(form.categoryId);

  function submit(e) {
    e.preventDefault();
    // Phase 1: no persistence — confirm and return to the directory.
    router.push("/assets");
  }

  return (
    <div>
      <Button href="/assets" className="mb-4">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to directory
      </Button>

      <PageHeader
        eyebrow="Assets"
        title="Register Asset"
        description="Add a new asset to the system. It enters as Available once registered."
      />

      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-3">
        <Card hover={false} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Asset Name" className="sm:col-span-2">
              <Input value={form.name} onChange={update("name")} placeholder='e.g. MacBook Pro 16"' required />
            </Field>
            <Field label="Category">
              <Select value={form.categoryId} onChange={update("categoryId")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Serial Number">
              <Input value={form.serial} onChange={update("serial")} placeholder="e.g. C02FP-2291" />
            </Field>
            <Field label="Acquisition Date">
              <Input type="date" value={form.acquisitionDate} onChange={update("acquisitionDate")} />
            </Field>
            <Field label="Acquisition Cost (USD)" hint="For ranking & reports only — not accounting.">
              <Input type="number" min="0" value={form.acquisitionCost} onChange={update("acquisitionCost")} placeholder="0" />
            </Field>
            <Field label="Condition">
              <Select value={form.condition} onChange={update("condition")}>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
                <option>New</option>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={update("location")} placeholder="e.g. HQ · Floor 3" />
            </Field>

            {/* Category-specific custom fields */}
            {selectedCategory?.customFields?.length > 0 &&
              selectedCategory.customFields.map((f) => (
                <Field key={f} label={f}>
                  <Input
                    value={form.custom[f] || ""}
                    onChange={(e) =>
                      setForm({ ...form, custom: { ...form.custom, [f]: e.target.value } })
                    }
                    placeholder={f}
                  />
                </Field>
              ))}

            <label className="sm:col-span-2 mt-1 flex items-center gap-2.5 text-sm text-black/60">
              <input type="checkbox" checked={form.isBookable} onChange={update("isBookable")} className="h-4 w-4" />
              Shared / bookable resource (rooms, vehicles, equipment)
            </label>
          </div>
        </Card>

        {/* Side column: tag preview + upload + submit */}
        <div className="space-y-3">
          <Card hover={false}>
            <div className="text-[11px] uppercase tracking-widest text-black/40">Auto-generated Tag</div>
            <div className="mt-2 font-mono text-2xl font-light text-foreground">{nextTag}</div>
            <p className="mt-2 text-xs text-black/45">Assigned automatically on registration.</p>
          </Card>

          <Card hover={false}>
            <div className="text-[11px] uppercase tracking-widest text-black/40">Photo / Documents</div>
            <div className="mt-3 flex flex-col items-center justify-center rounded-control border border-dashed border-black/15 bg-black/[0.02] px-4 py-8 text-center">
              <Upload className="h-5 w-5 text-black/35" strokeWidth={1.5} />
              <p className="mt-2 text-xs text-black/45">Drag & drop or click to upload</p>
            </div>
          </Card>

          <Button type="submit" variant="filled" size="block">Register Asset</Button>
        </div>
      </form>
    </div>
  );
}
