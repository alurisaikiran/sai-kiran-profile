/**
 * Groq client for drafting outreach emails.
 *
 * Groq exposes an OpenAI-compatible chat completions endpoint, so this is a
 * plain fetch — no SDK dependency. Drafts are always returned to the admin
 * for review; nothing generated here is ever sent without confirmation.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

const SYSTEM_PROMPT = `You write short, professional outreach emails for a software developer contacting people about work opportunities.

Rules:
- Keep the body under 150 words. Recruiters skim.
- Plain text only. No markdown, no bullet symbols, no placeholders like [Name] or [Company].
- Write it so it reads naturally to every recipient, since the same text goes to everyone.
- Do not invent facts, employers, or metrics that were not given to you.
- No greeting line addressing a specific person, and no signature block — those are added separately.
- Warm and direct. Avoid corporate filler like "I hope this email finds you well".

Respond with strict JSON only, no prose or code fences:
{"subject": "...", "body": "..."}`;

export interface EmailDraft {
  subject: string;
  body: string;
}

export async function draftEmail(input: {
  prompt: string;
  senderName?: string;
  hasResume?: boolean;
  model?: string;
}): Promise<{ draft?: EmailDraft; error?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: "Groq is not configured. Set GROQ_API_KEY in your environment." };
  }

  const context = [
    `Sender: ${input.senderName || "a software developer"}.`,
    input.hasResume ? "A resume is attached to the email; you may reference it briefly." : "",
    `What they want to say: ${input.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model || DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: context },
        ],
      }),
      cache: "no-store",
    });
  } catch {
    return { error: "Could not reach Groq" };
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: payload?.error?.message || `Groq returned ${res.status}` };
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return { error: "Groq returned an empty response" };
  }

  try {
    const parsed = JSON.parse(content) as Partial<EmailDraft>;
    if (!parsed.subject?.trim() || !parsed.body?.trim()) {
      return { error: "Draft was missing a subject or body" };
    }
    return { draft: { subject: parsed.subject.trim(), body: parsed.body.trim() } };
  } catch {
    return { error: "Could not parse the draft Groq returned" };
  }
}
