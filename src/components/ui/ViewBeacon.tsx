"use client";

import { useEffect } from "react";

/** Counts one product page view in SSS (once per product per browser session). */
export function ViewBeacon({ productId, locale }: { productId: string; locale: string }) {
  useEffect(() => {
    const key = `lb_seen_${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode: count anyway
    }
    const body = JSON.stringify({ id: productId, locale });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/view", new Blob([body], { type: "application/json" }));
    else fetch("/api/view", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  }, [productId, locale]);
  return null;
}
