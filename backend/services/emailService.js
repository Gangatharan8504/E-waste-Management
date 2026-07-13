const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME || 'gangatharan949@gmail.com',
      pass: process.env.MAIL_PASSWORD || 'oqpwimlnwrllkscn'
    }
  });
};

const sendOtp = async (email, otp) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EcoCollect Support" <${process.env.MAIL_USERNAME || 'gangatharan949@gmail.com'}>`,
      to: email,
      subject: 'EcoCollect Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #2b7a78; text-align: center;">EcoCollect Verification</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p>Hello,</p>
          <p>Thank you for registering on EcoCollect. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 5 minutes:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; color: #17252a; background-color: #def2f1; padding: 15px; margin: 20px 0; letter-spacing: 5px; border-radius: 3px;">
            ${otp}
          </div>
          <p>If you did not initiate this request, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message. Please do not reply directly.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending OTP Email:', error.message);
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EcoCollect Support" <${process.env.MAIL_USERNAME || 'gangatharan949@gmail.com'}>`,
      to: email,
      subject: 'Welcome to EcoCollect - Smart E-Waste Management',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #2b7a78; text-align: center;">Welcome, ${firstName}!</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p>Thank you for joining our mission to build a sustainable, eco-friendly future. Your registration is complete and your email has been successfully verified!</p>
          <p>With EcoCollect, you can:</p>
          <ul>
            <li>Instantly verify device recyclability using our advanced AI Vision scanner.</li>
            <li>Submit defective electronic devices for pickups.</li>
            <li>Receive fair value estimates for your reusable items.</li>
            <li>Earn points and trace your carbon footprint reduction statistics.</li>
          </ul>
          <p>Start today by submitting your first pickup request on our portal!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888; text-align: center;">Together, let's recycle electronic waste responsibly.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Welcome Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending Welcome Email:', error.message);
  }
};

const sendPickupScheduled = async (email, deviceType, date, time, adminNotes) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EcoCollect Support" <${process.env.MAIL_USERNAME || 'gangatharan949@gmail.com'}>`,
      to: email,
      subject: 'EcoCollect Pickup Scheduled',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #2b7a78; text-align: center;">Pickup Scheduled!</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p>Your pickup request for the <strong>${deviceType}</strong> has been processed and scheduled.</p>
          <div style="background-color: #f7f9fa; padding: 15px; border-left: 5px solid #2b7a78; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Scheduled Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Scheduled Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Instructions:</strong> ${adminNotes || 'Please keep the electronic device packaged and accessible.'}</p>
          </div>
          <p>Our designated pickup agent will contact you shortly prior to arrival.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888; text-align: center;">Thank you for recycling with EcoCollect!</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Pickup schedule confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending Pickup Schedule Email:', error.message);
  }
};

const sendBetterImagesRequired = async (email, deviceType) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EcoCollect Support" <${process.env.MAIL_USERNAME || 'gangatharan949@gmail.com'}>`,
      to: email,
      subject: 'EcoCollect Request Alert: Better Images Required',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #d9534f; text-align: center;">Better Images Required</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p>Our administrators reviewed your pickup request for the <strong>${deviceType}</strong> but need more detailed photographs to assess its condition.</p>
          <p>Please log in to your dashboard and upload clearer, well-lit images of the device to resume the approval process.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888; text-align: center;">EcoCollect E-Waste Verification Division</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Better images alert email sent to ${email}`);
  } catch (error) {
    console.error('Error sending Better Images Alert Email:', error.message);
  }
};

const sendTrackingStatusUpdate = async (email, deviceType, requestId, status) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EcoCollect Support" <${process.env.MAIL_USERNAME || 'gangatharan949@gmail.com'}>`,
      to: email,
      subject: `EcoCollect Tracking Update: Request #${requestId} is now ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #2b7a78; text-align: center;">E-Waste Tracking Update</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p>Hello,</p>
          <p>The collection and recycling status for your electronic device under request <strong>#${requestId}</strong> has been updated.</p>
          
          <div style="background-color: #f7f9fa; padding: 15px; border-left: 5px solid #2b7a78; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Device Type:</strong> ${deviceType}</p>
            <p style="margin: 10px 0; font-size: 18px; color: #2b7a78; font-weight: bold; text-transform: uppercase;">
              Status: ${status}
            </p>
          </div>
          
          <p>You can track real-time logistics logs and carbon offset statistics directly on your user dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888; text-align: center;">Thank you for contributing to a sustainable future!</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Tracking status update email sent to ${email} for status ${status}`);
  } catch (error) {
    console.error('Error sending Tracking Update Email:', error.message);
  }
};

module.exports = { sendOtp, sendWelcomeEmail, sendPickupScheduled, sendBetterImagesRequired, sendTrackingStatusUpdate };
