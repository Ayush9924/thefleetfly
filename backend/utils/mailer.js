const nodemailer = require('nodemailer');

// ─── Transporter ────────────────────────────────────────────────────────────
// Lazily created so env vars are guaranteed to be loaded first.
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // TLS via STARTTLS (port 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,  // Gmail App Password (16-char string from .env)
      },
    });
  }
  return transporter;
};

// ─── Send OTP Email ──────────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"FleetFly" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset OTP - FleetFly',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background: #f4f6fb; font-family: Arial, sans-serif; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
              color: white; padding: 32px 24px; text-align: center;
            }
            .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
            .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
            .body { padding: 32px 24px; }
            .otp-box {
              font-size: 36px; font-weight: bold; color: #2563eb;
              letter-spacing: 12px; text-align: center;
              margin: 28px 0; padding: 18px;
              background: #eef2ff; border-radius: 8px;
              border: 2px dashed #a5b4fc;
            }
            .note { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #7c3aed; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>🚛 FleetFly</h1>
              <p>Fleet Management System</p>
            </div>
            <div class="body">
              <p>Hello <strong>${name || 'User'}</strong>,</p>
              <p>We received a request to reset your password. Use the OTP below to continue:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>⏰ This OTP is valid for 10 minutes only.</strong></p>
              <div class="note">
                🔒 <strong>Security Tips:</strong><br>
                • Never share this OTP with anyone<br>
                • FleetFly will never ask for your OTP by phone or email<br>
                • If you did not request this, ignore this email safely
              </div>
              <p>Best regards,<br><strong>FleetFly Team</strong></p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} FleetFly · Sent from ${process.env.SMTP_USER}</div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ OTP email sent via Nodemailer:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};

// ─── Send Password Changed Confirmation Email ────────────────────────────────
const sendPasswordChangedEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"FleetFly" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - FleetFly',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background: #f4f6fb; font-family: Arial, sans-serif; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white; padding: 32px 24px; text-align: center;
            }
            .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
            .body { padding: 32px 24px; }
            .success-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; color: #065f46; font-weight: bold; font-size: 16px; }
            .alert { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #92400e; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>🚛 FleetFly</h1>
            </div>
            <div class="body">
              <p>Hello <strong>${name || 'User'}</strong>,</p>
              <div class="success-box">✅ Your password has been changed successfully!</div>
              <div class="alert">
                ⚠️ <strong>Didn't do this?</strong><br>
                If you didn't request a password change, please contact our support team immediately and secure your account.
              </div>
              <p><strong>Security best practices:</strong></p>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Log out from shared or public devices</li>
              </ul>
              <p>Best regards,<br><strong>FleetFly Team</strong></p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} FleetFly · Sent from ${process.env.SMTP_USER}</div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Password changed email sent via Nodemailer:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password changed email:', error.message);
    return false;
  }
};

// ─── Quick connection test (call once at startup if needed) ──────────────────
const testMailer = async () => {
  try {
    await getTransporter().verify();
    console.log('✅ Nodemailer SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Nodemailer SMTP verification failed:', error.message);
    console.error('   → Check SMTP_USER and SMTP_PASS in your .env file');
    return false;
  }
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail, testMailer };
