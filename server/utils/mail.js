import nodemailer from "nodemailer";
import ENV from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: ENV.OTP_EMAIL,
    pass: ENV.OTP_EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (to, otp) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .otp-box {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          border: 2px solid #16a34a;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .otp-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 700;
          color: #16a34a;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
          margin: 10px 0;
          user-select: all;
          cursor: pointer;
        }
        .expiration {
          font-size: 13px;
          color: #ef4444;
          margin-top: 15px;
          font-weight: 500;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
        }
        .security-note {
          font-size: 12px;
          color: #6b7280;
          margin-top: 20px;
          padding: 12px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          text-align: left;
          border-radius: 4px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ QuickEats</h1>
        </div>
        <div class="content">
          <p class="message">
            Your OTP verification code is ready. Use this code to Reset Your Password.
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your OTP Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiration">⏱️ Expires in 15 minutes</div>
          </div>

          <div class="security-note">
            ⚠️ <strong>Security Note:</strong> Never share this code with anyone. QuickEats team will never ask for your OTP.
          </div>
        </div>
        <div class="footer">
          <p>© 2025 QuickEats. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: ENV.OTP_EMAIL,
    to,
    subject: "🔐 Reset Password - OTP Code",
    html: htmlTemplate,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Could not send OTP email");
  }
};
