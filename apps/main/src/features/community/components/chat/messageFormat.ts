import type { ChatMessage, ChatMessageReplyPreview } from '@repo/types';

const FWD_MARKER = '⟪fwd:';

export function toReplyPreview(msg: ChatMessage): ChatMessageReplyPreview {
  const snippet = msg.isDeleted
    ? 'Message deleted'
    : msg.sharedPost
      ? 'Shared a post'
      : msg.content?.slice(0, 200) || null;

  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    content: snippet,
    isDeleted: Boolean(msg.isDeleted || msg.deletedForEveryone),
  };
}

export function encodeForwardedMessage(senderName: string, content: string): string {
  const from = senderName.trim() || 'User';
  const text = content.trim().slice(0, 500);
  return `${FWD_MARKER}${from}⟫\n${text}`;
}

export interface ForwardedPayload {
  from: string;
  text: string;
}

export function parseForwardedMessage(content: string | null | undefined): ForwardedPayload | null {
  if (!content?.startsWith(FWD_MARKER)) return null;
  const end = content.indexOf('⟫\n');
  if (end === -1) return null;
  const from = content.slice(FWD_MARKER.length, end).trim();
  const text = content.slice(end + 2);
  if (!from) return null;
  return { from, text };
}

/** Plain-text fallback for old forwards */
export function parseLegacyForwarded(content: string): ForwardedPayload | null {
  const match = content.match(/^Forwarded from ([^\n:]+):\n([\s\S]*)$/);
  if (!match) return null;
  return { from: match[1].trim(), text: match[2] };
}

export function parseAnyForwarded(content: string | null | undefined): ForwardedPayload | null {
  if (!content) return null;
  return parseForwardedMessage(content) ?? parseLegacyForwarded(content);
}

export function replyPreviewFromMessage(
  real: ChatMessage,
  fallback: ChatMessage | null
): ChatMessageReplyPreview | null {
  if (real.replyTo) return real.replyTo;
  if (fallback) return toReplyPreview(fallback);
  return null;
}
