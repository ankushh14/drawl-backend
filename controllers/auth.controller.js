import userModel from "../models/user.model.js";
import { googleTokenValidate } from "../middlewares/login.validate.js";
import { validatePassword } from "../middlewares/password.validate.js";
import { generateToken, verifyToken } from "../middlewares/auth.token.js";
import { generatePassword } from "../middlewares/password.validate.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/nodemailer.js";
import otpModel from "../models/otp.model.js";
import crypto from "crypto";
import ms from "ms";

const userRegister = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill out all fields", valid: false });
    }
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ message: "User already exists", valid: false });
    }
    const hashedPassword = await generatePassword(password);
    const OTP = generateOtp();
    const firstName = fullname.split(" ")[0];
    let profile = `https://api.dicebear.com/7.x/personas/svg?seed=${firstName}`;
    await new otpModel({
      email,
      OTP,
      fullname,
      password: hashedPassword,
      profile,
    }).save();
    await sendMail(email, OTP);
    return res
      .status(200)
      .json({ message: "An otp is sent to your account", valid: true });
  } catch (error) {
    console.log(error.message)
    return res
      .status(500)
      .json({ message: "Please try again after some time.", valid: false });
  }
};

const oauthRegister = async(req,res,next)=>{
  try {
    const { fullname,email } = req.body
    if(!fullname || !email){
      return res
      .status(400)
      .json({ message: "Bad request.", valid: false });
    }
    const exists = await userModel.findOne({ email });
      if (exists) {
        return res
          .status(400)
          .json({ message: "User already exists", valid: false });
      }
    const password = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await generatePassword(password);
    const firstName = fullname.split(" ")[0];
    const profile = `https://api.dicebear.com/7.x/personas/svg?seed=${firstName}`
    const user = await new userModel({
      email:email,
      password:hashedPassword,
      fullname:fullname,
      profile:profile,
    }).save();
    req.userId = user._id;
    return next();
  } catch (error) {
    console.log(error.message)
    return res
      .status(500)
      .json({ message: "Please try again after some time.", valid: false });
  }
}

const userLogin = async (req, res, next) => {
  try {
    if (req.body.googleAuthToken) {
      try {
        const { googleAuthToken } = req.body;
        const userId = await googleTokenValidate(googleAuthToken);
        req.userId = userId;
        return next();
      } catch (error) {
        return res.status(401).json({ message: error.message, valid: false });
      }
    } else {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", valid: false });
      }
      const validate = await validatePassword(password, user.password);
      if (!validate) {
        return res
          .status(401)
          .json({ message: "Invalid Password", valid: false });
      }
      req.userId = user._id;
      return next();
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const setToken = async (req, res) => {
  try {
    const { userId } = req;
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", valid: false });
    }
    const accessToken = await generateToken(
      user._id,
      access_token_secret,
      process.env.ACCESS_TOKEN_LIFE
    );
    const refreshToken = await generateToken(
      user._id,
      refresh_token_secret,
      process.env.REFRESH_TOKEN_LIFE
    );
    await userModel.findByIdAndUpdate(user._id, { token: refreshToken });
    const authenticatedUser = {
      fullname: user.fullname,
      email: user.email,
      profile: user.profile,
      ID: user._id,
    };
    res.cookie("nmh", refreshToken, {
      httpOnly: true,
      signed: true,
      secure: true,
      expires: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_LIFE)),
      sameSite: "Strict",
    });
    const expiresAt = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_LIFE));
    return res.status(200).json({
      message: "login succesfull!",
      authenticatedUser,
      token: accessToken,
      expiresAt,
      valid:true
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const OTP = await otpModel.findOne({ OTP: otp });
    if (!OTP) {
      return res.status(404).json({ message: "Invalid OTP", valid: false });
    }
    const { email, password, fullname, profile } = OTP;
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ message: "User already exists", valid: false });
    }
    const user = await new userModel({
      email,
      password,
      fullname,
      profile,
    }).save();
    req.userId = user._id;
    return next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Please try again after one minute", valid: false });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { nmh } = req.signedCookies;
    if (!nmh) {
      return res.status(401).json({ message: "Unauthorized", valid: false });
    }
    const refreshTokenAvailable = await userModel.findOne({ token: nmh });
    if (!refreshTokenAvailable) {
      res.clearCookie("nmh", {
        httpOnly: true,
        signed: true,
      });
      return res.status(401).json({ message: "Unauthorized", valid: false });
    }
    const decodedToken = await verifyToken(
      nmh,
      process.env.REFRESH_TOKEN_SECRET
    );
    const userId = decodedToken.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      res.clearCookie("nmh", {
        httpOnly: true,
        signed: true,
      });
      return res.status(401).json({ message: "Unauthorized", valid: false });
    }
    const authenticatedUser = {
      fullname: user.fullname,
      email: user.email,
      profile: user.profile,
      ID: user._id,
    };
    const accessToken = await generateToken(
      user._id,
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );
    const expiresAt = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_LIFE));
    return res.status(200).json({
      message: "refresh succesful!",
      authenticatedUser,
      token: accessToken,
      expiresAt,
      valid: true,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Internal Server Error`, valid: false });
  }
};

const userLogout = async (req, res) => {
  try {
    const { nmh } = req.signedCookies;
    if (!nmh) {
      return res.status(401).json({ message: "Unauthorized", valid: false });
    }
    const decodedToken = await verifyToken(
      nmh,
      process.env.REFRESH_TOKEN_SECRET
    );
    const { userId } = decodedToken;
    await userModel.findByIdAndUpdate(userId, { $set: { token: "" } });
    res.clearCookie("nmh", {
      httpOnly: true,
      signed: true,
    });
    return res.status(200).json({ message: "Logout Succesfull!", valid: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill out all fields", valid: false });
    }
    const exists = await userModel.findOne({ email });
    if (!exists) {
      return res.status(404).json({ message: "User not found", valid: false });
    }
    const hashedPassword = await generatePassword(password);
    const OTP = generateOtp();
    await new otpModel({
      email,
      OTP,
      password: hashedPassword,
    }).save();
    await sendMail(email, OTP,true);
    return res
      .status(200)
      .json({ message: "An otp is sent to your account", valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Please try again after some time.", valid: false });
  }
};

const forgotPasswordOTPVerify = async(req,res) =>{
  try {
    const { otp } = req.body;
    const OTP = await otpModel.findOne({ OTP: otp });
    if (!OTP) {
      return res.status(404).json({ message: "Invalid OTP", valid: false });
    }
    const { email, password } = OTP;
    await userModel.findOneAndUpdate(
      { email: email },
      { $set: { password: password} }
    );
    return res
      .status(200)
      .json({ message: "Password updated!!", valid: true });

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Please try again after one minute", valid: false });
  }
}

export {
  userLogin,
  setToken,
  userRegister,
  verifyOtp,
  userLogout,
  refreshAccessToken,
  forgotPassword,
  forgotPasswordOTPVerify,
  oauthRegister
};
