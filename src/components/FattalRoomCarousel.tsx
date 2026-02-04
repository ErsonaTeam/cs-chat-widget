"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import FattalRoomCard from "./FattalRoomCard";
import { FattalRoom } from "@/types/message-types";
import { Language, t, getLanguageConfig } from "@/utils/i18n";

interface FattalRoomCarouselProps {
  rooms: FattalRoom[];
  onSelectRoom: (room: FattalRoom) => void;
  lang?: Language;
}

export default function FattalRoomCarousel({ rooms, onSelectRoom, lang = 'HE' }: FattalRoomCarouselProps) {
  const langConfig = getLanguageConfig(lang);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll <= 0) {
        // No scrollable content
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      
      // Get computed style to check direction
      const computedDir = window.getComputedStyle(container).direction;
      const isRTL = computedDir === 'rtl';
      
      // Get the actual scroll position - handle RTL variations across browsers
      const scrollLeft = container.scrollLeft;
      
      if (isRTL) {
        // In RTL: Chrome uses negative values, Firefox/Safari use positive
        // At "start" (rightmost visually): scrollLeft is 0 (Chrome) or maxScroll (Firefox)
        // At "end" (leftmost visually): scrollLeft is -maxScroll (Chrome) or 0 (Firefox)
        
        if (scrollLeft <= 0) {
          // Chrome/Edge behavior (negative scrollLeft)
          const absScroll = Math.abs(scrollLeft);
          setCanScrollRight(absScroll > 5); // Can go back to start
          setCanScrollLeft(absScroll < maxScroll - 5); // Can go forward
        } else {
          // Firefox/Safari behavior (positive scrollLeft)
          setCanScrollRight(scrollLeft < maxScroll - 5); // Can go back to start
          setCanScrollLeft(scrollLeft > 5); // Can go forward
        }
      } else {
        // LTR is straightforward
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < maxScroll - 5);
      }
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
  }, [rooms]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      // Use negative for left, positive for right - browser handles RTL automatically
      const delta = direction === "left" ? -scrollAmount : scrollAmount;

      container.scrollBy({
        left: delta,
        behavior: "smooth",
      });
    }
  };

  if (rooms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      dir={langConfig.dir}
      className="relative w-full mb-4"
    >
      {/* Carousel Header */}
      <div className="mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-700">
          {t(lang, 'availableRooms')} ({rooms.length})
        </h3>
      </div>

      {/* Carousel Container */}
      <div className="relative group/carousel">
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 ${
            langConfig.dir === 'rtl' ? 'pr-3 pl-8' : 'pl-3 pr-8'
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {rooms.map((room) => (
            <FattalRoomCard key={room.roomCode} room={room} onSelect={onSelectRoom} lang={lang} />
          ))}
        </div>

        {/* Left Scroll Button - hidden when hovering over cards, visible on button hover */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-fattalNavy shadow-lg rounded-full p-2.5 transition-all duration-200 opacity-70 group-hover/carousel:opacity-0 hover:!opacity-100 hover:bg-fattalNavy/90"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Scroll Button - hidden when hovering over cards, visible on button hover */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-fattalNavy shadow-lg rounded-full p-2.5 transition-all duration-200 opacity-70 group-hover/carousel:opacity-0 hover:!opacity-100 hover:bg-fattalNavy/90"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
