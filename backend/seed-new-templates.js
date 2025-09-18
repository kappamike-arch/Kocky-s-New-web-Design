import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const base = {
  logoUrl: "https://staging.kockys.com/uploads/logos/kockys-logo.png",
  bannerUrl: "https://staging.kockys.com/uploads/banners/email-banner.jpg",
};

const templates = [
  {
    name: "Food Truck Inquiry",
    slug: "food-truck-inquiry",
    subject: "Thanks for your Food Truck Inquiry, {{customerName}}!",
    html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Inter, Arial; color:#222;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#111;padding:20px;" align="center">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's" height="44"/>{{/if}}
    </td></tr>
    {{#if bannerUrl}}
    <tr><td><img src="{{bannerUrl}}" alt="" width="600" style="display:block"/></td></tr>
    {{/if}}
    <tr><td style="padding:28px;">
      <h2 style="margin:0 0 10px 0;">Hi {{customerName}},</h2>
      <p>Thanks for reaching out about our Food Truck for {{eventDate}} at {{eventLocation}}.</p>
      <p>Estimated headcount: {{headCount}}. Desired service: {{serviceName}}</p>
      <p>We'll review your request and reply with details and pricing.</p>
      <div style="margin:20px 0;padding:14px;border:1px solid #eee;border-radius:10px;background:#fafafa">
        <strong>Contact</strong><br/>
        {{customerName}} • {{customerEmail}} • {{customerPhone}}
      </div>
      <p style="margin:0;">— Kocky's Team</p>
    </td></tr>
    <tr><td style="background:#f5f5f5;padding:18px;font-size:12px;color:#555;" align="center">
      Kocky's Bar & Grill • 123 Main St • Fresno, CA
    </td></tr>
  </table>
</td></tr></table>`,
    text: "Thanks for your Food Truck inquiry.",
    variables: [
      "customerName","customerEmail","customerPhone","eventDate","eventLocation","headCount","serviceName","logoUrl","bannerUrl"
    ],
  },
  {
    name: "Catering Inquiry",
    slug: "catering-inquiry",
    subject: "Catering Inquiry for {{eventDate}} — Kocky's",
    html: "<h2>Catering Inquiry</h2><p>Hi {{customerName}}, thanks for your interest in catering on {{eventDate}} for {{headCount}} guests.</p>",
    text: "Catering inquiry received.",
    variables: ["customerName","eventDate","headCount"]
  },
  {
    name: "Mobile Bar Inquiry",
    slug: "mobile-bar-inquiry",
    subject: "Mobile Bar for {{eventDate}} — We got it!",
    html: "<h2>Mobile Bar</h2><p>We received your mobile bar inquiry for {{eventDate}} at {{eventLocation}}.</p>",
    text: "Mobile bar inquiry received.",
    variables: ["eventDate","eventLocation"]
  },
  {
    name: "Quote Sent",
    slug: "quote-sent",
    subject: "Your Quote #{{quoteNumber}} from Kocky's",
    html: "<h2>Your Quote</h2><p>Hello {{customerName}}, your quote total is {{formatCurrency total}}.</p>",
    text: "Quote sent.",
    variables: ["customerName","quoteNumber","total"]
  }
];

async function main() {
  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { slug: t.slug },
      update: { ...t, ...base },
      create: { ...t, ...base },
    });
  }
}

main().then(() => prisma.$disconnect());



