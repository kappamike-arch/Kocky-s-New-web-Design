"use client";

import { use } from "react";
import EmailTemplateStudio from "@/components/EmailTemplateStudio";

interface PageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default function EmailStudioTemplatePage({ params }: PageProps) {
  const { templateId } = use(params);
  return <EmailTemplateStudio templateId={templateId} />;
}

