import nodemailer from "nodemailer";

const sendMail = async (receiver, otp, forgotPassword = false) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.G_PASSWORD,
      },
    });
    if (forgotPassword) {
      return await transporter.sendMail({
        from: process.env.GMAIL,
        to: receiver,
        subject: "Reset Password.",
        text: "DrawL, An request to reset password was created for this account.",
        html: `    <div style="text-align: center; padding: 20px;">
                <h1>DrawL, Reset Password</h1>
                <p>Here is your OTP: <strong>${otp}</strong></p>
                <p>If you did not request for changing password then <strong>ignore this email</strong></p>
            </div>`,
      });
    }
    await transporter.sendMail({
      from: process.env.GMAIL,
      to: receiver,
      subject: "Greetings ✔",
      text: "Welcome to DrawL!",
      html: `    <div style="text-align: center; padding: 20px;">
            <h1>Welcome to DrawL!</h1>
            <p>Here is your OTP: <strong>${otp}</strong></p>
        </div>`,
    });
  } catch (error) {
    console.log(error.message);
    throw new Error("Email not sent");
  }
};

export { sendMail };
