import Mailgun from "mailgun.js";
import formData from "form-data";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachment?: {
    filename: string;
    data: Buffer | string;
    contentType?: string;
  } | Array<{
    filename: string;
    data: Buffer | string;
    contentType?: string;
  }>;
};

const client = () => {
  const key = process.env.NEXT_PUBLIC_MAILGUN_API_KEY || "";
  const username = process.env.NEXT_PUBLIC_MAILGUN_USERNAME || "Skytrips";
  const mg = new Mailgun(formData);
  return mg.client({ username: username, key });
};

export async function sendEmail(input: SendEmailInput) {
  const domain = process.env.NEXT_PUBLIC_MAILGUN_DOMAIN || "";
  const defaultFrom =
    process.env.NEXT_PUBLIC_MAIL_SENDER ||
    "SkyTrips Admin <no-reply@skytrips.com>";
  const c = client();
  const res = await c.messages.create(domain, {
    from: input.from || defaultFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachment: input.attachment,
  });
  return res;
}

export async function sendWelcomeUser(data: { email: string; fullName?: string; role?: string; readablePassword?: string }) {
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
          ${appUrl ? `
          <div style="margin-top:12px;">
            <a href="${appUrl}" class="btn" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:10px;">Open Admin</a>
          </div>
          ` : ``}
          <p style="margin:16px 0 0; font-size:14px; color:#64748b;">If you didn't request this, contact support.</p>
        </div>
      </div>
      <style>
        @media (max-width: 480px) {
          .container { width:100% !important }
          .card { padding:14px !important }
          .grid td { display:block !important; width:100% !important; padding:4px 0 !important }
          .grid .label { margin-bottom:2px !important; font-size:13px !important }
          .grid .value span { display:block !important; width:100% !important }
          .btn { display:block !important; width:100% !important; text-align:center !important }
        }
      </style>
    </div>
  `;
  return sendEmail({
    to: data.email,
    subject: "Welcome to SkyTrips Admin",
    html,
  });
}
