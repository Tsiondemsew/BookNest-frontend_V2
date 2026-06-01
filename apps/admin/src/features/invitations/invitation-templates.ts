import type { InvitationRoleType } from './types';

export const DEFAULT_TEMPLATES: Record<
  InvitationRoleType,
  { subject: string; message: string }
> = {
  user: {
    subject: 'You are invited to join BookNest',
    message: `Hello {{name}},

You have been invited to join BookNest as a reader. BookNest is your home for discovering, purchasing, and enjoying great books.

Click the button below to accept your invitation and create your account. This invitation will expire on {{expiresAt}}.

We look forward to welcoming you to the community!

The BookNest Team`,
  },
  author: {
    subject: 'BookNest Author Studio invitation',
    message: `Hello {{name}},

You have been invited to join BookNest as an author. You will be able to publish your work, manage your catalog, and reach readers on our platform.

Click the button below to accept your invitation and set up your author profile. This invitation expires on {{expiresAt}}.

The BookNest Team`,
  },
  publisher: {
    subject: 'BookNest Publisher invitation',
    message: `Hello {{name}},

You have been invited to join BookNest as a publisher. Partner with us to distribute titles and manage your publishing presence.

Click the button below to accept your invitation and complete onboarding. This invitation expires on {{expiresAt}}.

The BookNest Team`,
  },
};

export function applyPlaceholders(
  text: string,
  { name, expiresAt }: { name: string; expiresAt: string },
) {
  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' })
    : 'the expiration date';
  return text.replace(/\{\{name\}\}/g, name || 'there').replace(/\{\{expiresAt\}\}/g, expiresLabel);
}

export function defaultExpiresAtIso(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
