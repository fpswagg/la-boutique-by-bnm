"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

interface ContactChatProps {
  dict: Dictionary;
  whatsappUrl: string;
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.35, duration: 0.4, ease: "easeOut" },
  }),
};

export function ContactChat({ dict, whatsappUrl }: ContactChatProps) {
  const bubbles = [
    dict.contact.bubble_1,
    dict.contact.bubble_2,
    dict.contact.bubble_3,
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Incoming bubbles */}
      <div className="flex flex-col gap-3">
        {bubbles.map((text, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={bubbleVariants}
            className="flex items-end gap-3 max-w-[85%]"
          >
            {/* Avatar icon — only on first bubble */}
            {i === 0 ? (
              <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <span className="font-display text-xs">LB</span>
              </div>
            ) : (
              <div className="w-8 shrink-0" />
            )}

            <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm">
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Typing indicator while loading CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="flex items-end gap-3 max-w-[85%]"
      >
        <div className="w-8 shrink-0" />
        <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Reply bubble — our CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.9, duration: 0.4 }}
        className="flex justify-end"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-[var(--accent)] text-white px-6 py-4 rounded-2xl rounded-br-sm hover:opacity-90 active:scale-95 transition-all font-medium tracking-wide text-sm"
        >
          <MessageCircle size={20} />
          {dict.contact.whatsapp_cta}
        </a>
      </motion.div>

      {/* Decorative divider label */}
      <p className="text-center text-xs text-[var(--muted)] tracking-widest uppercase mt-4">
        WhatsApp · Yaoundé, Cameroun
      </p>
    </div>
  );
}
