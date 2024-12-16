import { login } from "@/handlers/login";
import { Router } from "express";
import { body } from "express-validator";


const router = Router();

const handlePutEmailBody = () => body("email").notEmpty().withMessage("email is required").isEmail().withMessage("email is invalid").trim();
const handlePutPasswordBody = () => body("password").notEmpty().withMessage("password is required").isString().withMessage("password must be a string").trim();

router.post(
  "/",
  handlePutEmailBody(),
  handlePutPasswordBody(),
  login
);

export default router;