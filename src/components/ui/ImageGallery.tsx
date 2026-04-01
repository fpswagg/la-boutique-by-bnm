"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const prev = () => go((active - 1 + images.length) % images.length);
  const next = () => go((active + 1) % images.length);

  const variants = {
    enter: (d: number) => ({ x: d * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -60, opacity: 0 }),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${alt} — image ${active + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={active === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--bg)]/80 backdrop-blur-sm border border-[var(--border)] hover:bg-[var(--bg)] transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--bg)]/80 backdrop-blur-sm border border-[var(--border)] hover:bg-[var(--bg)] transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-[var(--fg)]" : "w-1.5 bg-[var(--fg)]/40"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`relative shrink-0 w-16 h-16 overflow-hidden border transition-all duration-200 ${
                i === active
                  ? "border-[var(--fg)] opacity-100"
                  : "border-[var(--border)] opacity-50 hover:opacity-75"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
