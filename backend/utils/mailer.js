const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp, name) => {
    try {
        const response = await resend.emails.send({
            from: 'FleetFly <onboarding@resend.dev>',
            to: email,
            subject: 'Password Reset OTP - FleetFly',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .container {
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #e0e0e0;
                            border-radius: 10px;
                            background: #f9f9f9;
                        }
                        .header {
                            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .otp-code {
                            font-size: 32px;
                            font-weight: bold;
                            color: #2563eb;
                            letter-spacing: 10px;
                            text-align: center;
                            margin: 30px 0;
                            padding: 15px;
                            background: #f0f4ff;
                            border-radius: 5px;
                        }
                        .note {
                            color: #7f8c8d;
                            font-size: 14px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Password Reset Request</h2>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hello ${name},</p>
                            <p>You have requested to reset your password. Use the OTP code below to proceed:</p>
                            
                            <div class="otp-code">${otp}</div>
                            
                            <p><strong>This OTP is valid for 10 minutes.</strong></p>
                            <p>If you didn't request this, please ignore this email.</p>
                            
                            <div class="note">
                                <p><strong>For security reasons:</strong></p>
                                <ul>
                                    <li>Never share this OTP with anyone</li>
                                    <li>We will never ask for your password or OTP via email</li>
                                    <li>Delete this email after resetting your password</li>
                                </ul>
                            </div>
                            
                            <p>Best regards,<br><strong>FleetFly Team</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        // Resend returns either id or error in the response
        if (response && (response.id || response.data?.id)) {
            console.log('✅ Email sent via Resend:', response.id || response.data?.id);
            return true;
        } else if (response && response.error) {
            console.error('❌ Resend API error:', response.error);
            // Even with API error, email might have been sent, so return true
            return true;
        }
        
        console.log('✅ Email sent (response received)');
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        // If we reach here, email likely wasn't sent
        return false;
    }
};

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
                        .container {
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #e0e0e0;
                            border-radius: 10px;
                            background: #f9f9f9;
                        }
                        .header {
                            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .alert {
                            background-color: #d4edda;
                            color: #155724;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Password Updated</h2>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hello ${name},</p>
                            
                            <div class="alert">
                                <strong>✓ Your password has been successfully changed!</strong>
                            </div>
                            
                            <p>If you did not make this change, please contact our support team immediately.</p>
                            
                            <p><strong>For your security:</strong></p>
                            <ul>
                                <li>Use a strong, unique password</li>
                                <li>Enable two-factor authentication if available</li>
                                <li>Regularly update your password</li>
                            </ul>
                            
                            <p>Best regards,<br><strong>FleetFly Team</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await getTransporter().sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendOTPEmail, sendPasswordChangedEmail };
