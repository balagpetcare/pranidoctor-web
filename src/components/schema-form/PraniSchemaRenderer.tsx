"use client";

import { memo } from "react";
import DOMPurify from "isomorphic-dompurify";

import type {
  PraniSchemaDocument,
  PraniSchemaField,
} from "@/lib/service-instances/semen-instance-schema.types";
import { cn } from "@/lib/cn";

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

const FieldBlock = memo(function FieldBlock(props: {
  field: PraniSchemaField;
  value: unknown;
  mode: "read" | "edit";
  onChange?: (key: string, v: unknown) => void;
}) {
  const { field, value, mode, onChange } = props;
  const valStr = formatValue(value);

  if (field.type === "warning" || field.type === "note") {
    return (
      <div
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          field.type === "warning"
            ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
            : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100",
        )}
      >
        <div className="font-medium">{field.labelBn}</div>
        <div className="mt-1 whitespace-pre-wrap">{valStr}</div>
      </div>
    );
  }

  if (field.type === "richText" && typeof value === "string") {
    const safe = DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
    return (
      <div>
        <div className="text-xs font-medium text-zinc-500">{field.labelBn}</div>
        <div
          className="prose prose-sm mt-1 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      </div>
    );
  }

  if (mode === "edit" && !field.readOnly && field.source === "payload") {
    if (field.type === "textarea" || field.type === "animalCondition") {
      return (
        <label className="block text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-200">
            {field.labelBn}
          </span>
          <textarea
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            rows={3}
            value={typeof value === "string" ? value : valStr}
            onChange={(e) => onChange?.(field.key, e.target.value)}
          />
        </label>
      );
    }
    return (
      <label className="block text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {field.labelBn}
        </span>
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          value={
            typeof value === "string" || typeof value === "number"
              ? String(value)
              : valStr
          }
          onChange={(e) => onChange?.(field.key, e.target.value)}
        />
      </label>
    );
  }

  return (
    <div className="text-sm">
      <div className="text-xs font-medium text-zinc-500">{field.labelBn}</div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-100">
        {valStr}
      </div>
    </div>
  );
});

export function PraniSchemaRenderer(props: {
  schema: PraniSchemaDocument;
  values: Record<string, unknown>;
  mode?: "read" | "edit";
  onFieldChange?: (key: string, v: unknown) => void;
}) {
  const { schema, values, mode = "read", onFieldChange } = props;

  return (
    <div className="space-y-6">
      {schema.sections.map((sec) => (
        <section key={sec.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {sec.titleBn}
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {sec.fields.map((f) => (
              <FieldBlock
                key={f.key}
                field={f}
                value={values[f.key]}
                mode={mode}
                onChange={onFieldChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
