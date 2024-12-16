import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.json({ message: "Logged out successfully" });
}