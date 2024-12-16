import "dotenv/config";
import { decrypt, encrypt, generateSecret, generateTOTP, verifyTOTP } from "./lib/totp";

const secret = generateSecret();

console.log("secret", secret);

const encrypted = encrypt("Hello World, beautiful world!!", secret, "16");

console.log("encrypted", encrypted);

const decrypted = decrypt(encrypted, secret, "16");

console.log("decrypted", decrypted);

const otp = generateTOTP(secret);

console.log("token", otp);

console.log("verify", verifyTOTP(otp, secret));