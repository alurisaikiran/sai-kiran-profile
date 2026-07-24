export const CONTACT_STATUSES = ["new", "read", "replied", "archived"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_SOURCES = ["contact_form", "gmail"] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  source: ContactSource;
  status: ContactStatus;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

/** Field length caps, enforced server-side on the public submission route. */
export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  phone: 40,
  message: 5000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.email && EMAIL_RE.test(value);
}
