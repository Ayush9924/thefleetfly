const nodemailer = require('nodemailer');

const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      console.error('[MAILER] Gmail connection FAILED:', error.message);
    } else {
      console.log('[MAILER] Gmail SMTP ready to send emails ✓');
    }
  });
}

const sendOTPEmail = async (toEmail, otp) => {
  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Missing email credentials: set GMAIL_USER/GMAIL_APP_PASSWORD (or SMTP_USER/SMTP_PASS)');
  }

  const mailOptions = {
    from: `"FleetFly" <${gmailUser}>`,
    to: toEmail,
    subject: 'Your FleetFly OTP Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="margin:0 0 16px;color:#1d4ed8;">FleetFly - OTP Verification</h2>
        <p style="margin:0 0 12px;color:#111827;">Use this one-time password to continue:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:12px 16px;background:#eff6ff;border-radius:8px;text-align:center;color:#1d4ed8;">
          ${otp}
        </div>
        <p style="margin:16px 0 8px;color:#374151;">Valid for 10 minutes.</p>
        <p style="margin:0;color:#6b7280;">Did not request this? Ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[MAILER] OTP sent to:', toEmail, '| MessageID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MAILER] Send failed:', error.message);
    throw error;
  }
};

const sendPasswordChangedEmail = async (toEmail) => {
  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Missing email credentials: set GMAIL_USER/GMAIL_APP_PASSWORD (or SMTP_USER/SMTP_PASS)');
  }

  const mailOptions = {
    from: `"FleetFly" <${gmailUser}>`,
    to: toEmail,
    subject: 'FleetFly - Password Changed',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="margin:0 0 16px;color:#047857;">Password Changed</h2>
        <p style="margin:0 0 8px;color:#111827;">Your FleetFly password was successfully updated.</p>
        <p style="margin:0;color:#6b7280;">If you did not do this, contact support immediately.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[MAILER] Password changed email sent to:', toEmail, '| MessageID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MAILER] Password changed email failed:', error.message);
    throw error;
  }
};

const testMailer = async () => {
  try {
    await transporter.verify();
    console.log('[MAILER] Gmail SMTP ready to send emails ✓');
    return true;
  } catch (error) {
    console.error('[MAILER] Gmail connection FAILED:', error.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail, testMailer };
