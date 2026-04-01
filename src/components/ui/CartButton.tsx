"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartButtonProps {
  productId: string;
  label: string;
  addedLabel: string;
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
}

export function CartButton({
  productId,
  label,
  addedLabel,
  variant = "primary",
  size = "md",
}: CartButtonProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(productId);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const base =
    "flex items-center gap-2 font-medium uppercase transition-all duration-200 border";
  const sizeClass = size === "sm"
    ? "px-3 py-2 text-xs tracking-wider"
    : "px-5 py-3 text-sm tracking-widest";
  const primary =
    "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] hover:opacity-80 active:scale-95";
  const secondary =
    "bg-transparent text-[var(--fg)] border-[var(--border)] hover:border-[var(--fg)] active:scale-95";

  return (
    <button
      onClick={handleAdd}
      className={`${base} ${sizeClass} ${variant === "primary" ? primary : secondary}`}
      aria-label={label}
    >
      <AnimatePresence mode="wait">
        {justAdded || inCart ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <Check size={16} />
            {addedLabel}
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
