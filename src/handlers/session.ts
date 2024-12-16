import { Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const getUserFromToken = async (req: Request, res: Response) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({ errors: ["Unauthorized"] });
    return;
  }

  try {
    const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    res.json(payload);
  } catch (error) {
    res.clearCookie("access_token");
    res.status(500).json({ errors: ["Token is invalid"] });
  }
}