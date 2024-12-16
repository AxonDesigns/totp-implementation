import { createHmac, randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";

export function bufferToBase32(buffer: Buffer, padding = true): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let base32 = '';

    // Convert buffer to binary string
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }

    // Process each 5-bit group and map to base32 alphabet
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substring(i, i + 5).padEnd(5, '0');
        const index = parseInt(chunk, 2);
        base32 += alphabet[index];
    }

    // Ensure the string length is a multiple of 8 by padding with '='
    if (padding) {
        while (base32.length % 8 !== 0) {
            base32 += '=';
        }
    }

    return base32;
}

function leftPad(str: string, len: number, ch: string): string {
    len = len - str.length + 1;
    return Array(len).join(ch) + str;
}

function base32ToHex(base32: string): string {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";

    for (let i = 0; i < base32.length; i++) {
        const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftPad(val.toString(2), 5, "0");
    }

    for (let i = 0; i + 4 <= bits.length; i += 4) {
        const chunk = bits.substring(i, i + 4);
        hex += parseInt(chunk, 2).toString(16);
    }

    return hex;
}

export function generateTOTP(
    secret: string,
    {
        algorithm = "sha1",
        digits = 6,
        period = 30,
        offset = 0,
    }: GenerateTOTPOptions = {}
): string {
    const timeCounter = Math.floor(Date.now() / 1000 / period) + offset;
    const hexCounter = leftPad(timeCounter.toString(16), 16, "0");

    const decodedSecret = Buffer.from(base32ToHex(secret), "hex");
    const hmac = createHmac(algorithm, decodedSecret)
        .update(Buffer.from(hexCounter, "hex"))
        .digest();

    const offsetByte = hmac[hmac.length - 1] & 0xf;
    const binaryCode =
        ((hmac[offsetByte] & 0x7f) << 24) |
        ((hmac[offsetByte + 1] & 0xff) << 16) |
        ((hmac[offsetByte + 2] & 0xff) << 8) |
        (hmac[offsetByte + 3] & 0xff);

    const otp = binaryCode % Math.pow(10, digits);

    return leftPad(otp.toString(), digits, "0");
}

export function verifyTOTP(
    userToken: string,
    secret: string,
    {
        tolerance = 1,
        algorithm = "sha1",
        digits = 6,
        period = 30
    }: VerifyTOTPOptions = {}
): boolean {
    const currentToken = generateTOTP(secret, { algorithm, digits, period });

    // If userToken matches the currentToken, return true
    if (userToken === currentToken) return true;

    // If a tolerance is set (for clock drift or slight time mismatches),
    // generate tokens for the previous and next intervals.
    for (let i = 1; i <= tolerance; i++) {
        if (
            userToken ===
            generateTOTP(secret, { algorithm, digits, period, offset: i }) ||
            userToken ===
            generateTOTP(secret, { algorithm, digits, period, offset: -i })
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Generates a random base32 string with a given length.
 * @param {number} length - The length of the string to generate. defaults to 32
 * @returns {string} The generated base32 string.
 */
export function generateSecret(length: number = 32): string {
    const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = randomBytes(Math.ceil((length * 5) / 8));
    let base32String = '';
    let buffer = 0;
    let bitsLeft = 0;

    for (let byte of bytes) {
        buffer = (buffer << 8) | byte;
        bitsLeft += 8;

        while (bitsLeft >= 5) {
            const index = (buffer >> (bitsLeft - 5)) & 31;
            base32String += BASE32_CHARS[index];
            bitsLeft -= 5;
        }
    }

    if (bitsLeft > 0) {
        const index = (buffer << (5 - bitsLeft)) & 31;
        base32String += BASE32_CHARS[index];
    }

    return base32String.slice(0, length);
}

export function encrypt(data: string, secret: string, iv: string, method = "aes-256-cbc") {
    const key = createHash('sha512')
        .update(secret)
        .digest('hex')
        .substring(0, 32)
    const encryptionIV = createHash('sha512')
        .update(iv)
        .digest('hex')
        .substring(0, 16)

    const cipher = createCipheriv(method, key, encryptionIV);
    return Buffer.from(
        cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64')
}

// Decrypt data
export function decrypt(encryptedData: string, secret: string, iv: string, method = "aes-256-cbc") {
    const key = createHash('sha512')
        .update(secret)
        .digest('hex')
        .substring(0, 32)
    const encryptionIV = createHash('sha512')
        .update(iv)
        .digest('hex')
        .substring(0, 16)

    const buff = Buffer.from(encryptedData, 'base64')
    const decipher = createDecipheriv(method, key, encryptionIV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}