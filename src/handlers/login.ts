import "dotenv/config";
import { db } from "@/db/database";
import { usersTable } from "@/db/schema/users";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { sign } from "jsonwebtoken";
import { userSelectFields } from "./users";

export const login = async (req: Request, res: Response) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    res.status(400).json({ errors: results.array().map((err) => err.msg) });
    return;
  }
  const { email, password } = matchedData(req) as { email: string, password: string };

  const foundUser = await db.select(userSelectFields)
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (foundUser.length === 0) {
    res.status(400).json({ errors: ["User not found"] });
    return;
  }

  if (!(await compare(password, foundUser[0].password))) {
    res.status(400).json({ errors: ["Invalid password"] });
    return;
  }

  const { password: _, ...payload } = foundUser[0];

  const accessToken = sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1h",
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    maxAge: 3600000,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.json(payload);
}