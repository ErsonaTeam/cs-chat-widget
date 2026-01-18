"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FattalRoom, FattalRoomPackage, FattalPackagePrice } from "@/types/message-types";

interface FattalRoomDetailViewProps {
  room: FattalRoom;
  onConfirm: (room: FattalRoom, selectedPackage: FattalRoomPackage, selectedPrice: FattalPackagePrice, isClubMember: boolean) => void;
  onBack: () => void;
}

// Grouped package type - merges packages with same name
interface GroupedPackage {
  packageName: string;
  policyName: string | null;
  prices: Array<FattalPackagePrice & { originalPackageId: number }>;
}

export default function FattalRoomDetailView({ room, onConfirm, onBack }: FattalRoomDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClubMember, setIsClubMember] = useState(false);

  // Step navigation: 'packages' or 'pensions'
  const [viewStep, setViewStep] = useState<'packages' | 'pensions'>('packages');
  const [selectedGroupedPackageName, setSelectedGroupedPackageName] = useState<string | null>(null);
  const [selectedPriceKey, setSelectedPriceKey] = useState<string | null>(null); // "packageId:hostingBase"

  // Get images
  const images = room.gallery?.length
    ? room.gallery
    : [{ url: room.imageUrl, description: null }];

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

  // Get selected grouped package
  const selectedGroupedPackage = useMemo(() =>
    groupedPackages.find((g) => g.packageName === selectedGroupedPackageName),
    [groupedPackages, selectedGroupedPackageName]
  );

  // Get selected price from the key "packageId:hostingBase"
  const selectedPrice = useMemo(() => {
    if (!selectedPriceKey || !selectedGroupedPackage) return null;
    const [packageIdStr, hostingBase] = selectedPriceKey.split(':');
    const packageId = parseInt(packageIdStr, 10);
    return selectedGroupedPackage.prices.find(
      (p) => p.originalPackageId === packageId && p.hostingBase === hostingBase
    ) || null;
  }, [selectedPriceKey, selectedGroupedPackage]);

  // Get the original package for the selected price (needed for onConfirm)
  const selectedOriginalPackage = useMemo(() => {
    if (!selectedPrice) return null;
    return room.packages?.find((p) => p.packageId === selectedPrice.originalPackageId) || null;
  }, [selectedPrice, room.packages]);

  // Handle grouped package selection - navigate to pensions view
  const handleGroupedPackageSelect = (packageName: string) => {
    setSelectedGroupedPackageName(packageName);
    setSelectedPriceKey(null);
    setViewStep('pensions');
  };

  // Handle back to packages
  const handleBackToPackages = () => {
    setSelectedPriceKey(null);
    setViewStep('packages');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("he-IL").format(Math.ceil(price));
  };

  const getDisplayPrice = (price: FattalPackagePrice) => {
    return isClubMember && price.clubTotalPrice ? price.clubTotalPrice : price.totalPrice;
  };

  const handleConfirm = () => {
    if (selectedOriginalPackage && selectedPrice) {
      // Remove the originalPackageId from the price before passing to onConfirm
      const { originalPackageId, ...priceWithoutId } = selectedPrice;
      onConfirm(room, selectedOriginalPackage, priceWithoutId as FattalPackagePrice, isClubMember);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-fattalNavy/10"
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-3 bg-fattalNavy">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          חזרה לרשימת החדרים
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative h-48 bg-fattalCream">
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].description || room.name}
          fill
          className="object-cover"
          sizes="100vw"
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
                <span className="text-white text-xs ml-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Room Details */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-fattalNavy mb-2">{room.name}</h2>

        {/* Size & Composition */}
        <div className="flex flex-wrap gap-3 text-sm text-fattalNavy/70 mb-3">
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
          <p className="text-sm text-fattalNavy/70 mb-3">{room.description}</p>
        )}

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-xs bg-fattalCream text-fattalNavy/80 px-2 py-1 rounded"
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
        <div className="border-t border-fattalNavy/10 my-4" />

        {/* Club Member Toggle - Always visible */}
        <div className="flex items-center justify-between mb-4 p-3 bg-fattalLightGold rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-fattalGold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-medium text-fattalNavy">חבר מועדון פתאל</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
            <input
              type="checkbox"
              checked={isClubMember}
              onChange={(e) => setIsClubMember(e.target.checked)}
              className="sr-only peer"
              aria-label="חבר מועדון פתאל"
            />
            <div className="w-11 h-6 bg-fattalNavy/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fattalGold/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-fattalNavy/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fattalGold"></div>
          </label>
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
              {groupedPackages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-fattalNavy mb-3">בחר חבילה</h3>
                  <div className="space-y-2">
                    {groupedPackages.map((groupedPkg) => {
                      // Calculate min price across all pensions for this grouped package
                      const minPrice = Math.min(
                        ...groupedPkg.prices.map((p) =>
                          isClubMember && p.clubTotalPrice ? p.clubTotalPrice : p.totalPrice
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
                          className="w-full p-3 rounded-lg border border-fattalNavy/10 bg-white hover:border-fattalGold hover:bg-fattalLightGold text-right transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-fattalNavy">
                                {groupedPkg.packageName}
                              </p>
                              {groupedPkg.policyName && (
                                <p className="text-xs text-fattalNavy/50 mt-0.5">{groupedPkg.policyName}</p>
                              )}
                            </div>
                            <div className="text-left ml-3 flex items-center gap-2">
                              <div>
                                {hasDiscount && (
                                  <p className="text-xs text-fattalNavy/40 line-through">
                                    {formatPrice(minBasePrice)} ₪
                                  </p>
                                )}
                                <p className="text-sm font-bold text-fattalNavy">
                                  החל מ-{formatPrice(minPrice)} ₪
                                </p>
                              </div>
                              <svg className="w-4 h-4 text-fattalNavy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex items-center gap-1 text-fattalGold hover:text-fattalGold/80 transition-colors text-sm mb-3 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    חזרה לרשימת החבילות
                  </button>

                  {/* Selected package name */}
                  <div className="bg-fattalLightGold border border-fattalGold/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-fattalGold mb-1">חבילה נבחרת:</p>
                    <p className="text-sm font-semibold text-fattalNavy">{selectedGroupedPackage.packageName}</p>
                  </div>

                  {/* Pensions list */}
                  <h3 className="text-sm font-semibold text-fattalNavy mb-3">בחר סוג פנסיון</h3>
                  <div className="space-y-2">
                    {selectedGroupedPackage.prices.map((price) => {
                      const displayPrice = getDisplayPrice(price);
                      const hasDiscount = price.totalBasePrice && price.totalBasePrice > displayPrice;
                      const hasClubDiscount = isClubMember && price.clubTotalPrice && price.clubTotalPrice < price.totalPrice;
                      const priceKey = `${price.originalPackageId}:${price.hostingBase}`;
                      const isSelected = selectedPriceKey === priceKey;

                      return (
                        <button
                          key={priceKey}
                          type="button"
                          onClick={() => setSelectedPriceKey(priceKey)}
                          className={`w-full p-3 rounded-lg border-2 text-right transition-all ${
                            isSelected
                              ? "border-fattalGold bg-fattalLightGold"
                              : "border-fattalNavy/10 bg-white hover:border-fattalGold/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-fattalNavy">{price.hostingBase}</p>
                              {price.availableRooms <= 3 && (
                                <p className="text-xs text-orange-600 mt-0.5">
                                  נותרו {price.availableRooms} חדרים!
                                </p>
                              )}
                            </div>
                            <div className="text-left ml-3">
                              {(hasDiscount || hasClubDiscount) && (
                                <p className="text-xs text-fattalNavy/40 line-through">
                                  {formatPrice(price.totalBasePrice || price.totalPrice)} ₪
                                </p>
                              )}
                              <p className="text-lg font-bold text-fattalNavy">
                                {formatPrice(displayPrice)} ₪
                              </p>
                              {hasClubDiscount && (
                                <p className="text-xs text-fattalGold font-medium">מחיר מועדון</p>
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
          {selectedPriceKey && selectedPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-fattalNavy hover:bg-fattalNavyLight text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>המשך להזמנה</span>
                  <span className="font-bold">{formatPrice(getDisplayPrice(selectedPrice))} ₪</span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
