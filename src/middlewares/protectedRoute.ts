import { getUserFromRequest } from "@/lib/utils";
import { NextFunction, Request, Response } from "express";

export const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromRequest(req);
    if (!user) {
        res.status(401).json({ errors: ["unauthorized"] })
        return;
    }

    next();
}