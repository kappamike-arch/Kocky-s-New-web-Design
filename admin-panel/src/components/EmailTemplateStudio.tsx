"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";

// --- Utility helpers ---
const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const download = (filename, text) => {
  const el = document.createElement("a");
  el.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  el.setAttribute("download", filename);
  el.style.display = "none";
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
};

const Field = ({ label, children, hint }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-xl shadow-sm border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Primary = ({ children, className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-xl shadow border border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

// --- Core renderer (shared by all editors) ---
function renderEmailHTML({
  brand,
  sections,
  theme,
}) {
  const banner = brand.banner || "";
  const logo = brand.logo || "";
  const accent = theme.accent || "#111827"; // slate-900
  const text = theme.text || "#111827";
  const bg = theme.bg || "#ffffff";

  const safe = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${safe(brand.subject || "Kocky's Email")}</title>
    <style>
      .btn{display:inline-block;padding:12px 16px;border-radius:10px;text-decoration:none}
    </style>
  </head>
  <body style="margin:0;background:${bg};color:${text};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%">
            ${banner ? `<tr><td><img src="${banner}" alt="Banner" style="display:block;width:100%;height:auto;border:0"/></td></tr>` : ""}
            <tr>
              <td style="padding:24px 24px 8px">
                <div style="display:flex;align-items:center;gap:12px">
                  ${logo ? `<img src="${logo}" alt="Logo" width="48" height="48" style="border-radius:12px"/>` : ""}
                  <div>
                    <div style="font-weight:700;font-size:18px">${safe(brand.senderName || "Kocky's Bar & Grill")}</div>
                    <div style="font-size:12px;color:#6b7280">${safe(brand.senderEmail || "info@kockys.com")}</div>
                  </div>
                </div>
              </td>
            </tr>
            ${sections
              .map((s) => {
                if (s.type === "heading") {
                  return `<tr><td style="padding:16px 24px 0"><h1 style="margin:0;font-size:24px;color:${accent}">${safe(
                    s.text
                  )}</h1></td></tr>`;
                }
                if (s.type === "text") {
                  return `<tr><td style="padding:8px 24px 0;line-height:1.6">${safe(
                    s.text
                  ).replace(/\n/g, "<br/>")}</td></tr>`;
                }
                if (s.type === "cta") {
                  const color = s.color || accent;
                  return `<tr><td style="padding:16px 24px"><a class="btn" href="${safe(
                    s.href
                  )}" style="background:${color};color:#fff" target="_blank">${safe(
                    s.label
                  )}</a></td></tr>`;
                }
                if (s.type === "divider") {
                  return `<tr><td style="padding:16px 24px"><hr style="border:none;height:1px;background:#e5e7eb"/></td></tr>`;
                }
                if (s.type === "two-col") {
                  return `<tr><td style="padding:12px 24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:50%;vertical-align:top;padding-right:8px">${safe(
                    s.left
                  )}</td><td style="width:50%;vertical-align:top;padding-left:8px">${safe(
                    s.right
                  )}</td></tr></table></td></tr>`;
                }
                return "";
              })
              .join("")}
            <tr>
              <td style="padding:24px;color:#6b7280;font-size:12px">
                <div>${safe(brand.footer || "123 Main St, Fresno CA · (555) 555‑5555")}</div>
                <div><a href="#" style="color:#6b7280">Unsubscribe</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// --- Reusable Preview panel ---
function Preview({ html }) {
  const iframeRef = useRef(null);
  React.useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);
  return (
    <iframe ref={iframeRef} className="w-full h-[540px] rounded-2xl border border-slate-200 shadow-sm bg-white" />
  );
}

// --- Editor base component ---
function EditorShell({ title, defaults, templateId, onSave }) {
  const [brand, setBrand] = useState(defaults.brand);
  const [sections, setSections] = useState(defaults.sections);
  const [theme, setTheme] = useState(defaults.theme);
  const [category, setCategory] = useState(templateId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debug logging
  console.log('EditorShell rendering with templateId:', templateId, 'category:', category);

  const html = useMemo(() => renderEmailHTML({ brand, sections, theme }), [brand, sections, theme]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const interval = setInterval(async () => {
      if (onSave) {
        setIsSaving(true);
        try {
          await onSave({ brand, sections, theme, category });
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, brand, sections, theme, onSave]);

  // Warn before navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateState = (updater) => {
    updater();
    setHasUnsavedChanges(true);
  };

  const addSection = (type) => {
    updateState(() => {
      setSections((s) => [
        ...s,
        type === "heading"
          ? { type: "heading", text: "New headline" }
          : type === "text"
          ? { type: "text", text: "New paragraph" }
          : type === "cta"
          ? { type: "cta", label: "View Menu", href: "https://kockys.com", color: theme.accent }
          : type === "divider"
          ? { type: "divider" }
          : { type: "two-col", left: "Left text", right: "Right text" },
      ]);
    });
  };

  const updateSection = (idx, patch) => {
    updateState(() => {
      setSections((arr) => arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    });
  };

  const removeSection = (idx) => {
    updateState(() => {
      setSections((arr) => arr.filter((_, i) => i !== idx));
    });
  };

  const onUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataURL(file);
    updateState(() => {
      setBrand((b) => ({ ...b, [key]: dataUrl }));
    });
  };

  const saveTemplate = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave({ brand, sections, theme, category });
        setHasUnsavedChanges(false);
        alert('Template saved successfully!');
      } catch (error) {
        alert('Failed to save template: ' + error.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const exportJSON = () => {
    const payload = { brand, sections, theme };
    download(`${(brand.subject || "email").toLowerCase().replace(/\s+/g, "-")}.json`, JSON.stringify(payload, null, 2));
  };

  const exportHTML = () => {
    download(`${(brand.subject || "email").toLowerCase().replace(/\s+/g, "-")}.html`, html);
  };

  const copyHTML = async () => {
    await navigator.clipboard.writeText(html);
    alert("HTML copied to clipboard");
  };

  const sendTest = async () => {
    const to = prompt("Send test to email:", brand.testTo || "info@kockys.com");
    if (!to) return;
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject: brand.subject || "Test Email", html }),
      });
      
      if (response.ok) {
        alert("Test email sent successfully!");
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (e) {
      alert("Failed to send test email: " + e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {hasUnsavedChanges && (
              <p className="text-sm text-orange-600 mt-1">• Unsaved changes</p>
            )}
            {isSaving && (
              <p className="text-sm text-blue-600 mt-1">• Saving...</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
            <Button onClick={exportJSON}>Export JSON</Button>
            <Button onClick={copyHTML}>Copy HTML</Button>
            <Primary onClick={exportHTML}>Download HTML</Primary>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Subject">
            <input
              value={brand.subject}
              onChange={(e) => updateState(() => setBrand({ ...brand, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setCategory(newCategory);
                setHasUnsavedChanges(true);
                // Update the URL to reflect the new category
                window.history.pushState({}, '', `/admin/email-studio/${newCategory}/`);
                // Reload the page to load the new template
                window.location.reload();
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="inquiry">Inquiry</option>
              <option value="quote">Quote</option>
              <option value="mobileBar">Mobile Bar</option>
              <option value="booking">Booking</option>
              <option value="catering">Catering</option>
            </select>
          </Field>
          <Field label="Sender name">
            <input
              value={brand.senderName}
              onChange={(e) => updateState(() => setBrand({ ...brand, senderName: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="From email">
            <input
              value={brand.senderEmail}
              onChange={(e) => updateState(() => setBrand({ ...brand, senderEmail: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="Accent color">
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => updateState(() => setTheme({ ...theme, accent: e.target.value }))}
              className="w-full h-10 rounded-xl border border-slate-300"
            />
          </Field>
          <Field label="Text color">
            <input
              type="color"
              value={theme.text}
              onChange={(e) => updateState(() => setTheme({ ...theme, text: e.target.value }))}
              className="w-full h-10 rounded-xl border border-slate-300"
            />
          </Field>
          <Field label="Background color">
            <input
              type="color"
              value={theme.bg}
              onChange={(e) => updateState(() => setTheme({ ...theme, bg: e.target.value }))}
              className="w-full h-10 rounded-xl border border-slate-300"
            />
          </Field>
          <Field label="Logo upload" hint="PNG/JPG">
            <input type="file" accept="image/*" onChange={(e) => onUpload(e, "logo")} />
          </Field>
          <Field label="Banner upload" hint="1200×400 recommended">
            <input type="file" accept="image/*" onChange={(e) => onUpload(e, "banner")} />
          </Field>
          <Field label="Footer">
            <input
              value={brand.footer}
              onChange={(e) => updateState(() => setBrand({ ...brand, footer: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-slate-500">Add block:</span>
            <Button onClick={() => addSection("heading")}>Heading</Button>
            <Button onClick={() => addSection("text")}>Text</Button>
            <Button onClick={() => addSection("cta")}>CTA</Button>
            <Button onClick={() => addSection("two-col")}>Two‑column</Button>
            <Button onClick={() => addSection("divider")}>Divider</Button>
            <Primary className="ml-auto" onClick={sendTest}>Send test</Primary>
          </div>

          <div className="space-y-3">
            {sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{s.type}</div>
                  <button className="text-red-500 text-sm" onClick={() => removeSection(i)}>Remove</button>
                </div>
                {s.type === "heading" && (
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    value={s.text}
                    onChange={(e) => updateSection(i, { text: e.target.value })}
                  />
                )}
                {s.type === "text" && (
                  <textarea
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 min-h-[90px]"
                    value={s.text}
                    onChange={(e) => updateSection(i, { text: e.target.value })}
                  />
                )}
                {s.type === "cta" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="Label"
                      value={s.label}
                      onChange={(e) => updateSection(i, { label: e.target.value })}
                    />
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="https://"
                      value={s.href}
                      onChange={(e) => updateSection(i, { href: e.target.value })}
                    />
                    <input
                      type="color"
                      className="rounded-xl border border-slate-300"
                      value={s.color || theme.accent}
                      onChange={(e) => updateSection(i, { color: e.target.value })}
                    />
                  </div>
                )}
                {s.type === "two-col" && (
                  <div className="grid grid-cols-2 gap-3">
                    <textarea
                      className="rounded-xl border border-slate-300 px-3 py-2 min-h-[70px]"
                      value={s.left}
                      onChange={(e) => updateSection(i, { left: e.target.value })}
                    />
                    <textarea
                      className="rounded-xl border border-slate-300 px-3 py-2 min-h-[70px]"
                      value={s.right}
                      onChange={(e) => updateSection(i, { right: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Live preview</h3>
            <span className="text-xs text-slate-400">640px canvas</span>
          </div>
          <Preview html={html} />
        </div>
      </div>
    </div>
  );
}

// --- Presets for the three editors ---
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

interface EmailTemplateStudioProps {
  templateId: string;
}

export default function EmailTemplateStudio({ templateId }: EmailTemplateStudioProps) {
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DEBUG: Add a very obvious element to confirm component is rendering
  console.log('🚨🚨🚨 EmailTemplateStudio component rendering with templateId:', templateId, 'at', new Date().toLocaleTimeString());

  // Fetch template data from server
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/email-templates/studio/${templateId}`);
        
        if (response.ok) {
          const data = await response.json();
          setTemplateData(data);
        } else if (response.status === 404) {
          // Use fallback preset
          setTemplateData(presets[templateId] || presets.inquiry);
        } else {
          throw new Error('Failed to fetch template');
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError(err.message);
        // Fallback to preset
        setTemplateData(presets[templateId] || presets.inquiry);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleSave = async (data) => {
    const response = await fetch(`/api/email-templates/studio/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Template Not Found</h1>
          <p className="text-slate-600 mb-4">The template "{templateId}" could not be found.</p>
          <a href="/admin/email-templates" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Templates
          </a>
        </div>
      </div>
    );
  }

  const titles = {
    inquiry: "Inquiry Confirmation Template",
    quote: "Quote / Proposal Template", 
    mobileBar: "Mobile Bar Booking Template",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* DEBUG BANNER - This should be visible if component is rendering */}
      <div style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      }}>
        🚨 DEBUG: EmailTemplateStudio Component is Rendering! TemplateId: {templateId} | Time: {new Date().toLocaleTimeString()}
      </div>
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200" style={{marginTop: '80px'}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Kocky's Email Template Studio</div>
            {error && (
              <p className="text-sm text-orange-600 mt-1">⚠ Using fallback template (server data unavailable)</p>
            )}
          </div>
          <nav className="flex gap-2">
            <a 
              href="/admin/email-templates"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm"
            >
              ← Back to Templates
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <EditorShell 
          title={titles[templateId] || `Template: ${templateId}`}
          defaults={templateData}
          templateId={templateId}
          onSave={handleSave}
        />
      </main>

      <footer className="max-w-6xl mx-auto px-6 pb-10 text-center text-sm text-slate-400">
        Built for Kocky's · Upload logos/banners, edit blocks, preview, export HTML/JSON, and Send Test.
      </footer>
    </div>
  );
}
