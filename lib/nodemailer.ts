import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

export function createTransporter() {
  if (!smtpHost || !smtpUser) {
    throw new Error("SMTP_HOST and SMTP_USER must be configured in .env");
  }
  if (!smtpPass) {
    throw new Error("SMTP_PASS is not set. Configure a Gmail app password (or SMTP password) in .env");
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendAdminOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter();
  const from = smtpUser;
  await transporter.sendMail({
    from,
    to,
    subject: "Femiknit Admin — Your Verification Code",
    text: `Your admin verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nFemiknit Admin Panel`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; text-align: center; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Your Verification Code</h2>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
          Enter the following code to access the Femiknit admin panel:
        </p>
        <div style="font-size: 36px; font-weight: 700; color: #0f172a; letter-spacing: 6px; margin: 24px 0; font-family: monospace;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #94a3bc;">
          This code will expire in 5 minutes.
        </p>
        <p style="font-size: 12px; color: #cbd5e1; margin-top: 16px;">
          Femiknit Admin Panel
        </p>
      </div>
    `,
  });
}
