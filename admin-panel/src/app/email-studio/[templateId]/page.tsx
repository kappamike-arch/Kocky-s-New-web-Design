"use client";

import EmailTemplateStudio from "@/components/EmailTemplateStudio";

interface PageProps {
  params: {
    templateId: string;
  };
}

export default function EmailStudioTemplatePage({ params }: PageProps) {
  return <EmailTemplateStudio templateId={params.templateId} />;
}
