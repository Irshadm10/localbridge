// Supabase Edge Function: send-support-email
//
// Goal: **receive** every contact / feedback / bug / Trust & Safety submission
// in the Bridge company **inbox** (default: mentors.bridge@gmail.com). We are
// not pretending mail is sent *from* that Gmail — Resend sends the message and
// the **To:** (and optional **Reply-To:**) is what routes reports into Gmail.
//
// Uses the official Resend Node SDK via Deno’s npm specifier:
//   import { Resend } from "npm:resend@4";
// Do **not** put your key in code like `new Resend('re_xxxxxxxxx')`. Replace
// `re_xxxxxxxxx` with your real key only when setting the Supabase secret:
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
//
// Required Supabase secret:
//   RESEND_API_KEY     Resend API key (https://resend.com/api-keys)
//
// Optional Supabase secrets:
//   SUPPORT_TO_EMAIL   **Inbox that receives all reports** (To:). Default:
//                      mentors.bridge@gmail.com — this is the company mailbox.
//   SUPPORT_FROM_EMAIL Technical **From:** for deliverability (Resend domain).
//                      Default: "Bridge Support <onboarding@resend.dev>".
//                      Does not change where mail is received; only who sends it.
//
// Deploy + configure:
//   supabase secrets set RESEND_API_KEY=re_your_key_here
//   supabase functions deploy send-support-email
//
// Invoke (client):
//   await supabase.functions.invoke('send-support-email', { body: {...} })

import { Resend } from "npm:resend@4";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const TO_EMAIL = Deno.env.get("SUPPORT_TO_EMAIL") ?? "mentors.bridge@gmail.com";
const FROM_EMAIL =
  Deno.env.get("SUPPORT_FROM_EMAIL") ?? "Bridge Support <onboarding@resend.dev>";

type Payload = {
  kind?: "contact" | "feedback" | "bug" | "safety";
  ticketId?: string;
  subject?: string;
  body?: string;
  replyTo?: string;
  fromName?: string;
  meta?: Record<string, unknown>;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

/** Very small HTML escape — we only embed user text, never attributes. */
function esc(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHtml(p: Required<Pick<Payload, "ticketId">> & Payload): string {
  const kindLabel =
    p.kind === "bug"
      ? "Bug report"
      : p.kind === "safety"
      ? "Trust & Safety report"
      : p.kind === "feedback"
      ? "Feedback"
      : "Contact request";

  const metaRows = Object.entries(p.meta ?? {})
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:4px 12px 4px 0;color:#78716c;font-size:12px;white-space:nowrap;">${esc(k)}</td>
          <td style="padding:4px 0;color:#1c1917;font-size:13px;">${esc(v)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#faf6ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(120,113,108,0.14);border-radius:16px;overflow:hidden;">
    <div style="padding:20px 24px;background:linear-gradient(135deg,#ea580c,#f59e0b);color:#ffffff;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;opacity:0.9;">Bridge · ${esc(kindLabel)}</div>
      <div style="margin-top:4px;font-size:20px;font-weight:700;">Ticket #${esc(p.ticketId)}</div>
    </div>
    <div style="padding:20px 24px;">
      ${metaRows ? `<table role="presentation" style="border-collapse:collapse;margin-bottom:16px;">${metaRows}</table>` : ""}
      <div style="margin-top:12px;padding:16px;border:1px solid #f3eee6;background:#faf7f2;border-radius:12px;white-space:pre-wrap;font-size:14px;line-height:1.55;color:#1c1917;">
${esc(p.body ?? "")}
      </div>
      ${p.replyTo ? `<p style="margin-top:16px;font-size:12px;color:#78716c;">Reply directly to <a href="mailto:${esc(p.replyTo)}" style="color:#c2410c;">${esc(p.replyTo)}</a> — this message has reply-to set.</p>` : `<p style="margin-top:16px;font-size:12px;color:#78716c;">Submitter did not leave an email (anonymous report).</p>`}
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!RESEND_API_KEY) {
    return json(
      {
        error: "email_not_configured",
        message: "RESEND_API_KEY is not set on this Supabase project.",
      },
      503,
    );
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const ticketId = payload.ticketId || `BRG-${Date.now().toString(36).toUpperCase()}`;
  const subject = payload.subject || `[Bridge] [#${ticketId}] Support request`;
  const body = (payload.body || "").trim();
  if (!body) return json({ error: "empty_body" }, 400);

  const html = renderHtml({ ...payload, ticketId });
  const text = [
    `Ticket ID: ${ticketId}`,
    payload.fromName ? `From: ${payload.fromName}` : null,
    payload.replyTo ? `Reply-To: ${payload.replyTo}` : "Reply-To: (not provided)",
    "",
    body,
    "",
    `Ticket: ${ticketId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject,
      html,
      text,
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      headers: {
        "X-Bridge-Ticket": ticketId,
        "X-Bridge-Kind": payload.kind ?? "contact",
      },
    });

    if (error) {
      return json({ error: "resend_failed", detail: error }, 502);
    }

    return json({ ok: true, ticketId, id: data?.id ?? null });
  } catch (err) {
    return json(
      { error: "send_failed", message: String((err as Error)?.message ?? err) },
      500,
    );
  }
});
