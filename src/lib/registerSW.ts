export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/woertl/sw.js", { scope: "/woertl/" })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }
}
