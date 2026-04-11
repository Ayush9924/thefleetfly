const axios = require('axios');

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY || '';
  const fromEmail = process.env.BREVO_FROM || '';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  if (!apiKey.startsWith('xkeysib-')) {
    throw new Error('Invalid BREVO_API_KEY format. Use raw xkeysib- key, not encoded/base64 JSON.');
  }

  if (!fromEmail) {
    throw new Error('BREVO_FROM is missing');
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'FleetFly', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    console.log('[MAILER] Sent via Brevo API | ID:', response.data.messageId);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const body = error.response?.data;
    console.error('[MAILER] Brevo API failed:', {
      status,
      body,
      message: error.message,
    });
    throw error;
  }
};

const sendOTPEmail = async (toEmail, otp) => sendEmail({
  to: toEmail,
  subject: 'Your FleetFly OTP Code',
  html: `<div style="font-family:sans-serif;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:12px;max-width:480px;margin:0 auto"><h2>FleetFly OTP</h2><div style="background:#1e293b;padding:28px;border-radius:10px;text-align:center;margin:20px 0"><span style="font-size:42px;font-weight:700;letter-spacing:14px;color:#3b82f6">${otp}</span></div><p style="color:#94a3b8;font-size:13px">Valid for 10 minutes. Ignore if you didn't request this.</p></div>`,
});

const sendPasswordChangedEmail = async (toEmail) => sendEmail({
  to: toEmail,
  subject: 'FleetFly — Password Changed',
  html: `<div style="font-family:sans-serif;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:12px;max-width:480px;margin:0 auto"><h2>FleetFly</h2><p>Your password was successfully changed.</p><p style="color:#94a3b8;font-size:13px">Not you? Contact support immediately.</p></div>`,
});

module.exports = { sendOTPEmail, sendPasswordChangedEmail };
