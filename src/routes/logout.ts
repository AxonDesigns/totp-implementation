import { login } from "@/handlers/login";
import { logout } from "@/handlers/logout";
import { Router } from "express";
import { body } from "express-validator";


const router = Router();

router.post(
  "/",
  logout
);

export default router;