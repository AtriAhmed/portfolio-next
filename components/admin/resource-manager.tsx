"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { AdminResource } from "@/lib/admin-resources";

type RecordData = Record<string, string | number | boolean | undefined> & { _id: string };

export function ResourceManager({ resource, config }: { resource: string; config: AdminResource }) {
  const [records, setRecords] = useState<RecordData[]>([]); const [types, setTypes] = useState<RecordData[]>([]);
  const [editing, setEditing] = useState<RecordData | null>(null); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/content/${resource}`); const result = await response.json();
    if (response.ok) setRecords(result ? (Array.isArray(result) ? result : [result]) : []); else setError(result.message);
    if (resource === "skills") { const typeResponse = await fetch("/api/content/types"); if (typeResponse.ok) setTypes(await typeResponse.json()); }
    setBusy(false);
  }, [resource]);
  // Loading remote admin data is the external synchronization this effect owns.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  function begin(record?: RecordData) { setEditing(record ?? null); setOpen(true); setError(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const formData = new FormData(event.currentTarget); config.fields.filter((field) => field.type === "checkbox").forEach((field) => formData.set(field.key, formData.has(field.key) ? "true" : "false"));
    const url = `/api/content/${resource}${editing ? `?id=${editing._id}` : ""}`;
    const response = await fetch(url, { method: editing ? "PUT" : "POST", body: formData }); const result = await response.json();
    if (!response.ok) { setError(result.message ?? "Could not save this record."); setBusy(false); return; }
    setOpen(false); setEditing(null); await load();
  }
  async function remove(record: RecordData) {
    if (!window.confirm(`Delete this ${config.singular}?`)) return;
    const response = await fetch(`/api/content/${resource}?id=${record._id}`, { method: "DELETE" });
    if (!response.ok) { const result = await response.json(); setError(result.message); return; } await load();
  }
  const previewFields = config.fields.filter((field) => field.type !== "image" && field.type !== "checkbox").slice(0, 3);
  return <><div className="admin-heading"><div><p className="eyebrow">Manage content</p><h1>{config.label}</h1></div>{(!config.singleton || records.length === 0) && <button className="button" onClick={() => begin()}><Plus size={17} /> Add {config.singular}</button>}</div>
    {error && <p className="admin-error">{error}</p>}
    {busy && records.length === 0 ? <div className="admin-empty">Loading…</div> : records.length === 0 ? <div className="admin-empty">No records yet. Add the first {config.singular}.</div> : <div className="record-list">{records.map((record) => <article key={record._id}><div>{previewFields.map((field, index) => index === 0 ? <strong key={field.key}>{String(record[field.key] || "Untitled")}</strong> : <span key={field.key}>{String(record[field.key] || "—")}</span>)}</div><div className="record-actions"><button onClick={() => begin(record)} title="Edit"><Pencil size={17} /></button>{!config.singleton && <button className="danger" onClick={() => remove(record)} title="Delete"><Trash2 size={17} /></button>}</div></article>)}</div>}
    {open && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="admin-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? "Edit" : "Add"}</p><h2>{config.singular}</h2></div><button onClick={() => setOpen(false)} aria-label="Close"><X /></button></div><form onSubmit={submit}>{config.fields.map((field) => <label key={field.key} className={field.type === "checkbox" ? "checkbox-field" : ""}>{field.type === "checkbox" ? <><input name={field.key} type="checkbox" defaultChecked={Boolean(editing ? editing[field.key] ?? field.defaultValue : field.defaultValue)} /> {field.label}</> : <>{field.label}{field.type === "textarea" ? <textarea name={field.key} rows={5} required={field.required} defaultValue={String(editing?.[field.key] ?? field.defaultValue ?? "")} /> : field.type === "select" ? <select name={field.key} required={field.required} defaultValue={String(editing?.[field.key] ?? field.defaultValue ?? "")}><option value="">Choose a type</option>{types.map((type) => <option value={type._id} key={type._id}>{String(type.name)}</option>)}</select> : <input name={field.key} type={field.type === "image" ? "file" : field.type ?? "text"} accept={field.type === "image" ? "image/*" : undefined} required={field.required && !editing} defaultValue={field.type === "image" ? undefined : String(editing?.[field.key] ?? field.defaultValue ?? "")} />}</>}</label>)}<div className="modal-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button className="button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div></form></div></div>}
  </>;
}
