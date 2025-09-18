"use client";
import { useEffect, useMemo, useState } from "react";
import { createTemplate, updateTemplate, previewTemplate, sendTest } from "@/lib/email-templates-api";

type TemplateInput = {
  name: string; slug: string; subject: string; html: string; text?: string;
  variables?: string[]; logoUrl?: string; bannerUrl?: string; isActive?: boolean;
};

export default function TemplateForm({ initial, id }:{ initial?: Partial<TemplateInput>, id?: string }) {
  const [form, setForm] = useState<TemplateInput>({
    name: "", slug: "", subject: "", html: "", text: "", variables: [], logoUrl: "", bannerUrl: "", isActive: true,
    ...initial
  } as TemplateInput);
  const [sampleVars, setSampleVars] = useState<Record<string, any>>({
    customerName: "Chris", customerEmail: "chris@example.com", quoteNumber: "Q-10293", total: 199.99,
    eventDate: "2025-10-01", eventLocation: "Downtown Fresno", headCount: 80, serviceName: "Food Truck",
    logoUrl: form.logoUrl, bannerUrl: form.bannerUrl
  });
  const [previewHtml, setPreviewHtml] = useState<string>("");

  async function doPreview() {
    const r = await previewTemplate({ html: form.html, variables: sampleVars });
    setPreviewHtml(r.html || "");
  }

  async function save() {
    const payload = { ...form };
    if (id) await updateTemplate(id, payload);
    else await createTemplate(payload);
    alert("Saved");
  }

  async function sendPreview() {
    const to = prompt("Send test to (email):", "info@kockys.com");
    if (!to) return;
    const r = await sendTest({ to, subject: form.subject || "Test", html: form.html, variables: sampleVars });
    if (r.success) alert("Sent");
    else alert(`Send failed: ${r.message || "Unknown"}`);
  }

  useEffect(() => { doPreview(); /* eslint-disable-next-line */}, []);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="space-y-3">
          <input className="w-full border rounded-xl p-3" placeholder="Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}/>
          <input className="w-full border rounded-xl p-3" placeholder="Slug (unique)" value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}/>
          <input className="w-full border rounded-xl p-3" placeholder="Subject" value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}/>
          <input className="w-full border rounded-xl p-3" placeholder="Logo URL" value={form.logoUrl || ""}
            onChange={e => setForm({ ...form, logoUrl: e.target.value })}/>
          <input className="w-full border rounded-xl p-3" placeholder="Banner URL" value={form.bannerUrl || ""}
            onChange={e => setForm({ ...form, bannerUrl: e.target.value })}/>
          <textarea className="w-full border rounded-xl p-3 min-h-[240px]" placeholder="HTML (Handlebars)"
            value={form.html} onChange={e => setForm({ ...form, html: e.target.value })}/>
          <div className="flex gap-2">
            <button onClick={doPreview} className="px-3 py-2 rounded-xl border">Preview</button>
            <button onClick={save} className="px-3 py-2 rounded-xl bg-black text-white">Save</button>
            <button onClick={sendPreview} className="px-3 py-2 rounded-xl bg-indigo-600 text-white">Send Test</button>
          </div>
        </div>
      </div>
      <div>
        <div className="mb-3 font-medium">Live Preview</div>
        <iframe className="w-full h-[700px] border rounded-2xl" srcDoc={previewHtml} />
      </div>
    </div>
  );
}



