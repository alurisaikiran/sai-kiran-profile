"use client";

import { useState } from "react";
import type { ContactContent } from "@/lib/content-types";

export default function Contact({ data }: { data: ContactContent }) {
  const [note, setNote] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Email");

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
      <form
        className="contact-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.currentTarget.reset();
          setNote("Message drafted. Connect a backend or mailto: before going live.");
        }}
      >
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
        <button className="button primary" type="submit">
          Draft Message Locally
        </button>
        <p className="form-note" role="status">
          {note}
        </p>
      </form>
    </section>
  );
}
