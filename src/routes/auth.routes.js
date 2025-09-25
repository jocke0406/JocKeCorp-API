import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const r = Router();
r.post("/register", register); // alias de POST /users
r.post("/login", login); // vérifie le hash
export default r;
