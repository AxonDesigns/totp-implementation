import { createUser, deleteUser, getUserById, getUsers, updateUser } from "@/handlers/users";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

const handleLimitQuery = () => query("limit").optional().isInt().withMessage("limit must be a number");
const handleOffsetQuery = () => query("offset").optional().isInt().withMessage("offset must be a number");
const handlePostNameBody = () => body("name").notEmpty().withMessage("name is required");
const handlePostEmailBody = () => body("email").notEmpty().withMessage("email is required")
  .isEmail().withMessage("email is invalid");
const handlePostPasswordBody = () => body("password").notEmpty().withMessage("password is required")
  .isLength({ min: 8 }).withMessage("password must be at least 8 characters long");

const handlePutNameBody = () => body("name").optional().isString().withMessage("name must be a string");
const handlePutEmailBody = () => body("email").optional().isEmail().withMessage("email is invalid");
const handlePutPasswordBody = () => body("password").optional().isString().withMessage("password must be a string");

const handleIdParam = () => param("id").notEmpty().withMessage("id is required");

router.get("/",
  handleLimitQuery(),
  handleOffsetQuery(),
  getUsers
);

router.post("/",
  handlePostNameBody().trim(),
  handlePostEmailBody().trim(),
  handlePostPasswordBody().trim(),
  createUser
);

router.get("/:id",
  handleIdParam(),
  getUserById
);

router.put("/:id",
  handleIdParam(),
  handlePutNameBody().trim(),
  handlePutEmailBody().trim(),
  handlePutPasswordBody().trim(),
  updateUser
);

router.delete("/:id",
  handleIdParam(),
  deleteUser
);

export default router;