const { sendEmail, sendOtpEmail } = require('../services/mailService');

const sendOTPEmail = async (toEmail, otp) => {
  const result = await sendOtpEmail(toEmail, otp);
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
