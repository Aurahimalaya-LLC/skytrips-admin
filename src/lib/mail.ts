import nodemailer from "nodemailer";
// Removed: import FormData from "form-data";
// Removed: import Mailgun from "mailgun.js";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachment?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  } | Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
};

// Configure Mailgun
const mailgunApiKey = process.env.MAILGUN_API_KEY || process.env.NEXT_PUBLIC_MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN || process.env.NEXT_PUBLIC_MAILGUN_DOMAIN;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.SUPABASE_SMTP_HOST || "smtp.mailgun.org",
  port: Number(process.env.SMTP_PORT || process.env.SUPABASE_SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.SUPABASE_SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SUPABASE_SMTP_PASS || mailgunApiKey,
  },
});

export async function sendEmail(input: SendEmailInput) {
  const defaultFrom =
    process.env.SMTP_FROM ||
    process.env.NEXT_PUBLIC_MAIL_SENDER ||
    '"SkyTrips Admin" <no-reply@skytrips.com>';

  // Try Mailgun API (via native fetch) first if available
  if (mailgunApiKey && mailgunDomain) {
    try {
      console.log(`Attempting to send email via Mailgun API (fetch) to ${Array.isArray(input.to) ? input.to.join(", ") : input.to}`);
      
      const formData = new FormData();
      formData.append("from", input.from || defaultFrom);
      
      const recipients = Array.isArray(input.to) ? input.to : [input.to];
      recipients.forEach(to => formData.append("to", to));
      
      formData.append("subject", input.subject);
      if (input.text) formData.append("text", input.text);
      if (input.html) formData.append("html", input.html);
      
      if (input.attachment) {
        const attachments = Array.isArray(input.attachment) ? input.attachment : [input.attachment];
        attachments.forEach(att => {
          // Native FormData in Node/Edge can take Blob or File. 
          // If content is Buffer (Node), we might need to wrap it.
          // However, in Edge runtime, Buffer might not exist. 
          // Assuming Node runtime as per route config.
          const blob = new Blob([att.content as unknown as BlobPart], { type: att.contentType || 'application/octet-stream' });
          formData.append("attachment", blob, att.filename);
        });
      }

      const auth = Buffer.from(`api:${mailgunApiKey}`).toString('base64');
      
      const resp = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          // Content-Type is set automatically by fetch with boundary for FormData
        },
        body: formData,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Mailgun API Error: ${resp.status} ${resp.statusText} - ${errText}`);
      }

      const respData = await resp.json();
      console.log("Mailgun API Message sent:", respData.id);
      return { messageId: respData.id };

    } catch (error) {
      console.error("Mailgun API failed, falling back to SMTP:", error);
      if (error && typeof error === 'object' && 'details' in error) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         console.error("Mailgun Error Details:", (error as any).details);
      }
      // Fallback to SMTP below
    }
  } else {
     console.log("Mailgun configuration missing (Key or Domain). Skipping Mailgun API.");
  }

  console.log("Sending email via SMTP...");
  const info = await transporter.sendMail({
    from: input.from || defaultFrom,
    to: Array.isArray(input.to) ? input.to.join(",") : input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachment ? (Array.isArray(input.attachment) ? input.attachment : [input.attachment]) : undefined,
  });

  console.log("SMTP Message sent: %s", info.messageId);
  return info;
}

export async function sendWelcomeUser(data: { email: string; fullName?: string; role?: string; readablePassword?: string; acceptUrl?: string }) {
  const name = data.fullName || "New User";
  const roleLabel = data.role
    ? data.role
        .split("_")
        .map((s) => s[0]?.toUpperCase() + s.slice(1))
        .join(" ")
    : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "";
  const html = `
    <div style="background:#f1f5f9; padding:24px;">
      <div class="container" style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
        <div style="height:6px; background:linear-gradient(90deg,#0ea5e9,#2563eb);"></div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 4px; font-size:22px;">Welcome, ${name}</h2>
          <p style="margin:0 0 12px;">Your account has been created in SkyTrips Admin.</p>
          ${roleLabel ? `<p style="margin:0 0 12px;">Role: <strong>${roleLabel}</strong></p>` : ""}
          <div class="card" style="margin:16px 0; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc;">
            <h3 style="margin:0 0 10px; font-size:16px; color:#0f172a;">Login Credentials</h3>
            <table class="grid" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; table-layout:auto; margin:0;">
              <tr>
                <td class="label" style="color:#64748b; font-weight:700; padding:6px 0;">Email</td>
              </tr>
              <tr>
                <td class="value" style="padding:4px 0; word-break: break-all; word-wrap: break-word;">
                  <span style="display:block; max-width:100%; box-sizing:border-box; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; color:#0f172a; word-break: break-all; word-wrap: break-word; white-space: normal;">${data.email}</span>
                </td>
              </tr>
              ${data.readablePassword ? `
              <tr>
                <td class="label" style="color:#64748b; font-weight:700; padding:6px 0;">Password</td>
              </tr>
              <tr>
                <td class="value" style="padding:4px 0; word-break: break-all; word-wrap: break-word;">
                  <span style="display:block; max-width:100%; box-sizing:border-box; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; color:#0f172a; word-break: break-all; word-wrap: break-word; white-space: normal;">${data.readablePassword}</span>
                </td>
              </tr>
              ` : ``}
            </table>
            <div style="margin-top:10px; font-size:12px; color:#64748b;">
              For security, change your password after first login.
            </div>
          </div>
          ${data.acceptUrl ? `
          <div style="margin-top:12px;">
            <a href="${data.acceptUrl}" class="btn" style="display:inline-block; background:#059669; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:10px;">Accept Invitation</a>
          </div>
          ` : ``}
          ${appUrl ? `
          <div style="margin-top:12px;">
            <a href="${appUrl}" class="btn" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:10px;">Open Admin</a>
          </div>
          ` : ``}
          <p style="margin:16px 0 0; font-size:14px; color:#64748b;">If you didn't request this, contact support.</p>
        </div>
      </div>
      <style>
      .btn:hover { opacity: 0.9; }
      @media (max-width: 600px) {
        .container { border-radius: 0; border: none; }
        .grid td { display: block; width: 100%; }
        .label { padding-bottom: 2px; }
      }
      </style>
    </div>
  `;

  await sendEmail({
    to: data.email,
    subject: "Welcome to SkyTrips Admin",
    html,
  });
}

export async function sendCustomerInvite(data: { email: string; firstName: string; lastName: string }) {
  const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Customer";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "";
  const html = `
    <div style="background:#f1f5f9; padding:24px;">
      <div class="container" style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
        <div style="height:6px; background:linear-gradient(90deg,#0ea5e9,#2563eb);"></div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 4px; font-size:22px;">Invitation</h2>
          <p style="margin:0 0 12px;">Hello ${name}, you are invited to use SkyTrips services.</p>
          ${appUrl ? `
          <div style="margin-top:12px;">
            <a href="${appUrl}" class="btn" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:10px;">Open SkyTrips</a>
          </div>
          ` : ``}
          <p style="margin:16px 0 0; font-size:14px; color:#64748b;">If this wasn't expected, you can ignore this email.</p>
        </div>
      </div>
      <style>
      .btn:hover { opacity: 0.9; }
      @media (max-width: 600px) {
        .container { border-radius: 0; border: none; }
      }
      </style>
    </div>
  `;
  await sendEmail({
    to: data.email,
    subject: "You're invited to SkyTrips",
    html,
  });
}
