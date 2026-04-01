"use client";

import { Heart } from "lucide-react";
import { useLikes } from "@/context/LikesContext";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
  productId: string;
  label?: string;
  size?: "sm" | "md";
}

export function LikeButton({ productId, label, size = "md" }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLikes();
  const liked = isLiked(productId);
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(productId);
      }}
      aria-label={label ?? (liked ? "Unlike" : "Like")}
      className={`group flex items-center gap-1.5 transition-all duration-200 ${
        size === "sm" ? "p-1.5" : "p-2"
      } rounded-full hover:scale-110 active:scale-95`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={liked ? "liked" : "not-liked"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            size={iconSize}
            className={`transition-colors duration-200 ${
              liked
                ? "fill-[var(--fg)] stroke-[var(--fg)]"
                : "stroke-[var(--fg)] fill-transparent group-hover:fill-[var(--fg)]/20"
            }`}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
