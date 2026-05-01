// lib/pin/crypto-utils.ts

/**
 * Biến mã PIN thành một Master Key thông qua thuật toán PBKDF2
 */
export async function deriveKeyFromPin(pin: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  
  // Nhập mã PIN thô
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Chạy PBKDF2 để tạo khóa AES 256-bit
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      // Ép kiểu salt.buffer về ArrayBuffer để khớp với định nghĩa BufferSource
      salt: salt.buffer as ArrayBuffer, 
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}