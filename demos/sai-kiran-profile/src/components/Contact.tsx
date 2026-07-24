"use client";

import { useState } from "react";
import type { ContactContent } from "@/lib/content-types";

export default function Contact({ data }: { data: ContactContent }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Email");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);

    setSending(true);
    setNote("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          message: values.get("message"),
          website: values.get("website"), // honeypot
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not send your message");
      form.reset();
      setNote("Thanks — your message came through. I'll get back to you shortly.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not send your message");
    }
    setSending(false);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(data.email);
      setCopyLabel("Email Copied");
    } catch {
      setCopyLabel(data.email);
    }
    setTimeout(() => setCopyLabel("Copy Email"), 1800);
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-panel">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2>{data.heading}</h2>
        <p>{data.description}</p>
        <div className="contact-actions">
          <a className="button primary" href={`mailto:${data.email}`}>
            {data.email}
          </a>
          <a className="button secondary" href={`tel:${data.phone}`}>
            {data.phoneLabel}
          </a>
          <button className="button secondary" type="button" onClick={copyEmail}>
            {copyLabel}
          </button>
          <a
            className="button ghost"
            href={data.externalLink.href}
            target="_blank"
            rel="noopener"
          >
            {data.externalLink.label}
          </a>
        </div>
      </div>
      <form className="contact-form" noValidate onSubmit={submit}>
        <label>
          Full Name
          <input type="text" name="name" placeholder="Your name" required />
        </label>
        <label>
          Email Address
          <input type="email" name="email" placeholder="you@example.com" required />
        </label>
        <label>
          Message
          <textarea name="message" rows={5} placeholder="Tell me what you want to build" />
        </label>
        {/* Honeypot — hidden from people, irresistible to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        />
        <button className="button primary" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send Message"}
        </button>
        <p className="form-note" role="status">
          {note}
        </p>
      </form>
    </section>
  );
}
