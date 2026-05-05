'use client';

import { useEffect, useRef, useState } from 'react';
import { LuGlobe, LuCheck } from 'react-icons/lu';
import { type Language, t } from '@/utils/i18n';

interface LanguageSelectorProps {
  current: Language;
  enabled: Language[];
  onChange: (lang: Language) => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  HE: 'עברית',
  EN: 'English',
};

export default function LanguageSelector({
  current,
  enabled,
  onChange,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuLabel = t(current, 'languageSelectorLabel');

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (enabled.length <= 1) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={menuLabel}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-text/80 hover:bg-text/5 transition-colors"
      >
        <LuGlobe className="w-4 h-4" aria-hidden="true" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={menuLabel}
          className="absolute end-0 mt-1.5 min-w-[10rem] rounded-xl bg-surface border border-border shadow-lg overflow-hidden z-50"
        >
          {enabled.map((lang) => (
            <li key={lang} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(lang);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-text hover:bg-text/5"
              >
                <span>{LANGUAGE_LABELS[lang]}</span>
                {lang === current && (
                  <LuCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
