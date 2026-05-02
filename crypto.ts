import CryptoJS from 'crypto-js';

const SECRET_KEY = CryptoJS.enc.Utf8.parse("TracNghiemOnlineSecretKey1234567");
const SECRET_IV = CryptoJS.enc.Utf8.parse("TracNghiemOnl_IV");

export const decryptData = (encryptedBase64: string): any => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, SECRET_KEY, {
            iv: SECRET_IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Decryption failed", error);
        throw new Error("Lỗi giải mã dữ liệu");
    }
};
