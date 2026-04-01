"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { LikesProvider } from "@/context/LikesContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <CartProvider>
        <LikesProvider>{children}</LikesProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
