import { getUserFromToken } from "@/handlers/session";
import { Router } from "express";

const router = Router();

router.get(
  "/",
  getUserFromToken
);

export default router;