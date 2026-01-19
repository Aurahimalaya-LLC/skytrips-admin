import Mailgun from "mailgun.js";
import formData from "form-data";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

const client = () => {
  const key = process.env.NEXT_PUBLIC_MAILGUN_API_KEY || "";
  const username = process.env.NEXT_PUBLIC_MAILGUN_USERNAME || 'Skytrips'
  const mg = new Mailgun(formData);
  return mg.client({ username: username, key });
};

export async function sendEmail(input: SendEmailInput) {
  const domain = process.env.NEXT_PUBLIC_MAILGUN_DOMAIN || "";
  const defaultFrom = process.env.NEXT_PUBLIC_MAIL_SENDER || "SkyTrips Admin <no-reply@skytrips.com>";
  const c = client();
  const res = await c.messages.create(domain, {
    from: input.from || defaultFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return res;
}

export async function sendWelcomeUser(data: { email: string; fullName?: string; role?: string; readablePassword?: string }) {
  const name = data.fullName || "New User";
  const roleLabel = data.role ? data.role.split("_").map(s => s[0]?.toUpperCase() + s.slice(1)).join(" ") : "";
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; max-width:600px; margin:0 auto;">
      <h2 style="margin:0 0 12px;">Welcome, ${name}</h2>
      <p style="margin:0 0 12px;">Your account has been created in SkyTrips Admin.</p>
      ${roleLabel ? `<p style="margin:0 0 12px;">Role: <strong>${roleLabel}</strong></p>` : ""}
      <div style="margin:16px 0; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc;">
        <h3 style="margin:0 0 10px; font-size:16px; color:#0f172a;">Login Credentials</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; table-layout:fixed; margin:0;">
          <tr>
            <td style="width:140px; color:#64748b; font-weight:700; padding:6px 0; vertical-align:middle;">Email</td>
            <td style="padding:6px 0; vertical-align:middle;">
              <span style="display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; color:#0f172a;">${data.email}</span>
            </td>
          </tr>
          ${data.readablePassword ? `
          <tr>
            <td style="width:140px; color:#64748b; font-weight:700; padding:6px 0; vertical-align:middle;">Password</td>
            <td style="padding:6px 0; vertical-align:middle;">
              <span style="display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; color:#0f172a;">${data.readablePassword}</span>
            </td>
          </tr>
          ` : ``}
        </table>
        <div style="margin-top:10px; font-size:12px; color:#64748b;">
          For security, change your password after first login.
        </div>
      </div>
      <p style="margin:0 0 12px;">You can now sign in and manage bookings.</p>
    </div>
  `;
  return sendEmail({
    to: data.email,
    subject: "Welcome to SkyTrips Admin",
    html,
  });
}
