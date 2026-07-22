"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import { formatUSD } from "@/lib/catalog";

export interface ExportLine {
  name: string;
  code: string;
  qty: number;
  unit: number | null;
  total: number;
}

type FieldKey = "name" | "code" | "qty" | "unit" | "sum";

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: "name", label: "Название" },
  { key: "code", label: "Артикул" },
  { key: "qty", label: "Кол-во" },
  { key: "unit", label: "Цена шт" },
  { key: "sum", label: "Сумма" },
];

const STORAGE_KEY = "tc_export_fields";
const DEFAULT: Record<FieldKey, boolean> = {
  name: true,
  code: true,
  qty: true,
  unit: true,
  sum: true,
};

function cell(line: ExportLine, key: FieldKey): string {
  switch (key) {
    case "name":
      return line.name;
    case "code":
      return line.code;
    case "qty":
      return String(line.qty);
    case "unit":
      return line.unit !== null ? formatUSD(line.unit) : "-";
    case "sum":
      return formatUSD(line.total);
  }
}

function buildText(lines: ExportLine[], selected: Record<FieldKey, boolean>): string {
  const cols = FIELDS.filter((f) => selected[f.key]);
  const rows = [cols.map((c) => c.label).join("\t")];
  for (const l of lines) rows.push(cols.map((c) => cell(l, c.key)).join("\t"));
  if (selected.sum) {
    const total = lines.reduce((s, l) => s + l.total, 0);
    rows.push(
      cols
        .map((c, i) => (c.key === "sum" ? formatUSD(total) : i === 0 ? "Итого" : ""))
        .join("\t"),
    );
  }
  return rows.join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CartExport({ lines }: { lines: ExportLine[] }) {
  const [selected, setSelected] = useState<Record<FieldKey, boolean>>(() => {
    if (typeof window === "undefined") return DEFAULT;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Record<FieldKey, boolean>>) };
    } catch {
      /* ignore */
    }
    return DEFAULT;
  });
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      /* ignore */
    }
  }, [selected]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const anySelected = FIELDS.some((f) => selected[f.key]);

  function toggle(key: FieldKey) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onCopy() {
    if (!anySelected || lines.length === 0) return;
    const ok = await copyText(buildText(lines, selected));
    if (ok) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Экспорт в буфер обмена</span>
        <button
          onClick={onCopy}
          disabled={!anySelected}
          className={`press inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
            copied
              ? "bg-accent-soft text-accent-strong"
              : "border border-line text-foreground hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line disabled:hover:text-foreground"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} /> Скопировано
            </>
          ) : (
            <>
              <ClipboardCopy size={14} /> Копировать
            </>
          )}
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {FIELDS.map((f) => {
          const on = selected[f.key];
          return (
            <button
              key={f.key}
              onClick={() => toggle(f.key)}
              aria-pressed={on}
              className={`press rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-card text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
