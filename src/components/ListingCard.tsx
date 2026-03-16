"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { WidgetListing } from "@/types/message-types";
import { Language, t, formatPrice, getLanguageConfig } from "@/utils/i18n";
import { useImagePreloader } from "@/hooks/useImagePreloader";

interface ListingCardProps {
  listing: WidgetListing;
  onViewDetails: (listing: WidgetListing) => void;
  lang?: Language;
}

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€' };
  return symbols[currency] || currency;
};

export default function ListingCard({ listing, onViewDetails, lang = 'HE' }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const langConfig = getLanguageConfig(lang);
  const symbol = getCurrencySymbol(listing.currency);

  const images = listing.gallery?.length
    ? listing.gallery
    : [{ url: listing.imageUrl, description: null }];

  useImagePreloader(images, currentImageIndex);

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
      className="bg-white rounded-xl shadow-md overflow-hidden min-w-[280px] max-w-[320px] border border-primary/10"
    >
      {/* Image Carousel */}
      <div className="relative h-40 bg-surface">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || listing.name}
          fill
          className="object-cover"
          sizes="320px"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Apartment';
          }}
        />

        {/* Rating Badge */}
        {listing.averageReviewRating !== null && (
          <div className="absolute top-2 end-2 bg-primary/80 text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {listing.averageReviewRating.toFixed(1)}
          </div>
        )}

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/60 hover:bg-primary/80 text-white rounded-full p-1.5 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/60 hover:bg-primary/80 text-white rounded-full p-1.5 transition-colors"
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
                <span className="text-white text-xs ms-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Listing Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary mb-1 line-clamp-1">
          {listing.name}
        </h3>

        {/* City */}
        <div className="flex items-center gap-1 text-sm text-primary/60 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{listing.city}</span>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 text-xs text-primary/70 mb-2">
          <span>{listing.bedroomsNumber} {t(lang, 'bedrooms')}</span>
          <span className="text-primary/30">·</span>
          <span>{listing.bathroomsNumber} {t(lang, 'bathrooms')}</span>
          <span className="text-primary/30">·</span>
          <span>{listing.personCapacity} {t(lang, 'guests')}</span>
        </div>

        {/* Description snippet */}
        {listing.description && (
          <p className="text-xs text-primary/60 mb-3 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Price & Details Button */}
        <div className="pt-3 border-t border-primary/10">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-primary">
              {symbol}{formatPrice(listing.averageNightlyPrice, lang)}
            </span>
            <span className="text-sm text-primary/60">{t(lang, 'perNight')}</span>
            <span className="text-sm text-primary/40 ms-1">
              ({symbol}{formatPrice(listing.totalPrice, lang)} {t(lang, 'total')})
            </span>
          </div>
          <button
            onClick={() => onViewDetails(listing)}
            className="w-full bg-accent hover:bg-accent/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            {t(lang, 'moreDetails')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
