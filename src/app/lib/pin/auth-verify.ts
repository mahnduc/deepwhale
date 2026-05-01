// lib/pin/auth-verify.ts
import { deriveKeyFromPin } from "./crypto-utils";

export async function verifyPin(pin: string): Promise<{ success: boolean; key?: CryptoKey }> {
  try {
    const salt = new Uint8Array(atob(localStorage.getItem("app_salt")!).split("").map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(localStorage.getItem("app_iv")!).split("").map(c => c.charCodeAt(0)));
    const verifier = new Uint8Array(atob(localStorage.getItem("app_verifier")!).split("").map(c => c.charCodeAt(0)));

    const candidateKey = await deriveKeyFromPin(pin, salt);

    // Thử giải mã Verifier
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      candidateKey,
      verifier
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);

    // Kiểm tra kết quả
    if (decryptedText === "auth_verified_ok") {
      return { success: true, key: candidateKey };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Sai mã PIN hoặc lỗi xác thực");
    return { success: false };
  }
}