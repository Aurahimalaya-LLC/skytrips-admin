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

export async function sendWelcomeUser(data: { email: string; fullName?: string; role?: string }) {
  const name = data.fullName || "New User";
  const roleLabel = data.role ? data.role.split("_").map(s => s[0]?.toUpperCase() + s.slice(1)).join(" ") : "";
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #0f172a;">
      <h2 style="margin:0 0 12px;">Welcome, ${name}</h2>
      <p style="margin:0 0 12px;">Your account has been created in SkyTrips Admin.</p>
      ${roleLabel ? `<p style="margin:0 0 12px;">Role: <strong>${roleLabel}</strong></p>` : ""}
      <p style="margin:0 0 12px;">You can now sign in and manage bookings.</p>
    </div>
  `;
  return sendEmail({
    to: data.email,
    subject: "Welcome to SkyTrips Admin",
    html,
  });
}
