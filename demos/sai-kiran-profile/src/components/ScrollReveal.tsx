"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Mounts the scroll-reveal observer for the page. Renders nothing. */
export default function ScrollReveal() {
  useScrollReveal();
  return null;
}
