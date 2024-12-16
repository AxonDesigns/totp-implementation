import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRouter from "@/routes/users";
import loginRouter from "@/routes/login";
import logoutRouter from "@/routes/logout";
import sessionRouter from "@/routes/session";
import { getUserFromToken } from "./lib/utils";
import { db } from "./db/database";
import { usersTable } from "./db/schema/users";
import { eq } from "drizzle-orm";
import { decrypt, encrypt, generateSecret, generateTOTP } from "./lib/totp";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
    origin: (process.env.TRUSTED_ORIGINS ?? "*").split(",").map(origin => origin.trim()),
    credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.disable('x-powered-by');

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/session", sessionRouter);
app.use("/api/users", usersRouter);
app.get("/api/generate-totp-secret", async (req, res) => {
    const user = getUserFromToken(req);
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
});

app.get("/api/generate-totp-code", async (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        res.status(401).json({ errors: ["Unauthorized"] });
        return;
    }

    const [{ totpToken: encryptedToken }] = await db.select({
        totpToken: usersTable.totpToken
    }).from(usersTable).where(eq(usersTable.id, user.id));

    if (!encryptedToken) {
        res.status(500).json({ message: "Error creating TOTP code" });
        return;
    }

    const decryptedToken = decrypt(
        encryptedToken,
        process.env.TOTP_ENCRYPTION_KEY as string,
        process.env.TOTP_ENCRYPTION_IV as string,
        process.env.TOTP_ENCRYPTION_METHOD as string
    );

    res.json({ code: generateTOTP(decryptedToken) });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});