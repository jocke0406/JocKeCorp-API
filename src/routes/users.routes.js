import { Router } from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";

const r = Router();
r.post("/", createUser); // create (hash argon2)
r.get("/", listUsers); // list (sans hash)
r.get("/:id", getUserById); // read
r.patch("/:id", updateUser); // update
r.delete("/:id", deleteUser); // delete
export default r;
