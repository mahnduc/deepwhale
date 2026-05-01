// lib/pin/auth-setup.ts
import { deriveKeyFromPin } from "./crypto-utils";

export async function setupNewPin(pin: string) {
  // Tạo Salt ngẫu nhiên (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  // Tạo Master Key từ PIN và Salt
  const masterKey = await deriveKeyFromPin(pin, salt);
  // Tạo một vật chứng (Verifier) để kiểm tra sau này
  const verifierText = new TextEncoder().encode("auth_verified_ok");
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector cho AES-GCM
  
  const encryptedVerifier = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    masterKey,
    verifierText
  );

  localStorage.setItem("app_salt", btoa(String.fromCharCode(...salt)));
  localStorage.setItem("app_iv", btoa(String.fromCharCode(...iv)));
  localStorage.setItem("app_verifier", btoa(String.fromCharCode(...new Uint8Array(encryptedVerifier))));
  
  console.log("Thiết lập mã PIN thành công!");
}