import User from "@/models/userModels";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
export const sendEmail = async ({
  email,
  emailType,
  userId,
}: {
  email: string;
  emailType: string;
  userId: string;
}) => {
  try {
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);
    //TODO: configure mail for usage
    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          verifyToken: hashedToken,
          verifyTokenExpiry: Date.now() + 3600000, //!----- Expiry 1 hour -------//
        },
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: Date.now() + 3600000, //!----- Expiry 1 hour -------//
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: "dc8d5bfdbc4898", //🚩
        pass: "688d06816ecb11", //🏴‍☠️
      },
    });
    const mailOption = {
      from: "abdullahalnomancse@gmail.com", // sender address
      to: email, // list of receivers
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password", // Subject line
      html: `<p>Click <a href='${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}'>here</a> to ${
        emailType === "RESET" ? "Verify your email" : "Reset your password"
      } </br> or copy and past the link below in your browser.</br>${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}</p>`, // html body
    };
    const mailResponse = await transporter.sendMail(mailOption);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error);
  }
};
