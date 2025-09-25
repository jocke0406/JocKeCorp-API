import { Router } from "express";
import usersRoutes from "./users.routes.js";
import authRoutes from "./auth.routes.js";

const api = Router();
api.use("/users", usersRoutes);
api.use("/auth", authRoutes);
export default api;
