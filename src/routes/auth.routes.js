// src/routes/auth.routes.js
import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,resendVerify
} from "../controllers/auth.controller.js";

const r = Router();
r.post("/register", register);
r.post("/login", login);
r.post("/forgot-password", forgotPassword);
r.post("/reset-password", resetPassword);
r.get("/verify-email", verifyEmail);
r.post("/resend-verify", resendVerify);

export default r;
