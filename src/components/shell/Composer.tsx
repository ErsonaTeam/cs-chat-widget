'use client';

import { type FormEvent, type ReactNode, useRef } from 'react';
import { LuSendHorizontal, LuPaperclip } from 'react-icons/lu';

interface ComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  /** Slot for suggested-action chips rendered above the input */
  chipsSlot?: ReactNode;
  direction?: 'ltr' | 'rtl';
  /** Accessible label for the form element */
  formLabel?: string;
}

export default function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  chipsSlot,
  direction,
  formLabel = 'Message composer',
}: ComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    if (!value.trim()) return;
    onSubmit();
    // Refocus the input after sending so the user can keep typing without
    // reaching for the mouse/keyboard reset.
    inputRef.current?.focus();
  }

  return (
    <div className="border-t border-border bg-surface px-3 pt-2 pb-3 space-y-2">
      {chipsSlot}
      <form onSubmit={handleSubmit} aria-label={formLabel} className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Attach (coming soon)"
          aria-disabled="true"
          disabled
          className="shrink-0 w-9 h-9 rounded-full text-text/30 flex items-center justify-center cursor-not-allowed"
        >
          <LuPaperclip className="w-4 h-4" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          dir={direction}
          className="flex-1 px-3 py-2 rounded-full bg-text/5 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="shrink-0 w-9 h-9 rounded-full bg-primary text-surface flex items-center justify-center disabled:opacity-40 hover:bg-primary-light transition-colors"
        >
          <LuSendHorizontal className="w-4 h-4 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}
