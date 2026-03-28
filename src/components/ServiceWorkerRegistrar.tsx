"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/woertl/sw.js", { scope: "/woertl/" })
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
