const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_A9M2Fjk8_5Qsv4gaYtN8RHreK5GUBv22n');
const FROM_EMAIL = 'onboarding@resend.dev'; // Free tier accounts must send from onboarding@resend.dev

/**
 * Core helper to dispatch emails using the Resend SDK.
 */
const sendResendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `EcoSync <${FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: html
    });

    if (error) {
      console.error('Resend SDK Error:', error);
      throw new Error(error.message || 'Resend SDK returned an error.');
    }

    console.log(`Email successfully dispatched via Resend SDK to ${to}. Message ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`Failed to send email via Resend SDK to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Sends OTP verification email
 */
const sendOtp = async (email, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <tr>
            <td style="background-color: #065f46; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">EcoSync</h1>
              <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">Smart E-Waste Recycling</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; line-height: 1.6;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 700;">Verify Your Email Address</h2>
              <p style="color: #64748b; font-size: 15px; margin: 15px 0 25px 0;">Thank you for registering on EcoSync. Please use the following 6-digit One-Time Password (OTP) to verify your email address. This verification code is valid for <strong>5 minutes</strong>:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; font-size: 32px; font-weight: 800; color: #065f46; background-color: #ecfdf5; padding: 15px 35px; border-radius: 12px; letter-spacing: 6px; border: 2px dashed #a7f3d0; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin: 25px 0 0 0; text-align: center; font-style: italic;">If you did not initiate this registration request, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is an automated security message. Please do not reply directly to this email.</p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 5px 0 0 0;">© ${new Date().getFullYear()} EcoSync Hub. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendOtpResend(email, otp, htmlContent);
};

const sendOtpResend = async (email, otp, htmlContent) => {
  await sendResendEmail(email, 'EcoSync Email Verification OTP', htmlContent);
};

/**
 * Sends a welcome email after verification succeeds
 */
const sendWelcomeEmail = async (email, firstName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EcoSync</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <tr>
            <td style="background-color: #065f46; padding: 35px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px;">Welcome, ${firstName}!</h1>
              <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">Your Account is Verified</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; line-height: 1.6;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 700;">Join the Green Revolution</h2>
              <p style="color: #475569; font-size: 15px;">Thank you for registering with EcoSync. We are thrilled to have you join our community in making electronic recycling smart, safe, and highly rewarding!</p>
              
              <p style="color: #475569; font-size: 15px; margin-bottom: 20px;">With the EcoSync portal, you can now:</p>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 30px; font-size: 18px;">📱</td>
                  <td style="padding: 8px 0; color: #475569; font-size: 14px;"><strong>AI Diagnostics:</strong> Instantly scan and estimate device condition & values.</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 30px; font-size: 18px;">📦</td>
                  <td style="padding: 8px 0; color: #475569; font-size: 14px;"><strong>Defect Pickups:</strong> Submit electronic waste details and request scheduled home pickups.</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top; width: 30px; font-size: 18px;">🌲</td>
                  <td style="padding: 8px 0; color: #475569; font-size: 14px;"><strong>Carbon Stats:</strong> Check your positive carbon offsets and metallic recovery indices.</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ewaste-frontend-4jyx.onrender.com/login" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2); transition: all 0.2s;">
                  Access User Dashboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Together, let's protect the environment from hazardous heavy metals.</p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 5px 0 0 0;">© ${new Date().getFullYear()} EcoSync Hub. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendResendEmail(email, 'Welcome to EcoSync - Smart E-Waste Management', htmlContent);
};

/**
 * Sends an OTP for password resets
 */
const sendPasswordResetOtp = async (email, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <tr>
            <td style="background-color: #b91c1c; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">EcoSync Security</h1>
              <p style="color: #fca5a5; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; line-height: 1.6;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 700;">Reset Your Password</h2>
              <p style="color: #64748b; font-size: 15px; margin: 15px 0 25px 0;">We received a request to reset your account password. Please use the following 6-digit verification code to complete the process. This security code is valid for <strong>5 minutes</strong>:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; font-size: 32px; font-weight: 800; color: #b91c1c; background-color: #fef2f2; padding: 15px 35px; border-radius: 12px; letter-spacing: 6px; border: 2px dashed #fca5a5; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin: 25px 0 0 0; text-align: center; font-style: italic;">If you did not make this request, your password will remain secure and you can ignore this alert.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is a security alert. Please do not forward this code to anyone.</p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 5px 0 0 0;">© ${new Date().getFullYear()} EcoSync Hub. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendResendEmail(email, 'EcoSync Password Reset OTP Request', htmlContent);
};

/**
 * Sends pickup scheduled verification email
 */
const sendPickupScheduled = async (email, deviceType, date, time, adminNotes) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Pickup Scheduled</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #eef2f6;">
          <h2 style="color: #065f46; margin-top: 0;">Pickup Scheduled!</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p>Your pickup request for the <strong>${deviceType}</strong> has been successfully scheduled.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-left: 5px solid #059669; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>Scheduled Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Scheduled Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Instructions:</strong> ${adminNotes || 'Please keep the electronic device packaged and accessible.'}</p>
          </div>
          <p>A designated pickup agent will contact you shortly prior to arrival.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Thank you for recycling with EcoSync!</p>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail(email, 'EcoSync Pickup Scheduled', htmlContent);
};

/**
 * Sends Alert: Better Images Required
 */
const sendBetterImagesRequired = async (email, deviceType) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Better Images Required</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #eef2f6;">
          <h2 style="color: #b91c1c; margin-top: 0;">Better Images Required</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p>Our administrators reviewed your pickup request for the <strong>${deviceType}</strong> but need more detailed photographs to assess its condition.</p>
          <p>Please log in to your dashboard and upload clearer, well-lit images of the device to resume the approval process.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">EcoSync E-Waste Verification Division</p>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail(email, 'EcoSync Request Alert: Better Images Required', htmlContent);
};

/**
 * Sends Tracking Status Updates
 */
const sendTrackingStatusUpdate = async (email, deviceType, requestId, status) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>E-Waste Tracking Update</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #eef2f6;">
          <h2 style="color: #065f46; margin-top: 0;">E-Waste Tracking Update</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p>Hello,</p>
          <p>The collection and recycling status for your electronic device under request <strong>#${requestId}</strong> has been updated.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 5px solid #0f766e; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Device Type:</strong> ${deviceType}</p>
            <p style="margin: 10px 0; font-size: 18px; color: #0f766e; font-weight: bold; text-transform: uppercase;">
              Status: ${status}
            </p>
          </div>
          <p>You can track real-time logistics logs and carbon offset statistics directly on your user dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Thank you for contributing to a sustainable future!</p>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail(email, `EcoSync Tracking Update: Request #${requestId} is now ${status}`, htmlContent);
};

module.exports = {
  sendOtp,
  sendWelcomeEmail,
  sendPasswordResetOtp,
  sendPickupScheduled,
  sendBetterImagesRequired,
  sendTrackingStatusUpdate
};
