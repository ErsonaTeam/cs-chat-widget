'use client';

import { type ReactNode } from 'react';
import Markdown from 'react-markdown';
import DefaultIcon from './DefaultIcon';

interface MessageBubbleProps {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  direction: 'ltr' | 'rtl';
  /** Slot for rich content rendered below the text (carousels, forms) */
  children?: ReactNode;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({
  sender,
  text,
  timestamp,
  direction,
  children,
}: MessageBubbleProps) {
  const isUser = sender === 'user';

  return (
    <div
      className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-text/10 text-text/70'
            : 'bg-primary text-surface'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <span className="text-xs font-medium">U</span>
        ) : (
          <DefaultIcon size={16} />
        )}
      </div>

      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {text && (
          <div
            dir={direction}
            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'bg-primary text-surface rounded-br-md'
                : 'bg-surface text-text border border-border rounded-bl-md shadow-sm'
            }`}
          >
            {isUser ? (
              <p className="m-0 whitespace-pre-wrap break-words">{text}</p>
            ) : (
              <div className="prose prose-sm max-w-none [&_p]:m-0 [&_p+p]:mt-2 [&_a]:underline">
                <Markdown>{text}</Markdown>
              </div>
            )}
          </div>
        )}
        {children && <div className="w-full">{children}</div>}
        <time
          dateTime={timestamp.toISOString()}
          className="text-[10px] text-text/40 px-1"
        >
          {formatTime(timestamp)}
        </time>
      </div>
    </div>
  );
}
