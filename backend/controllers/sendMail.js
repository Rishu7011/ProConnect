import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to, otp) {
  const info = await transporter.sendMail({
    from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 2 minutes.`,
    html: `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 2 minutes.</p>`,
  });

  console.log("OTP email sent:", info.messageId);
}
