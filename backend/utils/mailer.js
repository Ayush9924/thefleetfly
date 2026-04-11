const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const response = await axios.post(
    BREVO_API_URL,
    {
      sender: {
        name: 'FleetFly',
        email: process.env.BREVO_FROM,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    }
  );

  console.log('[MAILER] Email sent via Brevo API | MessageID:', response.data.messageId);
  return response.data;
};

const sendOTPEmail = async (toEmail, otp) => {
  return sendEmail({
    to: toEmail,
    subject: 'Your FleetFly OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; font-size: 20px; font-weight: 700;">FleetFly</div>
        <div style="padding: 20px; color: #111827;">
          <p style="margin: 0 0 8px; color: #6b7280;">Fleet Management Platform</p>
          <p style="margin: 0 0 12px;">Your OTP verification code:</p>
          <div style="font-size: 30px; font-weight: 700; letter-spacing: 8px; text-align: center; background: #eff6ff; color: #1d4ed8; border-radius: 8px; padding: 14px 12px; margin: 10px 0 16px;">${otp}</div>
          <p style="margin: 0 0 8px; color: #374151;">Valid for 10 minutes.</p>
          <p style="margin: 0; color: #6b7280;">Didn't request this? Ignore this email.</p>
        </div>
      </div>
    `,
  });
};

const sendPasswordChangedEmail = async (toEmail) => {
  return sendEmail({
    to: toEmail,
    subject: 'FleetFly — Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #ffffff; padding: 16px 20px; font-size: 20px; font-weight: 700;">FleetFly</div>
        <div style="padding: 20px; color: #111827;">
          <p style="margin: 0 0 8px; color: #6b7280;">Fleet Management Platform</p>
          <p style="margin: 0 0 12px;">Your password was successfully changed.</p>
          <p style="margin: 0; color: #6b7280;">If you did not do this, contact support immediately.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail };
