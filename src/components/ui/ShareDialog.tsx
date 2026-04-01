"use client";

import { Share2, X, Copy, Check, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Dictionary } from "@/lib/i18n";

interface ShareDialogProps {
  dict: Dictionary;
  title?: string;
  /** "ghost" = transparent border button (inline use); "floating" = solid inverted button (fixed/floating use) */
  variant?: "ghost" | "floating";
}

export function ShareDialog({ dict, title, variant = "ghost" }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "La Boutique by BNM", url });
        return;
      } catch {
        // fallback to dialog
      }
    }
    setOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        aria-label={dict.share.title}
        className={
          variant === "floating"
            ? "flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-widest uppercase bg-[var(--fg)] text-[var(--bg)] shadow-[0_4px_24px_rgba(0,0,0,0.18)] hover:opacity-80 active:scale-95 transition-all duration-200"
            : "flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-widest uppercase border border-[var(--border)] hover:border-[var(--fg)] transition-all duration-200 active:scale-95"
        }
      >
        <Share2 size={16} />
        {dict.share.title}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-6 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] z-[70] bg-[var(--bg)] border border-[var(--border)] p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl tracking-wide">
                  {dict.share.title}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:opacity-60 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>

              {/* URL display */}
              <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] mb-4">
                <LinkIcon size={14} className="text-[var(--muted)] shrink-0" />
                <p className="text-sm text-[var(--muted)] truncate flex-1">{url}</p>
              </div>

              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium tracking-widest uppercase transition-all hover:opacity-80 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    {dict.share.copied}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {dict.share.copy}
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
