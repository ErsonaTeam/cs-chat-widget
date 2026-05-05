'use client';

interface DefaultIconProps {
  size?: number;
  className?: string;
}

export default function DefaultIcon({ size = 28, className = '' }: DefaultIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4a1 1 0 0 1 1 1v1.07a7.002 7.002 0 0 1 6 6.93V16h.5a1.5 1.5 0 0 1 0 3h-15a1.5 1.5 0 0 1 0-3H5v-3a7.002 7.002 0 0 1 6-6.93V5a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <rect x="9" y="20" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
