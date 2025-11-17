"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomOption, RoomOptionDetail } from "@/types/message-types";

interface RoomOptionsViewProps {
  room: RoomOption;
  onConfirm: (room: RoomOption, option: RoomOptionDetail, quantity: number) => void;
  onBack: () => void;
}

export default function RoomOptionsView({ room, onConfirm, onBack }: RoomOptionsViewProps) {
  const [selectedOption, setSelectedOption] = useState<RoomOptionDetail | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(room, selectedOption, quantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const calculateDiscount = (basePrice: number, price: number) => {
    if (basePrice <= price) return 0;
    return Math.round(((basePrice - price) / basePrice) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to rooms
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
        <p className="text-xs text-gray-600 mt-1">Select your preferred option</p>
      </div>

      {/* Options List */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {room.options.map((option, index) => {
          const discount = calculateDiscount(option.offer.basePrice.amount, option.offer.price.amount);
          const isSelected = selectedOption?.signature === option.signature;

          return (
            <motion.div
              key={option.signature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedOption(option)}
              className={`
                relative p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'}
              `}
            >
              {/* Offer Name & Badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {option.offer.name ? (
                    <h4 className="text-sm font-semibold text-gray-900">{option.offer.name}</h4>
                  ) : (
                    <h4 className="text-sm font-semibold text-gray-900">Standard Rate</h4>
                  )}
                  {option.offer.isLoyaltyClubOffer && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      🔑 Club Member
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-gray-900">
                  ₪{formatPrice(option.offer.price.amount)}
                </span>
                {discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ₪{formatPrice(option.offer.basePrice.amount)}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{option.offer.mealPlan.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  {option.offer.cancellationPolicy.notRefundable ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-600">Non-refundable</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600">
                        Free cancellation {option.offer.cancellationPolicy.withoutChargeBeforeHours ? `(${option.offer.cancellationPolicy.withoutChargeBeforeHours}h before)` : ''}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>
                    {option.allocation.adults} Adult{option.allocation.adults > 1 ? 's' : ''}
                    {option.allocation.children.length > 0 && `, ${option.allocation.children.length} Child${option.allocation.children.length > 1 ? 'ren' : ''}`}
                  </span>
                </div>

                {option.offer.availableQuantity <= 3 && (
                  <div className="text-orange-600 font-medium">
                    Only {option.offer.availableQuantity} left!
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quantity & Confirm */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t pt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedOption.offer.availableQuantity, quantity + 1))}
                  disabled={quantity >= selectedOption.offer.availableQuantity}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Confirm - ₪{formatPrice(selectedOption.offer.price.amount * quantity)} Total
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
