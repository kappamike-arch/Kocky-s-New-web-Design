"use client";
import TemplateForm from "../_components/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Email Template</h1>
      <TemplateForm />
    </div>
  );
}