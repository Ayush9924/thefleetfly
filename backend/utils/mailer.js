const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error) => {
  if (error) {
    console.error('[MAILER] Brevo SMTP FAILED:', error.message);
  } else {
    console.log('[MAILER] Brevo SMTP ready on port 465 ✓');
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  const info = await transporter.sendMail({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
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
  console.log('[MAILER] OTP sent to:', toEmail, '| ID:', info.messageId);
  return info;
};

const sendPasswordChangedEmail = async (toEmail) => {
  const info = await transporter.sendMail({
    from: `"FleetFly" <${process.env.BREVO_FROM}>`,
    to: toEmail,
    subject: 'FleetFly — Password Changed',
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
  return info;
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail };
