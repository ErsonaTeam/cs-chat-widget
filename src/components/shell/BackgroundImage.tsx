'use client';

interface BackgroundImageProps {
  imageUrl: string | null;
  /** CSS gradient string used when imageUrl is null or invalid */
  defaultTreatment: string;
  /**
   * Adds a darkening gradient + slight blur over the image for legibility
   * when text/UI is rendered on top. Defaults to true because the only
   * current consumer (welcome screen) needs it.
   */
  overlay?: boolean;
}

const SAFE_URL_PREFIXES = ['http://', 'https://', '/', 'data:image/'];

function isSafeImageUrl(url: string): boolean {
  return SAFE_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export default function BackgroundImage({
  imageUrl,
  defaultTreatment,
  overlay = true,
}: BackgroundImageProps) {
  const safeUrl = imageUrl && isSafeImageUrl(imageUrl) ? imageUrl : null;

  if (safeUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${safeUrl}")` }}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[2px]" />
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{ background: defaultTreatment }}
      aria-hidden="true"
    />
  );
}
