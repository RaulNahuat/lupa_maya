import CryptoJS from "crypto-js";

// Clave interna para descifrado offline
const SYNC_SECRET = "lupa_maya_offline_sync_key_2026_sec";

/**
 * Cifra el payload de sincronización para transferencias cliente-servidor.
 */
export function encryptSyncPayload(data) {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, SYNC_SECRET).toString();
  } catch {
    return null;
  }
}

/**
 * Descifra el payload de sincronización proveniente del servidor.
 */
export function decryptSyncPayload(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SYNC_SECRET);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) return null;
    return JSON.parse(decryptedStr);
  } catch {
    return null;
  }
}
