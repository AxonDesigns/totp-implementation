import "dotenv/config";
import { Request } from "express";
import { verify } from "jsonwebtoken";

export const getUserFromToken = (req: Request) => {
    const accessToken = (
        req.cookies.access_token || (req.headers.authorization?.split(" ")[1])
    ) as string | undefined;

    if (!accessToken) {
        return null;
    }

    try {
        const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
        return payload as { id: string, name: string, email: string, totpEnabled: boolean };
    } catch (error) {
        return null;
    }
}
