import { db } from "@/db/database";
import { usersTable } from "@/db/schema/users";
import { decrypt, encrypt, generateSecret, generateTOTP } from "@/lib/totp";
import { getUserFromRequest } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

export async function generateTotpSecretForUser(req: Request, res: Response) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            res.status(401).json({ errors: ["Unauthorized"] });
            return;
        }

        const secret = generateSecret();

        const [{ token }] = await db.update(usersTable).set({
            totpToken: encrypt(
                secret,
                process.env.TOTP_ENCRYPTION_KEY as string,
                process.env.TOTP_ENCRYPTION_IV as string,
                process.env.TOTP_ENCRYPTION_METHOD as string
            ),
            totpEnabled: true
        }).where(eq(usersTable.id, user.id)).returning({
            token: usersTable.totpToken
        });

        if (!token) {
            res.status(500).json({ message: "Error creating TOTP token" });
            return;
        }

        res.json({ totp_token: secret });
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};

export async function generateTotpCodeForUser(req: Request, res: Response) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            res.status(401).json({ errors: ["Unauthorized"] });
            return;
        }

        const [{ totpToken: encryptedToken }] = await db.select({
            totpToken: usersTable.totpToken
        }).from(usersTable).where(eq(usersTable.id, user.id));

        if (!encryptedToken) {
            res.status(500).json({ errors: ["Could'nt retrieve token"] });
            return;
        }

        const decryptedToken = decrypt(
            encryptedToken,
            process.env.TOTP_ENCRYPTION_KEY as string,
            process.env.TOTP_ENCRYPTION_IV as string,
            process.env.TOTP_ENCRYPTION_METHOD as string
        );

        res.json({ code: generateTOTP(decryptedToken) });
    } catch (error) {
        res.status(500).json({ errors: ["An error occurred"] });
    }
};