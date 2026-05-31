'use client';

import { Smile } from 'lucide-react';

export const CHAT_EMOJI_QUICK = [
  '😀', '😂', '🥰', '😍', '🙂', '😊', '👍', '👏', '🙏', '❤️',
  '🔥', '✨', '🎉', '📚', '📖', '🎧', '💡', '🤔', '😢', '😮',
];

interface EmojiQuickPickerProps {
  open: boolean;
  onToggle: () => void;
  onSelect: (emoji: string) => void;
}

export function EmojiQuickPicker({ open, onToggle, onSelect }: EmojiQuickPickerProps) {
  return (
    <div className="relative">
      <button
        type="button"
        data-chat-menu-trigger
        onClick={onToggle}
        className="p-2.5 text-bn-muted hover:text-bn-primary hover:bg-bn-surface rounded-xl transition-colors"
        aria-label="Add emoji"
        aria-expanded={open}
      >
        <Smile size={20} />
      </button>
      {open && (
        <div
          data-chat-menu-trigger
          className="absolute bottom-full left-0 mb-2 w-64 max-w-[min(92vw,16rem)] p-2 bg-white border border-bn-border rounded-xl shadow-lg z-50 grid grid-cols-5 gap-0.5"
        >
          {CHAT_EMOJI_QUICK.map((emoji) => (
            <button
              key={emoji}
              type="button"
              data-chat-menu-trigger
              onClick={() => onSelect(emoji)}
              className="text-xl hover:bg-bn-surface rounded-lg p-1.5 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
