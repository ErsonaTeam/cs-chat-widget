"use client";

import Image from "next/image";
import type { WidgetGallery } from "@/types/message-types";
import { Language, t } from "@/utils/i18n";

interface GalleryCardProps {
  gallery: WidgetGallery;
  lang: Language;
  onOpen: (startIndex: number) => void;
}

export default function GalleryCard({ gallery, lang, onOpen }: GalleryCardProps) {
  const first = gallery.images[0];
  const total = gallery.images.length;
  const showCount = total > 1;
  const countLabel = t(lang, "galleryPhotoCount", { count: total });
  const cardLabel = showCount ? countLabel : (gallery.roomName ?? gallery.hotelName);

  return (
    <button
      type="button"
      onClick={() => onOpen(0)}
      aria-label={cardLabel}
      className="group relative block w-full overflow-hidden rounded-2xl bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <Image
        src={first.url}
        alt={first.description || gallery.roomName || gallery.hotelName}
        width={600}
        height={300}
        className="h-48 w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
        loading="lazy"
        unoptimized
      />
      {showCount && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M9 3 7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9Zm3 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
          </svg>
          <span>{countLabel}</span>
        </div>
      )}
    </button>
  );
}
