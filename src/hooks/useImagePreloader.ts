import { useEffect } from "react";

interface GalleryImage {
  url: string;
  description: string | null;
}

/**
 * Preloads adjacent images in a gallery so they're cached by the browser
 * before the user navigates to them.
 *
 * @param images - The full gallery array
 * @param currentIndex - Currently displayed image index
 * @param distance - How many images ahead/behind to preload (default: 2)
 */
export function useImagePreloader(
  images: GalleryImage[],
  currentIndex: number,
  distance = 2
) {
  useEffect(() => {
    if (images.length <= 1) return;

    const toPreload = new Set<string>();

    for (let offset = 1; offset <= distance; offset++) {
      const nextIdx = (currentIndex + offset) % images.length;
      const prevIdx = (currentIndex - offset + images.length) % images.length;
      toPreload.add(images[nextIdx].url);
      toPreload.add(images[prevIdx].url);
    }

    toPreload.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [images, currentIndex, distance]);
}
