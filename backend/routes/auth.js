const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpStore = require('../models/OtpStore');
const Notification = require('../models/Notification');
const { sendOtp, sendWelcomeEmail } = require('../services/emailService');
const { protect } = require('../middleware/auth');

// Generate 6-digit random code
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * REGISTER
 */
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, address, pincode } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      pincode,
      enabled: false,
      emailVerified: false
    });
    await user.save();

    // Generate OTP
    const otpCode = generateOtpCode();
    await OtpStore.deleteMany({ email }); // clear previous
    const otp = new OtpStore({ email, otp: otpCode, purpose: 'REGISTRATION' });
    await otp.save();

    // Send email asynchronously
    sendOtp(email, otpCode);

    return res.status(201).json({ message: 'User registered successfully. Please verify email OTP.' });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * VERIFY OTP
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OtpStore.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid OTP or expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.enabled = true;
    user.emailVerified = true;
    await user.save();

    // Clear verification OTP
    await OtpStore.deleteMany({ email });

    // Send Welcome Email
    sendWelcomeEmail(email, user.firstName);

    // Save Notifications
    const n1 = new Notification({
      user: user._id,
      title: 'Email Verified',
      message: 'Your email address has been successfully verified.'
    });
    await n1.save();

    const n2 = new Notification({
      user: user._id,
      title: 'Welcome Email Sent',
      message: 'Welcome to EcoSync! We are thrilled to have you join us.'
    });
    await n2.save();

    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('OTP Verification Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * RESEND OTP
 */
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.enabled) {
      return res.status(400).json({ message: 'Account is already verified and active' });
    }

    // Check resend cooldown throttling (60 seconds)
    const latestOtp = await OtpStore.findOne({ email }).sort({ createdAt: -1 });
    if (latestOtp) {
      const differenceSeconds = Math.floor((Date.now() - latestOtp.createdAt.getTime()) / 1000);
      if (differenceSeconds < 60) {
        return res.status(400).json({ 
          message: `Please wait ${60 - differenceSeconds} seconds before requesting a new OTP.` 
        });
      }
    }

    const otpCode = generateOtpCode();
    await OtpStore.deleteMany({ email });
    const otp = new OtpStore({ email, otp: otpCode, purpose: 'REGISTRATION' });
    await otp.save();

    sendOtp(email, otpCode);

    return res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('OTP Resend Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * LOGIN
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check active
    if (!user.enabled) {
      return res.status(400).json({ message: 'Account is inactive. Please verify email OTP first.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'ecocollect-super-secret-jwt-key-2025-change-in-production-min-256bits',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        pincode: user.pincode,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET PROFILE
 */
router.get('/profile', protect, async (req, res) => {
  return res.status(200).json(req.user);
});

/**
 * UPDATE PROFILE
 */
router.put('/profile', protect, async (req, res) => {
  const { firstName, lastName, phone, address, pincode } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.pincode = pincode || user.pincode;

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
