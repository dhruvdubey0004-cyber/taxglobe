const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const OTP = require('../models/otp');

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// POST /api/otp/send — Send OTP to email
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await new OTP({ email: email.toLowerCase(), otp }).save();

    const smtpConfigured = Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);

    // Try sending email via nodemailer if SMTP is configured
    if (smtpConfigured) {
      try {
        const nodemailer = require('nodemailer');
        const transportOpts = (process.env.SMTP_HOST && process.env.SMTP_PORT) ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        } : {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        };

        const transporter = nodemailer.createTransport(transportOpts);

        await transporter.sendMail({
          from: `"TaxGlobe" <${process.env.SMTP_EMAIL}>`,
          to: email,
          subject: 'Your TaxGlobe Verification OTP',
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-bottom: 8px;">TaxGlobe Email Verification</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Use the 6-digit OTP below to verify your email address and continue your cross-border tax setup:</p>
              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #059669;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 13px;">This OTP is valid for <strong>5 minutes</strong>.</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">If you did not request this, please ignore this email.</p>
            </div>
          `,
        });

        console.log(`✅ OTP email sent to ${email}`);
        return res.json({
          success: true,
          message: 'OTP sent to your email successfully. Please check your inbox.',
        });
      } catch (mailErr) {
        console.error('⚠️ Nodemailer send failed:', mailErr.message);
        return res.status(500).json({
          success: false,
          message: `Failed to deliver OTP to email: ${mailErr.message}`,
        });
      }
    } else {
      // No SMTP configured
      console.warn(`\n⚠️ SMTP NOT CONFIGURED: SMTP_EMAIL and SMTP_PASSWORD are not set in environment variables.`);
      console.log(`   Email: ${email} | OTP: ${otp}\n`);

      const isDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
      if (isDev) {
        return res.json({
          success: true,
          message: 'OTP generated (Dev Mode: SMTP not configured)',
          devOtp: otp,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'SMTP credentials missing on server. Please add SMTP_EMAIL and SMTP_PASSWORD in Vercel settings.',
      });
    }
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/otp/verify — Verify the OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const record = await OTP.findOne({ email: email.toLowerCase(), otp });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Don't delete OTP here — let the register route delete it after account creation
    // This way the OTP stays valid for the final registration step

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
