import CryptoJS from "crypto-js";
import process from "process";

const SYNC_SECRET = process.env.SYNC_ENCRYPTION_KEY || "lupa_maya_offline_sync_key_2026_sec";

/**
 * Cifra el payload de sincronización para evitar la exposición de lo datos
 */
export function encryptSyncPayload(data) {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, SYNC_SECRET).toString();
  } catch (error) {
    console.error("Error al cifrar payload de sincronización:", error);
    return null;
  }
}

/**
 * Descifra el payload de sincronización.
 */
export function decryptSyncPayload(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SYNC_SECRET);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) return null;
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Error al descifrar payload de sincronización:", error);
    return null;
  }
}
