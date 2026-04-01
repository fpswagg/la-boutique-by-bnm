"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Banner() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-full" aria-hidden="true">
        <div className="h-14" />
        <div className="w-full bg-[var(--surface)]" style={{ height: "clamp(7rem, 30vw, 44rem)" }} />
      </div>
    );
  }

  const logo = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <div className="w-full" aria-hidden="true">
      {/* Navbar clearance — transparent strip so the logo sits below the navbar */}
      <div className="h-14" />

      {/* Logo — fills full width via cover, square image crops symmetrically to center the logo text */}
      <div
        className="w-full overflow-hidden relative"
        style={{ height: "clamp(7rem, 30vw, 44rem)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            filter: "contrast(1.1)",
          }}
        />
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }} />
      </div>
    </div>
  );
}
