"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { WidgetGallery } from "@/types/message-types";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { Language, t, getLanguageConfig } from "@/utils/i18n";

interface GalleryLightboxProps {
  gallery: WidgetGallery;
  startIndex: number;
  lang: Language;
  onClose: () => void;
}

export default function GalleryLightbox({
  gallery,
  startIndex,
  lang,
  onClose,
}: GalleryLightboxProps) {
  const total = gallery.images.length;
  const { index, setIndex, next, prev } = useImageNavigation(total, startIndex);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [imageErrored, setImageErrored] = useState(false);
  const isRTL = getLanguageConfig(lang).dir === "rtl";

  // Lock background scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Initial focus on close button so Esc/Tab work immediately.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Reset error state when navigating.
  useEffect(() => {
    setImageErrored(false);
  }, [index]);

  // Keyboard navigation. Arrow direction matches reading direction.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (isRTL) prev();
        else next();
      } else if (e.key === "ArrowLeft") {
        if (isRTL) next();
        else prev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, onClose, isRTL]);

  // Scroll the active thumbnail into view.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>(`[data-index="${index}"]`);
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  // Touch swipe (mirrored for RTL so the gesture matches the visual direction).
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) {
        if (isRTL) next();
        else prev();
      } else {
        if (isRTL) prev();
        else next();
      }
    }
    touchStartX.current = null;
  }

  const current = gallery.images[index];
  const title = gallery.roomName
    ? `${gallery.hotelName} – ${gallery.roomName}`
    : gallery.hotelName;
  const showStrip = total > 1;

  // Close when clicking the dark backdrop area (not when clicking the image,
  // controls, or thumbnails). Only fires when the click landed directly on
  // a backdrop element rather than bubbling from a child.
  const closeOnBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white"
      dir={isRTL ? "rtl" : "ltr"}
      onClick={closeOnBackdrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={closeOnBackdrop}
      >
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t(lang, "galleryClose")}
          className="rounded-full p-2 hover:bg-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Image stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={closeOnBackdrop}
      >
        {imageErrored ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-sm text-white/70">
            <span>{t(lang, "galleryUnavailable")}</span>
          </div>
        ) : (
          <Image
            key={current.url}
            src={current.url}
            alt={current.description || title}
            width={1600}
            height={1200}
            className="max-h-full max-w-full object-contain motion-safe:transition-opacity motion-safe:duration-150"
            loading="eager"
            unoptimized
            onError={() => setImageErrored(true)}
          />
        )}
        {showStrip && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={t(lang, "galleryPrev")}
              className="absolute start-2 rounded-full bg-black/40 p-2 hover:bg-black/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="h-6 w-6 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t(lang, "galleryNext")}
              className="absolute end-2 rounded-full bg-black/40 p-2 hover:bg-black/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="h-6 w-6 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Caption + counter */}
      <div
        className="px-4 pt-2 text-center text-sm"
        onClick={closeOnBackdrop}
      >
        {current.description && (
          <p className="mb-1 text-white/80">{current.description}</p>
        )}
        {showStrip && (
          <p className="text-xs text-white/60">
            {index + 1} / {total}
          </p>
        )}
      </div>

      {/* Thumbnail strip */}
      {showStrip && (
        <div
          ref={stripRef}
          className="flex gap-2 overflow-x-auto px-4 py-3 md:py-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {gallery.images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              data-index={i}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1} / ${total}`}
              aria-current={i === index ? "true" : "false"}
              className={`shrink-0 cursor-pointer overflow-hidden rounded-md transition-opacity ${
                i === index ? "opacity-100 ring-2 ring-white" : "opacity-60 hover:opacity-90"
              }`}
              style={{ scrollSnapAlign: "center" }}
            >
              <Image
                src={img.url}
                alt=""
                width={120}
                height={120}
                className="h-14 w-14 object-cover md:h-16 md:w-16"
                loading="lazy"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
