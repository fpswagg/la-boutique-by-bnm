"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface LikesContextValue {
  liked: Set<string>;
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
  likedIds: string[];
}

const LikesContext = createContext<LikesContextValue | null>(null);

const STORAGE_KEY = "lb_likes";

export function LikesProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLiked(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(liked)));
  }, [liked, hydrated]);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isLiked = useCallback((id: string) => liked.has(id), [liked]);
  const likedIds = Array.from(liked);

  return (
    <LikesContext.Provider value={{ liked, toggleLike, isLiked, likedIds }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes(): LikesContextValue {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used inside LikesProvider");
  return ctx;
}
