import { NextRequest, NextResponse } from 'next/server';

// Preset templates data
const presets = {
  inquiry: {
    brand: {
      subject: "Thanks for your inquiry — we got it!",
      senderName: "Kocky's Bar & Grill",
      senderEmail: "info@kockys.com",
      footer: "Kocky's Bar & Grill · 123 Main St, Fresno CA",
      logo: "",
      banner: "",
    },
    theme: { accent: "#4f46e5", text: "#111827", bg: "#ffffff" },
    sections: [
      { type: "heading", text: "We received your inquiry, {{customerName}}!" },
      { type: "text", text: "Thanks for reaching out about {{serviceName}}. Our team will reply within 1 business day." },
      { type: "cta", label: "View Menu", href: "https://kockys.com/menu", color: "#4f46e5" },
      { type: "divider" },
      { type: "text", text: "Questions? Reply to this email or call (555) 555‑5555." },
    ],
  },
  quote: {
    brand: {
      subject: "Your quote from Kocky's (##{{quoteNumber}})",
      senderName: "Kocky's Sales",
      senderEmail: "info@kockys.com",
      footer: "Kocky's · Quotes",
      logo: "",
      banner: "",
    },
    theme: { accent: "#16a34a", text: "#0f172a", bg: "#ffffff" },
    sections: [
      { type: "heading", text: "Your quote is ready" },
      { type: "two-col", left: "Service: {{serviceName}}\nEvent Date: {{eventDate}}", right: "Total: {{total}}\nValid until: {{validUntil}}" },
      { type: "cta", label: "Approve & Pay Deposit", href: "https://staging.kockys.com/quotes/{{quoteId}}" },
      { type: "divider" },
      { type: "text", text: "If anything looks off, reply and we'll tweak it right away." },
    ],
  },
  mobileBar: {
    brand: {
      subject: "Mobile Bar booking received",
      senderName: "Kocky's Events",
      senderEmail: "info@kockys.com",
      footer: "Kocky's · Events",
      logo: "",
      banner: "",
    },
    theme: { accent: "#ea580c", text: "#1f2937", bg: "#ffffff" },
    sections: [
      { type: "heading", text: "Cheers, {{customerName}}!" },
      { type: "text", text: "Your Mobile Bar request is in. We'll confirm availability and send next steps." },
      { type: "cta", label: "See Packages", href: "https://staging.kockys.com/mobile-bar" },
    ],
  },
};

// GET - Fetch template data
export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    
    // For now, return preset data
    // In a real implementation, you'd fetch from your database
    const templateData = presets[templateId as keyof typeof presets];
    
    if (!templateData) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(templateData);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Save template data
export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    const templateData = await request.json();
    
    // For now, just log the data
    // In a real implementation, you'd save to your database
    console.log(`Saving template ${templateId}:`, templateData);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Template saved successfully',
      templateId 
    });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    );
  }
}
