const nodemailer = require('nodemailer');

/**
 * Configure and get nodemailer transporter.
 * Supports:
 * - Direct SMTP (host, port, secure, auth)
 * - Gmail Service (service: 'gmail', user, pass)
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const service = process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE;

  if (!user || !pass) {
    return null;
  }

  // If using Gmail or defined service
  if (service || (!host && user.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: service || 'gmail',
      auth: { user, pass }
    });
  }

  // Standard SMTP
  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send password reset email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.resetUrl - Full reset link
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('\n======================================================');
    console.warn('[MAILER WARNING] No SMTP / Email credentials configured in environment variables.');
    console.warn(`[MAILER] Generated Password Reset Link for ${to}:`);
    console.warn(resetUrl);
    console.warn('======================================================\n');
    return {
      sent: false,
      reason: 'NO_SMTP_CONFIGURED',
      resetUrl
    };
  }

  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@eduadmin.portal';
  const appName = process.env.APP_NAME || 'EduAdmin Portal';

  const mailOptions = {
    from: `"${appName}" <${fromEmail}>`,
    to,
    subject: 'Password Reset Request - EduAdmin Portal',
    text: `Hello ${name || 'Student'},\n\nYou recently requested to reset your password for EduAdmin Portal.\n\nPlease reset your password by clicking the following link:\n${resetUrl}\n\nThis link is valid for 1 hour.\nIf you did not request this, you can safely ignore this email.\n\nBest regards,\nEduAdmin Support Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
            <div style="display: inline-block; background: #3b82f6; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 24px; color: #ffffff; margin-bottom: 12px;">
              🎓
            </div>
            <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 6px; font-weight: 700; letter-spacing: -0.02em;">
              EduAdmin Portal
            </h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Password Reset Verification</p>
          </div>
          
          <div style="padding: 32px 28px;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
              Hello ${name || 'User'},
            </h2>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset the password for your account (<strong>${to}</strong>). Click the button below to choose a new password:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                Reset My Password
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
              ⏱️ <strong>This reset link will expire in 1 hour</strong> for your security.
            </p>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
              If you didn't request a password reset, you can safely ignore this email. Your existing password will remain unchanged.
            </p>

            <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
              <p style="margin-bottom: 6px;">If the button above does not work, copy and paste this URL into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6; margin: 0;">${resetUrl}</p>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} EduAdmin Portal. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[MAILER] Password reset email sent to ${to}. MessageId: ${info.messageId}`);
  return {
    sent: true,
    messageId: info.messageId
  };
};

module.exports = {
  sendPasswordResetEmail,
  getTransporter
};
