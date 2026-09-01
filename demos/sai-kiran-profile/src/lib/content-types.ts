/** Shapes of every content section stored in the `portfolio_content` table. */

export interface ActionLink {
  label: string;
  href: string;
  variant: string;
  external?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface HeroContent {
  name: string;
  eyebrow: string;
  roles: string[];
  description: string;
  photo: string;
  photoAlt: string;
  actions: ActionLink[];
  social: SocialLink[];
}

export type StatsContent = Array<{ value: string; label: string }>;

export interface AboutContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  actions: ActionLink[];
  cards: Array<{ number: string; title: string; description: string }>;
}

export interface SkillsContent {
  eyebrow: string;
  heading: string;
  actions: ActionLink[];
  categories: Array<{
    title: string;
    flip?: boolean;
    wide?: boolean;
    items: string[];
  }>;
}

export interface ProjectsContent {
  eyebrow: string;
  heading: string;
  actions: ActionLink[];
  featured: {
    badge: string;
    href: string;
    browserUrl: string;
    browserSubline: string;
    browserHeadline: string;
    browserPills: string[];
    title: string;
    description: string;
    tags: string[];
  };
  cards: Array<{
    badge: string;
    title: string;
    description: string;
    tags: string[];
  }>;
  demos: {
    eyebrow: string;
    heading: string;
    items: Array<{
      href: string;
      image: string;
      imageAlt: string;
      badge: string;
      title: string;
      description: string;
      cta: string;
      featured?: boolean;
    }>;
  };
}

export interface LaunchedContent {
  badge: string;
  eyebrow: string;
  heading: string;
  headingLink: { label: string; href: string };
  description: string;
  highlights: Array<{ title: string; description: string }>;
  tags: string[];
  actions: ActionLink[];
  preview: {
    url: string;
    image: string;
    imageAlt: string;
    href: string;
    meta: Array<{ label: string; value: string; highlight?: boolean }>;
  };
}

export type LaunchedSectionContent = LaunchedContent[];

export interface ExperienceItem {
  date: string;
  title: string;
  description: string;
  tags: string[];
}

export interface ExperienceContent {
  eyebrow: string;
  heading: string;
  actions: ActionLink[];
  items: ExperienceItem[];
}

export interface CredentialItem {
  badge: string;
  title: string;
  subtitle: string;
}

export interface CredentialsContent {
  eyebrow: string;
  heading: string;
  actions: ActionLink[];
  items: CredentialItem[];
}

export interface ContactContent {
  eyebrow: string;
  heading: string;
  description: string;
  email: string;
  phone: string;
  phoneLabel: string;
  externalLink: { label: string; href: string };
}

export interface SiteContent {
  hero: HeroContent;
  stats: StatsContent;
  about: AboutContent;
  skills: SkillsContent;
  projects: ProjectsContent;
  launched: LaunchedSectionContent;
  experience: ExperienceContent;
  credentials: CredentialsContent;
  contact: ContactContent;
}

export type SectionKey = keyof SiteContent;

/** Sections the admin is allowed to write. Mirrors the RLS-protected table keys. */
export const ALLOWED_SECTIONS: SectionKey[] = [
  "hero",
  "stats",
  "about",
  "skills",
  "projects",
  "launched",
  "experience",
  "credentials",
  "contact",
];

export const EMPTY_EXPERIENCE_ITEM: ExperienceItem = {
  date: "",
  title: "",
  description: "",
  tags: [],
};

export const EMPTY_CREDENTIAL_ITEM: CredentialItem = {
  badge: "",
  title: "",
  subtitle: "",
};
