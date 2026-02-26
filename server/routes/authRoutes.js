import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// On utilise les fonctions exportées de authController.js
router.post("/register", register);
router.post("/login", login);

export default router;
