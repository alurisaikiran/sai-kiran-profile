export function renderContact(container, data) {
  const section = document.createElement("section");
  section.className = "section contact-section";
  section.id = "contact";
  section.innerHTML = buildContact(data);
  container.appendChild(section);
  initContactBehaviors(section, data);
}

function buildContact(d) {
  return `
    <div class="contact-panel">
      <p class="eyebrow">${d.eyebrow}</p>
      <h2>${d.heading}</h2>
      <p>${d.description}</p>
      <div class="contact-actions">
        <a class="button primary" href="mailto:${d.email}">${d.email}</a>
        <a class="button secondary" href="tel:${d.phone}">${d.phoneLabel}</a>
        <button class="button secondary" type="button" data-copy-email>Copy Email</button>
        <a class="button ghost" href="${d.externalLink.href}" target="_blank" rel="noopener">${d.externalLink.label}</a>
      </div>
    </div>
    <form class="contact-form" novalidate>
      <label>
        Full Name
        <input type="text" name="name" placeholder="Your name" required>
      </label>
      <label>
        Email Address
        <input type="email" name="email" placeholder="you@example.com" required>
      </label>
      <label>
        Message
        <textarea name="message" rows="5" placeholder="Tell me what you want to build"></textarea>
      </label>
      <button class="button primary" type="submit">Draft Message Locally</button>
      <p class="form-note" role="status"></p>
    </form>
  `;
}

function initContactBehaviors(section, d) {
  const form      = section.querySelector(".contact-form");
  const formNote  = section.querySelector(".form-note");
  const copyBtn   = section.querySelector("[data-copy-email]");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    formNote.textContent = "Message drafted. Connect a backend or mailto: before going live.";
  });

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(d.email);
      copyBtn.textContent = "Email Copied";
    } catch {
      copyBtn.textContent = d.email;
    }
    setTimeout(() => { copyBtn.textContent = "Copy Email"; }, 1800);
  });
}
