import { AES, enc } from "crypto-js";

let encryptionKey: any = import.meta.env.VITE_ENCRYPTION_SECRET_KEY

export const encrypt = (_stringToEncrypt: any) => {
    return AES.encrypt(_stringToEncrypt, encryptionKey).toString()
}

export const decrypt = (_encryptedString: any) => {
    return AES.decrypt(_encryptedString, encryptionKey).toString(enc.Utf8)
}