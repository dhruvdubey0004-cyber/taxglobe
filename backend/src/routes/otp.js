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
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"TaxGlobe" <${process.env.SMTP_EMAIL}>`,
          to: email,
          subject: 'Your TaxGlobe Verification OTP',
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
              <h2 style="color: #111827; margin-bottom: 8px;">TaxGlobe Verification</h2>
              <p style="color: #6b7280; font-size: 14px;">Use the OTP below to verify your email address:</p>
              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #059669;">${otp}</span>
              </div>
              <p style="color: #9ca3af; font-size: 12px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            </div>
          `,
        });

        console.log(`✅ OTP email sent to ${email}`);
      } catch (mailErr) {
        console.warn('⚠️ Email send failed, falling back to console:', mailErr.message);
        console.log(`📧 OTP for ${email}: ${otp}`);
      }
    } else {
      // No SMTP configured — log OTP to console for development
      console.log(`\n📧 ===== DEV MODE OTP (SMTP NOT CONFIGURED) =====`);
      console.log(`   Email: ${email}`);
      console.log(`   OTP:   ${otp}`);
      console.log(`   Tip:   Add SMTP_EMAIL and SMTP_PASSWORD to backend/.env to send real emails`);
      console.log(`   ===============================================\n`);
    }

    res.json({
      success: true,
      message: smtpConfigured ? 'OTP sent to your email successfully' : 'OTP generated (Dev Mode)',
      devOtp: !smtpConfigured ? otp : undefined,
    });
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

    // Delete used OTP
    await OTP.deleteMany({ email: email.toLowerCase() });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
