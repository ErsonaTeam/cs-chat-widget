"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FattalHotel } from "@/types/message-types";

interface HotelCardProps {
  hotel: FattalHotel;
  onSelect: (hotel: FattalHotel) => void;
}

export default function HotelCard({ hotel, onSelect }: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL').format(Math.ceil(price));
  };

  // Use gallery if available, otherwise fallback to single imageUrl
  const images = hotel.gallery?.length
    ? hotel.gallery
    : [{ url: hotel.imageUrl, description: null }];

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
      className="bg-white rounded-xl shadow-md overflow-hidden min-w-[280px] max-w-[320px] border border-fattalNavy/10"
    >
      {/* Hotel Image Carousel */}
      <div className="relative h-40 bg-fattalCream">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || hotel.hotelName}
          fill
          className="object-cover"
          sizes="320px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Hotel';
          }}
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-fattalNavy/60 hover:bg-fattalNavy/80 text-white rounded-full p-1.5 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
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
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
              {images.length > 5 && (
                <span className="text-white text-xs ml-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hotel Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-fattalNavy mb-1 line-clamp-1">
          {hotel.hotelName}
        </h3>

        {hotel.city && (
          <div className="flex items-center gap-1 text-sm text-fattalNavy/60 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{hotel.city}</span>
          </div>
        )}

        {hotel.shortDescription && (
          <p className="text-sm text-fattalNavy/70 mb-3 line-clamp-2">
            {hotel.shortDescription}
          </p>
        )}

        {/* Price & Select Button */}
        <div className="pt-3 border-t border-fattalNavy/10">
          {hotel.minPrice !== null && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs text-fattalNavy/60">החל מ-</span>
              <span className="text-xl font-bold text-fattalNavy">
                {formatPrice(hotel.minPrice)}
              </span>
              <span className="text-sm text-fattalNavy/60">
                {hotel.currency === 'ILS' ? '₪' : hotel.currency}
              </span>
            </div>
          )}
          <button
            onClick={() => onSelect(hotel)}
            className="w-full bg-fattalGold hover:bg-fattalGold/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            בחר
          </button>
        </div>
      </div>
    </motion.div>
  );
}
