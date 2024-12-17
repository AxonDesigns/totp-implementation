import { Router } from "express";
import loginRouter from "@/routes/login";
import logoutRouter from "@/routes/logout";
import sessionRouter from "@/routes/session";
import totpRouter from "@/routes/totp";
import { protectedRoute } from "@/middlewares/protectedRoute";

const router = Router();

router.use("/login", loginRouter);
router.use("/logout", protectedRoute, logoutRouter);
router.use("/me", protectedRoute, sessionRouter);
router.use("/totp", protectedRoute, totpRouter);

export default router;
