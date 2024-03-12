import { Router } from "express";
import {
  forgotPassword,
  forgotPasswordOTPVerify,
  oauthRegister,
  refreshAccessToken,
  setToken,
  userLogin,
  userLogout,
  userRegister,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { validateUser } from "../middlewares/user.validate.js";

const authRouter = Router();

authRouter.post("/login", userLogin, setToken);

authRouter.post("/register", userRegister);
authRouter.post("/verify", verifyOtp, setToken);
authRouter.post("/oauth", oauthRegister, setToken);

authRouter.post("/logout", validateUser, userLogout);

authRouter.post("/forgotpassword", forgotPassword);
authRouter.post("/verifyforgotpassword", forgotPasswordOTPVerify);

authRouter.post("/refresh", refreshAccessToken);

export default authRouter;
