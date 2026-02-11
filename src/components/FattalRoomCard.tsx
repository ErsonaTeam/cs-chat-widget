"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FattalRoom } from "@/types/message-types";
import { Language, t, formatPrice, getLanguageConfig } from "@/utils/i18n";

interface FattalRoomCardProps {
  room: FattalRoom;
  onSelect: (room: FattalRoom) => void;
  lang?: Language;
}

export default function FattalRoomCard({ room, onSelect, lang = 'HE' }: FattalRoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const langConfig = getLanguageConfig(lang);

  // Use gallery if available, otherwise fallback to single imageUrl
  const images = room.gallery?.length
    ? room.gallery
    : [{ url: room.imageUrl, description: null }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      dir={langConfig.dir}
      className="bg-white rounded-xl shadow-md overflow-hidden min-w-[280px] max-w-[320px] border border-fattalNavy/10"
    >
      {/* Room Image Carousel */}
      <div className="relative h-40 bg-fattalCream">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || room.name}
          fill
          className="object-cover"
          sizes="320px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Room';
          }}
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-fattalNavy/60 hover:bg-fattalNavy/80 text-white rounded-full p-1.5 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-fattalNavy/60 hover:bg-fattalNavy/80 text-white rounded-full p-1.5 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
              {images.length > 5 && (
                <span className="text-white text-xs ms-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Room Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-fattalNavy mb-1 line-clamp-1">
          {room.name}
        </h3>

        {/* Size and Composition */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-fattalNavy/60 mb-2">
          {room.size && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{room.size}</span>
            </div>
          )}
          {room.composition && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{room.composition}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {room.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-xs bg-fattalCream text-fattalNavy/80 px-2 py-0.5 rounded"
              >
                {feature.iconUrl && (
                  <Image
                    src={feature.iconUrl}
                    alt=""
                    width={12}
                    height={12}
                    className="w-3 h-3"
                  />
                )}
                {feature.name}
              </span>
            ))}
            {room.features.length > 3 && (
              <span className="text-xs text-fattalNavy/50">+{room.features.length - 3}</span>
            )}
          </div>
        )}

        {room.description && (
          <p className="text-sm text-fattalNavy/70 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Price & Select Button */}
        <div className="pt-3 border-t border-fattalNavy/10">
          {room.minPrice !== null && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs text-fattalNavy/60">{t(lang, 'startingFrom')}</span>
              <span className="text-xl font-bold text-fattalNavy">
                {formatPrice(room.minPrice, lang)}
              </span>
              <span className="text-sm text-fattalNavy/60">
                {room.currency === 'ILS' ? '₪' : room.currency}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect(room);
            }}
            className="w-full bg-fattalGold hover:bg-fattalGold/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            {t(lang, 'select')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
