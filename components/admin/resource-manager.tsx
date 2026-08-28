"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlert, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { AdminField, AdminResource } from "@/lib/admin-resources";
import { translatableFields } from "@/lib/i18n-fields";
import type { AppLocale } from "@/i18n/routing";

type RecordData = Record<string, string | number | boolean | null | undefined> & { _id: string };
type FieldErrors = Record<string, string>;

export function ResourceManager({ resource, config }: { resource: string; config: AdminResource }) {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [types, setTypes] = useState<RecordData[]>([]);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [locale, setLocale] = useState<AppLocale>("en");
  const visibleFields = locale !== "en" ? config.fields.filter((field) => translatableFields[resource as keyof typeof translatableFields]?.includes(field.key)) : config.fields;

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/content/${resource}?locale=${locale}`);
      const result = await response.json();
      if (response.ok) {
        setRecords(result ? (Array.isArray(result) ? result : [result]) : []);
        setError("");
      } else {
        setError(result.message ?? "Could not load this content.");
      }

      if (resource === "skills") {
        const typeResponse = await fetch(`/api/content/types?locale=${locale}`);
        const typeResult = await typeResponse.json();
        if (typeResponse.ok) setTypes(typeResult);
        else setError(typeResult.message ?? "Could not load skill types.");
      }
    } catch {
      setError("Could not load this content.");
    } finally {
      setBusy(false);
    }
  }, [locale, resource]);

  // Loading remote admin data is the external synchronization this effect owns.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  function begin(record?: RecordData) {
    setEditing(record ?? null);
    setOpen(true);
    setError("");
    setFormError("");
    setFieldErrors({});
  }

  function close() {
    if (busy) return;
    setOpen(false);
    setEditing(null);
    setFormError("");
    setFieldErrors({});
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const validationErrors = validateFields(form, visibleFields, Boolean(editing));
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("");
      focusFirstInvalidField(form, visibleFields, validationErrors);
      return;
    }

    const wasEditing = Boolean(editing);
    setBusy(true);
    setFormError("");
    setFieldErrors({});
    const formData = new FormData(form);
    visibleFields
      .filter((field) => field.type === "checkbox")
      .forEach((field) => formData.set(field.key, formData.has(field.key) ? "true" : "false"));

    try {
      const params = new URLSearchParams({ locale });
      if (editing) params.set("id", editing._id);
      const url = `/api/content/${resource}?${params}`;
      const response = await fetch(url, { method: editing ? "PUT" : "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        const field = fieldForServerError(result.message, config.fields);
        if (field) setFieldErrors({ [field]: result.message });
        else setFormError(result.message ?? "Could not save this record.");
        return;
      }

      setOpen(false);
      setEditing(null);
      await load();
      toast.success(`${capitalize(config.singular)} ${wasEditing ? "updated" : "created"} successfully.`);
    } catch {
      setFormError("Could not save this record. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(record: RecordData) {
    if (!window.confirm(`Delete this ${config.singular}?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/content/${resource}?id=${record._id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Could not delete this record.");
        return;
      }
      await load();
      toast.success(`${capitalize(config.singular)} deleted successfully.`);
    } catch {
      setError("Could not delete this record. Please try again.");
    }
  }

  function clearFieldError(name: string) {
    if (!fieldErrors[name]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  const previewFields = config.fields
    .filter((field) => locale === "en" || translatableFields[resource as keyof typeof translatableFields]?.includes(field.key))
    .filter((field) => field.type !== "image" && field.type !== "pdf" && field.type !== "checkbox")
    .slice(0, 3);

  return <>
    <div className="admin-heading">
      <div><p className="eyebrow">Manage content</p><h1>{config.label}</h1></div>
      <div className="admin-heading-actions"><div className="content-locale-switcher" aria-label="Content language"><button className={locale === "en" ? "active" : ""} onClick={() => { setLocale("en"); setOpen(false); }}>English</button><button className={locale === "ar" ? "active" : ""} onClick={() => { setLocale("ar"); setOpen(false); }}>العربية</button><button className={locale === "tr" ? "active" : ""} onClick={() => { setLocale("tr"); setOpen(false); }}>Türkçe</button></div>{locale === "en" && (!config.singleton || records.length === 0) && <button className="button" onClick={() => begin()}><Plus size={17} /> Add {config.singular}</button>}</div>
    </div>
    {error && <p className="admin-error">{error}</p>}
    {busy && records.length === 0
      ? <div className="admin-empty">Loading…</div>
      : records.length === 0
        ? <div className="admin-empty">No records yet. Add the first {config.singular}.</div>
        : <div className="record-list">{records.map((record) => <article key={record._id}>
          <div>{previewFields.map((field, index) => index === 0
            ? <strong key={field.key}>{String(record[field.key] || "Untitled")}</strong>
            : <span key={field.key}>{String(record[field.key] || "—")}</span>)}</div>
          <div className="record-actions">
            <button onClick={() => begin(record)} title="Edit"><Pencil size={17} /></button>
            {locale === "en" && !config.singleton && <button className="danger" onClick={() => remove(record)} title="Delete"><Trash2 size={17} /></button>}
          </div>
        </article>)}</div>}

    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="admin-modal" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="modal-heading">
          <div><p className="eyebrow">{editing ? "Edit" : "Add"}</p><Dialog.Title asChild><h2>{config.singular}</h2></Dialog.Title></div>
          <Dialog.Close asChild><button aria-label="Close"><X /></button></Dialog.Close>
        </div>
        <form onSubmit={submit} noValidate onInput={(event) => {
          const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          if (target.name) clearFieldError(target.name);
        }}>
          {visibleFields.map((field) => <AdminFormField
            key={field.key}
            field={field}
            editing={editing}
            types={types}
            error={fieldErrors[field.key]}
          />)}
          {formError && <p className="admin-error form-error">{formError}</p>}
          <div className="modal-actions">
            <button type="button" onClick={close}>Cancel</button>
            <button className="button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}

function AdminFormField({ field, editing, types, error }: { field: AdminField; editing: RecordData | null; types: RecordData[]; error?: string }) {
  const errorId = `${field.key}-error`;
  const invalidProps = { "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined };
  if (field.type === "image") return <div className="admin-image-source">
    <label className={error ? "field-invalid" : ""}>{field.label}
      <input name={field.key} type="file" accept="image/*" {...invalidProps} />
    </label>
    <label>Or import from image URL
      <input name={`${field.key}Url`} type="url" placeholder="https://example.com/image.jpg" />
    </label>
    <small>Choose one option. Imported images are saved locally; JPG, PNG, WebP, GIF, and AVIF are supported up to 5 MB.</small>
    {error && <span className="field-message" id={errorId} role="alert"><CircleAlert size={14} />{error}</span>}
  </div>;
  return <label className={`${field.type === "checkbox" ? "checkbox-field " : ""}${error ? "field-invalid" : ""}`}>
    {field.type === "checkbox"
      ? <><input name={field.key} type="checkbox" defaultChecked={Boolean(editing ? editing[field.key] ?? field.defaultValue : field.defaultValue)} {...invalidProps} /> {field.label}</>
      : <>{field.label}
        {field.type === "textarea"
          ? <textarea name={field.key} rows={5} required={field.required} defaultValue={String(editing?.[field.key] ?? field.defaultValue ?? "")} {...invalidProps} />
          : field.type === "select"
            ? <select name={field.key} required={field.required} defaultValue={String(editing?.[field.key] ?? field.defaultValue ?? "")} {...invalidProps}>
              <option value="">Choose {field.label.toLowerCase()}</option>
              {(field.options ?? types.map((type) => ({ value: String(type._id), label: String(type.name) }))).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
            : <input
              name={field.key}
              type={field.type === "pdf" ? "file" : field.type ?? "text"}
              accept={field.type === "pdf" ? "application/pdf,.pdf" : undefined}
              required={field.required && !editing}
              defaultValue={field.type === "pdf" ? undefined : String(editing?.[field.key] ?? field.defaultValue ?? "")}
              {...invalidProps}
            />}
      </>}
    {error && <span className="field-message" id={errorId} role="alert"><CircleAlert size={14} />{error}</span>}
  </label>;
}

function validateFields(form: HTMLFormElement, fields: AdminField[], editing: boolean) {
  const errors: FieldErrors = {};
  for (const field of fields) {
    if (field.type === "checkbox") continue;
    const element = form.elements.namedItem(field.key);
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) continue;
    const file = element instanceof HTMLInputElement && element.type === "file" ? element.files?.[0] : undefined;
    const value = element.value.trim();

    if (field.required && (!editing || element.type !== "file") && !value && !file) {
      errors[field.key] = `${field.label} is required.`;
      continue;
    }
    if (!value && !file) continue;
    if (field.type === "email" && element.validity.typeMismatch) errors[field.key] = "Enter a valid email address.";
    if (field.type === "url" && element.validity.typeMismatch) errors[field.key] = "Enter a complete URL, including https://.";
    if (field.type === "number" && element.validity.badInput) errors[field.key] = "Enter a valid number.";
    if (field.type === "image" && file && (!file.type.startsWith("image/") || file.size > 5_000_000)) errors[field.key] = "Upload an image smaller than 5 MB.";
    if (field.type === "pdf" && file && (file.type !== "application/pdf" || file.size > 10_000_000)) errors[field.key] = "Upload a PDF smaller than 10 MB.";
  }
  return errors;
}

function focusFirstInvalidField(form: HTMLFormElement, fields: AdminField[], errors: FieldErrors) {
  const field = fields.find((item) => errors[item.key]);
  const element = field ? form.elements.namedItem(field.key) : null;
  if (element instanceof HTMLElement) element.focus();
}

function fieldForServerError(message: unknown, fields: AdminField[]) {
  if (typeof message !== "string") return null;
  if (/PDF/i.test(message) && fields.some((field) => field.key === "cv")) return "cv";
  if (/image/i.test(message) && fields.some((field) => field.key === "image")) return "image";
  if (/skill type|referenced/i.test(message) && fields.some((field) => field.key === "type")) return "type";
  return null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
