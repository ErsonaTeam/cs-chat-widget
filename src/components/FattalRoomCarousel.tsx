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
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
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
      const newScrollLeft =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
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
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {rooms.map((room) => (
            <FattalRoomCard key={room.roomCode} room={room} onSelect={onSelectRoom} lang={lang} />
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
