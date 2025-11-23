"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RoomOption } from "@/types/message-types";

interface RoomCardProps {
  room: RoomOption;
  onViewOptions: (room: RoomOption) => void;
}

export default function RoomCard({ room, onViewOptions }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === room.medias.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? room.medias.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden min-w-[280px] max-w-[320px] border border-gray-200"
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-100">
        {room.medias.length > 0 && (
          <>
            <Image
              src={room.medias[currentImageIndex].mediumUrl}
              alt={room.name}
              fill
              className="object-cover"
              sizes="320px"
            />

            {/* Image Navigation */}
            {room.medias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {room.medias.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Room Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {room.description}
        </p>

        {/* Capacity Info */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          {room.adultsCapacity > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{room.adultsCapacity} Adults</span>
            </div>
          )}
          {room.childrenCapacity > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{room.childrenCapacity} Kids</span>
            </div>
          )}
          {room.cribsCapacity > 0 && (
            <div className="flex items-center gap-1">
              <span>{room.cribsCapacity} Cribs</span>
            </div>
          )}
        </div>

        {/* Price & Options */}
        <div className="pt-3 border-t border-gray-200">
          {room.options && room.options.length > 0 && (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs text-gray-600">From</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₪{Math.min(...room.options.map(opt => opt.offer.price.amount)).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{room.options.length} option{room.options.length > 1 ? 's' : ''} available</p>
            </>
          )}
          <button
            onClick={() => onViewOptions(room)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Options
          </button>
        </div>
      </div>
    </motion.div>
  );
}
