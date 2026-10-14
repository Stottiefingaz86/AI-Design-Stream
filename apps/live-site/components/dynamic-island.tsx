"use client";

import { IconSearch, IconHeart, IconClock } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export type DynamicIslandProps = {
  onSearchClick?: () => void;
  onFavoriteClick?: () => void;
  className?: string;
  isSearchActive?: boolean;
  isFavoriteActive?: boolean;
  showBetHistory?: boolean;
};

export default function DynamicIsland({
  onSearchClick,
  onFavoriteClick,
  className = "",
  isSearchActive = false,
  isFavoriteActive = false,
  showBetHistory = false,
}: DynamicIslandProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling down, hide when scrolling up or at top (opposite of quick links)
      if (currentScrollY < 10) {
        // Hide at top
        setIsVisible(false);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Show when scrolling down (after 50px)
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Hide when scrolling up
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.3
          }}
          className={cn(
            "fixed z-[100] left-1/2",
            className
          )}
          style={{
            bottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            margin: 0,
            padding: 0
          }}
        >
          <div className="flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-full bg-popover/60 backdrop-blur-2xl border border-white/20 shadow-2xl">
            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full transition-colors relative",
                isSearchActive 
                  ? "bg-primary active:bg-primary/80" 
                  : "bg-white/5 hover:bg-white/10 active:bg-primary"
              )}
              aria-label="Search"
            >
              <IconSearch className="w-4 h-4 text-white relative z-10" strokeWidth={2} />
            </button>

            {/* Favorites/Bet History Button */}
            <button
              onClick={onFavoriteClick}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full transition-colors relative",
                isFavoriteActive
                  ? showBetHistory 
                    ? "bg-primary/20 hover:bg-primary/30 active:bg-primary/40"
                    : "bg-pink-500/20 hover:bg-pink-500/30 active:bg-pink-500/40"
                  : "bg-white/5 hover:bg-white/10 active:bg-white/15"
              )}
              aria-label={showBetHistory ? "Bet History" : "Favorites"}
            >
              {showBetHistory ? (
                <IconClock 
                  className={cn(
                    "w-4 h-4 relative z-10 transition-colors",
                    isFavoriteActive ? "text-primary" : "text-white"
                  )}
                  strokeWidth={2} 
                />
              ) : (
                <IconHeart 
                  className={cn(
                    "w-4 h-4 relative z-10 transition-colors",
                    isFavoriteActive ? "text-pink-500 fill-pink-500" : "text-white"
                  )}
                  strokeWidth={2} 
                />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
