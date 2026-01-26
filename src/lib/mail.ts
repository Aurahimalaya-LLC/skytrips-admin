import nodemailer from "nodemailer";

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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailgun.org",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(input: SendEmailInput) {
  const defaultFrom =
    process.env.SMTP_FROM ||
    process.env.NEXT_PUBLIC_MAIL_SENDER ||
    '"SkyTrips Admin" <no-reply@skytrips.com>';

  const info = await transporter.sendMail({
    from: input.from || defaultFrom,
    to: Array.isArray(input.to) ? input.to.join(",") : input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachment ? (Array.isArray(input.attachment) ? input.attachment : [input.attachment]) : undefined,
  });

  console.log("Message sent: %s", info.messageId);
  return info;
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

export async function sendCustomerInvite(data: { email: string; firstName: string; lastName: string }) {
  const name = `${data.firstName} ${data.lastName}`.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "";
  const signupLink = `${appUrl}/portal/auth/signup?email=${encodeURIComponent(data.email)}`;
  
  const html = `
    <div style="background:#f1f5f9; padding:24px;">
      <div class="container" style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
        <div style="height:6px; background:linear-gradient(90deg,#0ea5e9,#2563eb);"></div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 4px; font-size:22px;">Welcome to SkyTrips!</h2>
          <p style="margin:0 0 12px;">Hello ${name},</p>
          <p style="margin:0 0 24px;">We've created a profile for you. Please complete your registration to access your customer portal where you can view your bookings and manage your profile.</p>
          
          <div style="text-align:center; margin-bottom:24px;">
            <a href="${signupLink}" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:12px 24px; border-radius:10px; font-size:16px;">Complete Registration</a>
          </div>
          
          <p style="margin:0 0 12px; font-size:14px; color:#64748b;">Or copy and paste this link into your browser:</p>
          <p style="margin:0 0 24px; font-size:14px; color:#2563eb; word-break:break-all;">${signupLink}</p>
          
          <div style="border-top:1px solid #e2e8f0; padding-top:16px;">
            <p style="margin:0; font-size:12px; color:#64748b;">If you didn't expect this invitation, please ignore this email.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: "Invitation to SkyTrips Customer Portal",
    html,
  });
}
