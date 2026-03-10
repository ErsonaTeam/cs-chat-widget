"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { WidgetListing } from "@/types/message-types";
import { Language, t, formatPrice, getLanguageConfig } from "@/utils/i18n";

interface ListingDetailViewProps {
  listing: WidgetListing;
  onSelect: (listing: WidgetListing) => void;
  onBack: () => void;
  lang?: Language;
}

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€' };
  return symbols[currency] || currency;
};

const DESCRIPTION_TRUNCATE_LENGTH = 150;

export default function ListingDetailView({ listing, onSelect, onBack, lang = 'HE' }: ListingDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const langConfig = getLanguageConfig(lang);
  const symbol = getCurrencySymbol(listing.currency);
  const isDescriptionLong = listing.description && listing.description.length > DESCRIPTION_TRUNCATE_LENGTH;

  const images = listing.gallery?.length
    ? listing.gallery
    : [{ url: listing.imageUrl, description: null }];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      dir={langConfig.dir}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-fattalNavy/10"
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-3 bg-fattalNavy">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
        >
          <svg className={`w-4 h-4 ${langConfig.dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t(lang, 'backToListings')}
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative h-48 bg-fattalCream">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || listing.name}
          fill
          className="object-cover"
          sizes="100vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/400x200?text=Apartment";
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-fattalNavy/60 hover:bg-fattalNavy/80 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-fattalNavy/60 hover:bg-fattalNavy/80 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
              {images.length > 5 && (
                <span className="text-white text-xs ms-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        {/* Name + Rating */}
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-fattalNavy flex-1">{listing.name}</h2>
          {listing.averageReviewRating !== null && (
            <div className="flex items-center gap-1 bg-fattalNavy/10 px-2 py-1 rounded-lg ms-2 shrink-0">
              <svg className="w-4 h-4 text-fattalGold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-fattalNavy">{listing.averageReviewRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* City */}
        <div className="flex items-center gap-1 text-sm text-fattalNavy/60 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{listing.city}</span>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 text-sm text-fattalNavy/70 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{listing.bedroomsNumber} {t(lang, 'bedrooms')}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14h18v3a3 3 0 01-3 3H6a3 3 0 01-3-3v-3zM5 14V6a2 2 0 012-2h1a2 2 0 012 2v1h4" />
            </svg>
            <span>{listing.bathroomsNumber} {t(lang, 'bathrooms')}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{listing.personCapacity} {t(lang, 'guests')}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-fattalNavy/10 my-3" />

        {/* Description */}
        {listing.description && (
          <div className="text-sm text-fattalNavy/70 mb-4">
            <p className={`whitespace-pre-wrap ${!descriptionExpanded && isDescriptionLong ? 'line-clamp-3' : ''}`}>
              {listing.description}
            </p>
            {isDescriptionLong && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="text-fattalNavy font-medium text-sm mt-1 hover:underline"
              >
                {t(lang, descriptionExpanded ? 'showLess' : 'showMore')}
              </button>
            )}
          </div>
        )}

        {/* Price */}
        <div className="border-t border-fattalNavy/10 pt-3 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-fattalNavy">
              {symbol}{formatPrice(listing.averageNightlyPrice, lang)}
            </span>
            <span className="text-sm text-fattalNavy/60">{t(lang, 'perNight')}</span>
            <span className="text-sm text-fattalNavy/40 ms-1">
              ({symbol}{formatPrice(listing.totalPrice, lang)} {t(lang, 'total')})
            </span>
          </div>
        </div>

        {/* Select Button */}
        <button
          type="button"
          onClick={() => onSelect(listing)}
          className="w-full bg-fattalNavy hover:bg-fattalNavy/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          {t(lang, 'selectListing')}
        </button>
      </div>
    </motion.div>
  );
}
