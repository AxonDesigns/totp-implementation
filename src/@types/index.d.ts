interface GenerateTOTPOptions {
    algorithm?: string,
    digits?: number,
    period?: number,
    offset?: number
}

interface VerifyTOTPOptions {
    tolerance?: number,
    algorithm?: string,
    digits?: number,
    period?: number
}