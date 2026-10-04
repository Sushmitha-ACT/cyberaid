import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Use user-provided SMTP
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
    console.log('[Email] Configured custom SMTP server.');
  } else {
    // Generate a test Ethereal account if no SMTP provided
    console.log('[Email] No SMTP config found. Generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Ethereal test account ready: ${testAccount.user}`);
  }

  return transporter;
}

export async function sendOTP(to: string, otp: string) {
  const mailer = await getTransporter();
  const from = process.env.SMTP_FROM || '"CyberAid Security" <noreply@cyberaid.app>';

  const info = await mailer.sendMail({
    from,
    to,
    subject: 'CyberAid: Password Reset Verification Code',
    text: `Your password reset verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this reset, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d1117; color: #ffffff; border-radius: 8px;">
        <h2 style="color: #3b82f6; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">We received a request to reset the password for your CyberAid account. Your verification code is:</p>
        <div style="background-color: #1f2937; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #60a5fa; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">This code will expire in 10 minutes. If you did not request this, please safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #374151; margin: 30px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; ${new Date().getFullYear()} CyberAid Security.</p>
      </div>
    `,
  });

  console.log(`[Email] Message sent: ${info.messageId}`);
  
  // Ethereal provides a URL to view the sent email in the browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Ethereal Preview URL: ${previewUrl}`);
  }

  return previewUrl || true;
}
