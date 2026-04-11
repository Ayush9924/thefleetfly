const { sendEmail } = require('../services/mailService');

const sendOTPEmail = async (toEmail, otp) => {
  const subject = 'Your FleetFly OTP Code';
  const text = `Your FleetFly OTP is ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="margin:0 0 16px;color:#1d4ed8;">FleetFly - OTP Verification</h2>
      <p style="margin:0 0 12px;color:#111827;">Use this one-time password to continue:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:12px 16px;background:#eff6ff;border-radius:8px;text-align:center;color:#1d4ed8;">
        ${otp}
      </div>
      <p style="margin:16px 0 8px;color:#374151;">Valid for 10 minutes.</p>
      <p style="margin:0;color:#6b7280;">Did not request this? Ignore this email.</p>
    </div>
  `;

  const result = await sendEmail(toEmail, subject, text, html);
  if (!result.success) {
    throw new Error(result.error || 'Failed to send OTP email');
  }

  return result.data;
};

const sendPasswordChangedEmail = async (toEmail, name = 'User') => {
  const subject = 'FleetFly - Password Changed';
  const text = `Hello ${name}, your FleetFly password was successfully updated.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="margin:0 0 16px;color:#047857;">Password Changed</h2>
      <p style="margin:0 0 8px;color:#111827;">Hello <strong>${name}</strong>, your FleetFly password was successfully updated.</p>
      <p style="margin:0;color:#6b7280;">If you did not do this, contact support immediately.</p>
    </div>
  `;

  const result = await sendEmail(toEmail, subject, text, html);
  if (!result.success) {
    throw new Error(result.error || 'Failed to send password changed email');
  }

  return result.data;
};

const testMailer = async () => {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('[MAILGUN] Missing MAILGUN_API_KEY or MAILGUN_DOMAIN');
    return false;
  }

  console.log('[MAILGUN] Configuration present ✓');
  return true;
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail, testMailer };
