import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRouter from "@/routes/users";
import authRouter from "@/routes/auth";
import { getUserFromRequest as getUserFromSession, tryParseInt } from "./lib/utils";

const PORT = tryParseInt(process.env.PORT) || 3000;
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
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
