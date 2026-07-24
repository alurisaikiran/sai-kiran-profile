import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/layout.css";
import "@/styles/sections.css";
import "@/styles/animations.css";

const SITE_URL = "https://saikiranaluri.com";
const TITLE = "Sai Kiran Aluri | Website Developer & Full-Stack Engineer";
const DESCRIPTION =
  "Sai Kiran Aluri is a website developer, AWS Certified Developer, and full-stack engineer building polished web apps, cloud-backed systems, and practical AI workflows. Based in the United States.";
const SOCIAL_DESCRIPTION =
  "AWS Certified Developer and full-stack engineer. Building websites, product UIs, and AI workflows. Creator of startlearning.net.";
const OG_IMAGE = `${SITE_URL}/assets/profile.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Sai Kiran Aluri",
    "website developer",
    "frontend developer",
    "full-stack engineer",
    "AWS certified developer",
    "React developer",
    "TypeScript",
    "Node.js",
    "AI automation",
    "web design",
  ],
  authors: [{ name: "Sai Kiran Aluri" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sai Kiran Aluri",
    locale: "en_US",
    title: TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Sai Kiran Aluri – Website Developer & Full-Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sai Kiran Aluri",
  url: SITE_URL,
  email: "alurisai15@gmail.com",
  telephone: "+19402994624",
  jobTitle: "Website Developer & Full-Stack Engineer",
  description:
    "AWS Certified Developer and full-stack engineer specialising in websites, product UIs, cloud services, and AI workflows.",
  image: OG_IMAGE,
  address: { "@type": "PostalAddress", addressCountry: "US" },
  worksFor: { "@type": "Organization", name: "Dynodine" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of North Texas" },
    { "@type": "CollegeOrUniversity", name: "Koneru Lakshmaiah Education Foundation" },
  ],
  knowsAbout: [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "AWS",
    "Node.js",
    "Spring Boot",
    "AI Automation",
    "Prompt Engineering",
    "n8n",
  ],
  sameAs: ["https://startlearning.net"],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: "AWS Certified Developer – Associate",
    credentialCategory: "certification",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
