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

export const EXCLUSION_KINDS = ["email", "domain"] as const;
export type ExclusionKind = (typeof EXCLUSION_KINDS)[number];

export interface ContactExclusion {
  id: string;
  value: string;
  kind: ExclusionKind;
  reason: string | null;
  created_at: string;
}

/** True if `email` is suppressed by any exclusion rule. */
export function isExcluded(email: string, exclusions: ContactExclusion[]): boolean {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] ?? "";
  return exclusions.some((e) =>
    e.kind === "domain"
      ? domain === e.value.toLowerCase().replace(/^@/, "")
      : normalized === e.value.toLowerCase()
  );
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
