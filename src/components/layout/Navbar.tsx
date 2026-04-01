"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "../../../middleware";

interface NavbarProps {
  dict: Dictionary;
  locale: Locale;
}

export function Navbar({ dict, locale }: NavbarProps) {
  const pathname = usePathname();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 20);
      setHidden(current > lastScrollY.current && current > 80);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== `/${locale}` && pathname.startsWith(href));

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo text */}
        <Link
          href={`/${locale}`}
          className="font-display text-xl tracking-wider uppercase hover:opacity-70 transition-opacity"
        >
          LB<span className="text-[var(--muted)]">·</span>BNM
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium tracking-widest uppercase transition-all duration-200 relative
                  after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-[var(--fg)]
                  after:transition-all after:duration-300 hover:after:w-full
                  ${isActive(link.href) ? "after:w-full" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <Link
            href={`/${locale}/cart`}
            className="relative p-2 hover:opacity-70 transition-opacity"
            aria-label={dict.nav.cart}
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--fg)] text-[var(--bg)] text-[10px] font-bold">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 hover:opacity-70 transition-opacity"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-[var(--border)] bg-[var(--bg)]"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block text-base font-medium tracking-widest uppercase transition-opacity hover:opacity-60 ${
                      isActive(link.href) ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
