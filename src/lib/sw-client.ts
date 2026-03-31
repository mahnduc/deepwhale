// lib/sw-client.ts
export const registerDeepWhaleSW = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/deepwhale/sw.js", {
        scope: "/deepwhale/",
      });
      console.log("DeepWhale Service Worker Ready:", registration.scope);
    } catch (error) {
      console.error("SW Registration Failed:", error);
    }
  }
};