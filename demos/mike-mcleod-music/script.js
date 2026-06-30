const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("nav a:not(.nav-cta)").forEach((link) => {
  const linkPage = link.getAttribute("href").split("/").pop();
  if (linkPage === currentPage) link.classList.add("active");
});

const siteHeader = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 80);
}, { passive: true });

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("nav");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

// ── Scroll reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Staggered card groups
['.instrument-card', '.how-step', '.review-card'].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    const siblings = Array.from(el.parentElement.querySelectorAll(sel));
    el.style.transitionDelay = `${siblings.indexOf(el) * 120}ms`;
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});

// Non-staggered reveals
[
  '.section-heading', '.about-photo', '.about-text',
  '.about-cta h2', '.about-cta-buttons',
  '.setlist-header', '.setlist-group',
  '.booking > div', '.booking form',
  '.creds-logos h2', '.videos .section-heading',
].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});

// ── Stat counter ───────────────────────────────────────────
function runCounter(el) {
  const raw = el.textContent.trim();
  const num = parseInt(raw.replace(/\D/g, ''));
  if (!num) return;
  const suffix = raw.replace(/[\d]/g, '');
  const duration = 1400;
  let startTime = null;
  const tick = (ts) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * num) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statsEl = document.querySelector('.about-stats');
if (statsEl) {
  let counted = false;
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      statsEl.querySelectorAll('strong').forEach(runCounter);
    }
  }, { threshold: 0.5 }).observe(statsEl);
}

// ── Logo stagger ───────────────────────────────────────────
document.querySelectorAll('.logo-grid').forEach(grid => {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      entries[0].target.querySelectorAll('.logo-cell').forEach((cell, i) => {
        setTimeout(() => cell.classList.add('logo-in'), i * 40);
      });
    }
  }, { threshold: 0.05 }).observe(grid);
});

const audioPlayer = new Audio();
let activeTrack = null;

function resetTracks() {
  document.querySelectorAll(".track").forEach((item) => {
    item.classList.remove("playing", "loading");
    item.querySelector(".track-play").textContent = "\u25B6";
  });
}

document.querySelectorAll(".track-play").forEach((button) => {
  button.addEventListener("click", () => {
    const track = button.closest(".track");
    if (activeTrack === track && !audioPlayer.paused) {
      audioPlayer.pause();
      resetTracks();
      return;
    }

    resetTracks();
    activeTrack = track;
    track.classList.add("loading");
    audioPlayer.src = track.dataset.audio;
    audioPlayer.play().then(() => {
      track.classList.remove("loading");
      track.classList.add("playing");
      button.textContent = "\u25A0";
    }).catch(() => {
      resetTracks();
      activeTrack = null;
    });
  });
});

audioPlayer.addEventListener("ended", () => {
  resetTracks();
  activeTrack = null;
});

const bookingForm = document.querySelector(".booking form");
if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const selects = form.querySelectorAll("select");
    const eventType = selects[0].value;
    const duration = selects[1].value;
    const eventDate = form.querySelector('input[type="date"]').value;
    const location = form.querySelectorAll('input[type="text"]')[1]?.value.trim() || "";
    const details = form.querySelector("textarea").value.trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Event type: ${eventType}`,
      `Event date: ${eventDate || "Not provided"}`,
      `Duration: ${duration || "Not specified"}`,
      `Location / Venue: ${location || "Not provided"}`,
      "",
      details
    ].join("\n");

    window.location.href = `mailto:MikeMcLeodMusic@gmail.com?subject=${encodeURIComponent("Live music booking inquiry")}&body=${encodeURIComponent(body)}`;
    form.querySelector(".form-message").textContent =
      "Opening your email app with the booking details.";
  });
}

const newsletterForm = document.querySelector(".newsletter");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.currentTarget.querySelector(".newsletter-message").textContent =
      "Demo form only. Use Mike's Facebook or YouTube links for current updates.";
  });
}
