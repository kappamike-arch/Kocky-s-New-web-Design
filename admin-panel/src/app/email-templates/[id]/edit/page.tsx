"use client";
import { useEffect, useState } from "react";
import { getTemplate } from "@/lib/email-templates-api";
import TemplateForm from "../../_components/TemplateForm";

export default function EditTemplate({ params }:{ params: { id: string } }) {
  const [tpl, setTpl] = useState<any>(null);
  useEffect(() => { getTemplate(params.id).then(r => setTpl(r.template)); }, [params.id]);
  if (!tpl) return <div className="p-6">Loading…</div>;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit: {tpl.name}</h1>
      <TemplateForm initial={tpl} id={params.id} />
    </div>
  );
}