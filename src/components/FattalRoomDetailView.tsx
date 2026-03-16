"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FattalRoom, FattalRoomPackage, FattalPackagePrice } from "@/types/message-types";
import { Language, t, formatPrice, getLanguageConfig } from "@/utils/i18n";
import { useImagePreloader } from "@/hooks/useImagePreloader";

interface FattalRoomDetailViewProps {
  room: FattalRoom;
  onConfirm: (room: FattalRoom, selectedPackage: FattalRoomPackage, selectedPrice: FattalPackagePrice, isClubMember: boolean) => void;
  onBack: () => void;
  lang?: Language;
}

// Grouped package type - merges packages with same name
interface GroupedPackage {
  packageName: string;
  policyName: string | null;
  prices: Array<FattalPackagePrice & { originalPackageId: number }>;
}

// Selected price identifier
interface SelectedPriceId {
  packageId: number;
  hostingBase: string;
}

export default function FattalRoomDetailView({ room, onConfirm, onBack, lang = 'HE' }: FattalRoomDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClubMember, setIsClubMember] = useState(false);
  const langConfig = getLanguageConfig(lang);

  // Step navigation: 'packages' or 'pensions'
  const [viewStep, setViewStep] = useState<'packages' | 'pensions'>('packages');
  const [selectedGroupedPackageName, setSelectedGroupedPackageName] = useState<string | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<SelectedPriceId | null>(null);

  // Get images
  const images = room.gallery?.length
    ? room.gallery
    : [{ url: room.imageUrl, description: null }];

  useImagePreloader(images, currentImageIndex);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Group packages by name and merge their prices
  const groupedPackages = useMemo((): GroupedPackage[] => {
    if (!room.packages) return [];

    const groupMap = new Map<string, GroupedPackage>();

    for (const pkg of room.packages) {
      const existing = groupMap.get(pkg.packageName);
      const pricesWithId = pkg.prices.map((price) => ({
        ...price,
        originalPackageId: pkg.packageId,
      }));

      if (existing) {
        // Merge prices, avoiding duplicates by hostingBase
        for (const price of pricesWithId) {
          const alreadyExists = existing.prices.some(
            (p) => p.hostingBase === price.hostingBase
          );
          if (!alreadyExists) {
            existing.prices.push(price);
          }
        }
      } else {
        groupMap.set(pkg.packageName, {
          packageName: pkg.packageName,
          policyName: pkg.policyName,
          prices: pricesWithId,
        });
      }
    }

    return Array.from(groupMap.values());
  }, [room.packages]);

  // Filter packages based on club member status
  const filteredGroupedPackages = useMemo((): GroupedPackage[] => {
    return groupedPackages
      .map((pkg) => {
        // Filter prices based on isClubMember state
        const filteredPrices = pkg.prices.filter((price) => {
          if (isClubMember) {
            // Club member - only packages with club price
            return price.clubTotalPrice !== null;
          } else {
            // Not a member - only packages with regular price
            return price.totalPrice > 0;
          }
        });

        return {
          ...pkg,
          prices: filteredPrices,
        };
      })
      .filter((pkg) => pkg.prices.length > 0); // Remove packages with no prices
  }, [groupedPackages, isClubMember]);

  // Reset selection when club member status changes
  useEffect(() => {
    setSelectedGroupedPackageName(null);
    setSelectedPriceId(null);
    setViewStep('packages');
  }, [isClubMember]);

  // Get selected grouped package
  const selectedGroupedPackage = useMemo(() =>
    filteredGroupedPackages.find((g) => g.packageName === selectedGroupedPackageName),
    [filteredGroupedPackages, selectedGroupedPackageName]
  );

  // Get selected price from the selected price ID
  const selectedPrice = useMemo(() => {
    if (!selectedPriceId || !selectedGroupedPackage) return null;
    return selectedGroupedPackage.prices.find(
      (p) => p.originalPackageId === selectedPriceId.packageId && p.hostingBase === selectedPriceId.hostingBase
    ) || null;
  }, [selectedPriceId, selectedGroupedPackage]);

  // Get the original package for the selected price (needed for onConfirm)
  const selectedOriginalPackage = useMemo(() => {
    if (!selectedPrice) return null;
    return room.packages?.find((p) => p.packageId === selectedPrice.originalPackageId) || null;
  }, [selectedPrice, room.packages]);

  // Handle grouped package selection - navigate to pensions view
  const handleGroupedPackageSelect = (packageName: string) => {
    setSelectedGroupedPackageName(packageName);
    setSelectedPriceId(null);
    setViewStep('pensions');
  };

  // Handle back to packages
  const handleBackToPackages = () => {
    setSelectedPriceId(null);
    setViewStep('packages');
  };

  const getDisplayPrice = (price: FattalPackagePrice) => {
    // Explicit null check (not truthiness) to handle clubTotalPrice = 0
    if (isClubMember && price.clubTotalPrice !== null) {
      return price.clubTotalPrice;
    }
    return price.totalPrice;
  };

  const handleConfirm = () => {
    if (selectedOriginalPackage && selectedPrice) {
      // Remove the originalPackageId from the price before passing to onConfirm
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { originalPackageId, ...priceWithoutId } = selectedPrice;
      onConfirm(room, selectedOriginalPackage, priceWithoutId as FattalPackagePrice, isClubMember);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      dir={langConfig.dir}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary/10"
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-3 bg-primary">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
        >
          <svg className={`w-4 h-4 ${langConfig.dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t(lang, 'backToRoomList')}
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative h-48 bg-surface">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || room.name}
          fill
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/400x200?text=Room";
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/60 hover:bg-primary/80 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/60 hover:bg-primary/80 text-white rounded-full p-2 transition-colors"
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

      {/* Room Details */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary mb-2">{room.name}</h2>

        {/* Size & Composition */}
        <div className="flex flex-wrap gap-3 text-sm text-primary/70 mb-3">
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

        {room.description && (
          <p className="text-sm text-primary/70 mb-3">{room.description}</p>
        )}

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-xs bg-surface text-primary/80 px-2 py-1 rounded"
              >
                {feature.iconUrl && (
                  <Image src={feature.iconUrl} alt="" width={12} height={12} className="w-3 h-3" />
                )}
                {feature.name}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-primary/10 my-4" />

        {/* Club Member Toggle - Always visible */}
        <div className="flex items-center justify-between mb-4 p-3 bg-accentLight rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-medium text-primary">{t(lang, 'clubMember')}</span>
          </div>
          <button
            type="button"
            role="switch"
            dir="ltr"
            aria-checked={isClubMember}
            aria-label={t(lang, 'clubMember')}
            onClick={() => setIsClubMember(!isClubMember)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/30 ${
              isClubMember ? 'bg-accent' : 'bg-primary/20'
            }`}
          >
            <span
              className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ease-in-out ${
                isClubMember ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Step-based content */}
        <AnimatePresence mode="wait">
          {viewStep === 'packages' ? (
            /* STEP 1: Packages List */
            <motion.div
              key="packages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {filteredGroupedPackages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">{t(lang, 'selectPackage')}</h3>
                  <div className="space-y-2">
                    {filteredGroupedPackages.map((groupedPkg) => {
                      // Calculate min price across all pensions for this grouped package
                      const minPrice = Math.min(
                        ...groupedPkg.prices.map((p) =>
                          isClubMember && p.clubTotalPrice !== null ? p.clubTotalPrice : p.totalPrice
                        )
                      );
                      const minBasePrice = Math.min(
                        ...groupedPkg.prices.map((p) => p.totalBasePrice || p.totalPrice)
                      );
                      const hasDiscount = minBasePrice > minPrice;

                      return (
                        <button
                          key={groupedPkg.packageName}
                          type="button"
                          onClick={() => handleGroupedPackageSelect(groupedPkg.packageName)}
                          className="w-full p-3 rounded-lg border border-primary/10 bg-white hover:border-accent hover:bg-accentLight text-start transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary">
                                {groupedPkg.packageName}
                              </p>
                              {groupedPkg.policyName && (
                                <p className="text-xs text-primary/50 mt-0.5">{groupedPkg.policyName}</p>
                              )}
                            </div>
                            <div className="text-end me-3 flex items-center gap-2">
                              <div>
                                {hasDiscount && (
                                  <p className="text-xs text-primary/40 line-through">
                                    {formatPrice(minBasePrice, lang)} ₪
                                  </p>
                                )}
                                <p className="text-sm font-bold text-primary">
                                  {t(lang, 'startingFrom')}{formatPrice(minPrice, lang)} ₪
                                </p>
                              </div>
                              <svg className={`w-4 h-4 text-primary/40 ${langConfig.dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* STEP 2: Pensions List */
            <motion.div
              key="pensions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {selectedGroupedPackage && (
                <div>
                  {/* Back button and selected package info */}
                  <button
                    type="button"
                    onClick={handleBackToPackages}
                    className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-sm mb-3 font-medium"
                  >
                    <svg className={`w-4 h-4 ${langConfig.dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t(lang, 'backToPackageList')}
                  </button>

                  {/* Selected package name */}
                  <div className="bg-accentLight border border-accent/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-accent mb-1">{t(lang, 'selectedPackage')}</p>
                    <p className="text-sm font-semibold text-primary">{selectedGroupedPackage.packageName}</p>
                  </div>

                  {/* Pensions list */}
                  <h3 className="text-sm font-semibold text-primary mb-3">{t(lang, 'selectPensionType')}</h3>
                  <div className="space-y-2">
                    {selectedGroupedPackage.prices.map((price) => {
                      const displayPrice = getDisplayPrice(price);
                      const hasDiscount = price.totalBasePrice && price.totalBasePrice > displayPrice;
                      const hasClubDiscount = isClubMember && price.clubTotalPrice && price.clubTotalPrice < price.totalPrice;
                      const isSelected = selectedPriceId?.packageId === price.originalPackageId &&
                                        selectedPriceId?.hostingBase === price.hostingBase;

                      return (
                        <button
                          key={`${price.originalPackageId}-${price.hostingBase}`}
                          type="button"
                          onClick={() => setSelectedPriceId({ packageId: price.originalPackageId, hostingBase: price.hostingBase })}
                          className={`w-full p-3 rounded-lg border-2 text-start transition-all ${
                            isSelected
                              ? "border-accent bg-accentLight"
                              : "border-primary/10 bg-white hover:border-accent/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary">{price.hostingBase}</p>
                              {price.availableRooms <= 3 && (
                                <p className="text-xs text-orange-600 mt-0.5">
                                  {t(lang, 'roomsLeft', { count: price.availableRooms })}
                                </p>
                              )}
                            </div>
                            <div className="text-end me-3">
                              {(hasDiscount || hasClubDiscount) && (
                                <p className="text-xs text-primary/40 line-through">
                                  {formatPrice(price.totalBasePrice || price.totalPrice, lang)} ₪
                                </p>
                              )}
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(displayPrice, lang)} ₪
                              </p>
                              {hasClubDiscount && (
                                <p className="text-xs text-accent font-medium">{t(lang, 'clubPrice')}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Button - Only show when pension is selected */}
        <AnimatePresence>
          {selectedPriceId && selectedPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-primary hover:bg-primaryLight text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{t(lang, 'continueToBooking')}</span>
                  <span className="font-bold">{formatPrice(getDisplayPrice(selectedPrice), lang)} ₪</span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
