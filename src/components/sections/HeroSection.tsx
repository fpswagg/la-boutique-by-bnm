"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n";

interface HeroSectionProps {
  dict: Dictionary;
  locale: string;
}

export function HeroSection({ dict, locale }: HeroSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl"
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-[var(--fg)]" />
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)]">
            {dict.home.hero_eyebrow}
          </p>
        </div>

        {/* Tagline */}
        <h1 className="font-display leading-none tracking-wider text-[clamp(3rem,8vw,6rem)] mb-6">
          {dict.home.hero_tag}
        </h1>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[var(--muted)] text-base md:text-lg leading-relaxed mb-8"
        >
          {dict.home.hero_body}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium tracking-widest uppercase hover:opacity-80 active:scale-95 transition-all duration-200"
          >
            {dict.home.hero_cta}
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
