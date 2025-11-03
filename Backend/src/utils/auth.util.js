import crypto from "crypto"

export const generateState = async() => {
    return crypto.randomBytes(32).toString("hex")
}

// generate a nonce value to prevent reply attacks
export const genearteNonce = () => {
    return crypto.randomBytes(32).toString("hex")
}