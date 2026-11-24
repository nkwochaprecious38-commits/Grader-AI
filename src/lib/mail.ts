import nodemailer from "nodemailer";
export const mailConfigured = () => !!process.env.SMTP_HOST;
export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
export async function sendMail(to: string, subject: string, text: string) {
  if (!mailConfigured()) { console.log(`[mail not configured] To: ${to}\n${subject}\n${text}`); return false; }
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await t.sendMail({ from: process.env.SMTP_FROM || "Grader AI <no-reply@localhost>", to, subject, text });
  return true;
}
