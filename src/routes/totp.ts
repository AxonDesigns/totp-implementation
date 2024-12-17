import { Router } from "express";
import { generateTotpSecretForUser, generateTotpCodeForUser } from "@/handlers/totp";

const router = Router();

router.post(
  "/generate-secret",
  generateTotpSecretForUser
);

router.post(
  "/generate-code",
  generateTotpCodeForUser
);

export default router;
