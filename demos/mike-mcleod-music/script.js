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

// ── Floating pill button (all pages) ──────────────────────
(function() {
  const widget = document.createElement('div');
  widget.className = 'float-pill';
  widget.innerHTML = `
    <div class="float-pill-expand">
      <a class="float-call-link" href="tel:4046631407">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span>404-663-1407</span>
      </a>
      <span class="float-sep"></span>
      <a class="float-book-link" href="booking.html">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5C3.89 4 3.01 4.9 3.01 6L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V1h-2zm3 19H5V9h14v11z"/>
        </svg>
        <span>Book Mike</span>
      </a>
    </div>
    <div class="float-pill-dot">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
      </svg>
    </div>`;
  document.body.appendChild(widget);

  // Tap to expand on touch devices
  const dot = widget.querySelector('.float-pill-dot');
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('expanded');
  });
  document.addEventListener('click', () => widget.classList.remove('expanded'));
})();

// ── Scroll reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// ── Review marquee ────────────────────────────────────────
(function () {
  const reviews = [
    { text: "Mike did an amazing job performing at our New Year's Eve party!", name: "Adam C." },
    { text: "Set list was great and added the perfect ambiance.", name: "Amy A." },
    { text: "Such a talented guitar player.", name: "Angela C." },
    { text: "All of our guests loved Mike.", name: "Angela S." },
    { text: "Mike did a happy hour event for our clubhouse and was a hit!", name: "Anna W." },
    { text: "All of our guests raved … hit of our party!", name: "Breana C." },
    { text: "Mike was great at our Birthday party. Everyone had a great time.", name: "Brigitte H." },
    { text: "Just what we were looking for.", name: "Dawn R." },
    { text: "Such a fun evening!!", name: "Diane M." },
    { text: "Music was awesome. Everyone loved it.", name: "Ed P." },
    { text: "Evening was a great hit and such fun.", name: "Helen M." },
    { text: "Will have him back next year. Thanks Mike!", name: "Highland P." },
    { text: "Song selection was perfect.", name: "James C." },
    { text: "Mike was amazing! Truly made the night memorable.", name: "Jason B." },
    { text: "A huge hit.", name: "Jeannette D." },
    { text: "Fantastic entertainer!!", name: "Jennifer D." },
    { text: "Used Mike for my mom's 70th birthday. Sound quality was great.", name: "Jennifer N." },
    { text: "Mike is top notch and highly recommend. We will use him again!", name: "Jim H." },
    { text: "Mike, the one-man band, did a great job entertaining our party.", name: "Joel S." },
    { text: "The hit of our party!", name: "John L." },
    { text: "Hard to believe he's only one guy!", name: "John R." },
    { text: "Mike was perfect for our 100+ person party.", name: "Julie W." },
    { text: "Mike was a pleasure to work with and made our party rock.", name: "Jutta A." },
    { text: "His music was perfect for my birthday party! Highly recommend!", name: "Kim Y." },
    { text: "Gives off a great atmosphere.", name: "Krystal O." },
    { text: "Elevated the energy.", name: "Kymberly D." },
    { text: "Great job of reading the room. I would hire Mike again in a heartbeat.", name: "Leo R." },
    { text: "Perfect musician for our party.", name: "Leslie K." },
    { text: "Loved the music he chose for us! We would hire him again!", name: "Lisa W." },
    { text: "Everyone absolutely loved his performance.", name: "Logan E." },
    { text: "Happy hosts; delighted guests!", name: "Lucy D." },
    { text: "Everyone was dancing.", name: "Martha M." },
    { text: "Great job for my wife's 40th. Everyone really enjoyed his music!", name: "Mathew L." },
    { text: "Mike really made the party!!", name: "Melissa C." },
    { text: "Very interactive with the audience.", name: "Monty H." },
    { text: "Mike is amazing.", name: "Nenad N." },
    { text: "WONDERFUL in every way! Playlist is fantastic.", name: "Penny M." },
    { text: "Weather moved us indoors but Mike still shined!", name: "Skip H." },
    { text: "All the guests mentioned how impressed they were.", name: "Spencer M." },
    { text: "The highlight of our graduation party. He is a fantastic musician.", name: "Stephan C." },
    { text: "Great setlist and definitely brought the fun.", name: "Suzanne S." },
    { text: "Beautiful, romantic and very unique.", name: "Tadser P." },
    { text: "Highlight of our holiday party. Great voice, and extremely talented.", name: "Taylor S." },
    { text: "His musical skills were top notch. Highly recommend!", name: "Travis R." },
    { text: "Great experience! Highly recommend.", name: "Veronica E." },
    { text: "We had a great time!", name: "Victor R." },
  ];

  const container = document.getElementById('review-marquee');
  if (!container) return;

  const rows = [
    { cards: reviews.slice(0, 16),  dur: '42s', reverse: false },
    { cards: reviews.slice(16, 31), dur: '54s', reverse: true  },
    { cards: reviews.slice(31),     dur: '48s', reverse: false },
  ];

  rows.forEach(({ cards, dur, reverse }) => {
    const row = document.createElement('div');
    row.className = 'marquee-row' + (reverse ? ' reverse' : '');

    const inner = document.createElement('div');
    inner.className = 'marquee-inner';
    inner.style.setProperty('--dur', dur);

    [...cards, ...cards].forEach(r => {
      const card = document.createElement('div');
      card.className = 'marquee-card';
      card.innerHTML = `<div class="stars">★★★★★</div><p>"${r.text}"</p><cite><strong>${r.name}</strong></cite>`;
      inner.appendChild(card);
    });

    row.appendChild(inner);
    container.appendChild(row);
  });
})();

// Staggered card groups
['.instrument-card', '.how-step'].forEach(sel => {
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

// ── Logo stagger + glow (Clients) ─────────────────────────
document.querySelectorAll('.logo-grid').forEach(grid => {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      entries[0].target.querySelectorAll('.logo-cell').forEach((cell, i) => {
        setTimeout(() => {
          cell.classList.add('logo-in');
          setTimeout(() => cell.classList.add('logo-glow'), 100);
        }, i * 40);
      });
    }
  }, { threshold: 0.05 }).observe(grid);
});

// ── Planning timeline: reveal each step on scroll ─────────
const pgSteps = document.querySelectorAll('.pg-step');
if (pgSteps.length) {
  const pgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('pg-in');
        pgObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  pgSteps.forEach(el => pgObserver.observe(el));
}

// ── Media page: stagger fade-in for photos on scroll ──────
const photoFigures = document.querySelectorAll('.photo-grid figure');
if (photoFigures.length) {
  photoFigures.forEach(fig => {
    fig.style.opacity = '0';
    fig.style.transform = 'translateY(20px)';
    fig.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  const photoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${(idx % 4) * 80}ms`;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        photoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  photoFigures.forEach(el => photoObserver.observe(el));
}

// ── Media page: stagger fade-in for video cards ───────────
const videoArticles = document.querySelectorAll('.video-grid article');
if (videoArticles.length) {
  videoArticles.forEach(art => {
    art.style.opacity = '0';
    art.style.transform = 'translateY(24px)';
    art.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  const vidObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${(idx % 4) * 100}ms`;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        vidObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  videoArticles.forEach(el => vidObserver.observe(el));
}

// ── Songs page: stagger fade-in for song rows ─────────────
const songRows = document.querySelectorAll('.setlist-rows li');
if (songRows.length) {
  songRows.forEach(li => {
    li.style.opacity = '0';
    li.style.transform = 'translateX(-8px)';
    li.style.transition = 'opacity .4s ease, transform .4s ease';
  });
  const songObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const list = entry.target.parentElement;
        const idx = Array.from(list.children).indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx * 30, 300)}ms`;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        songObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  songRows.forEach(el => songObserver.observe(el));
}

// ── Lightbox (Photos page) ─────────────────────────────────
const photoGrid = document.querySelector('.photo-grid');
if (photoGrid) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">&times;</button>
    <button class="lb-prev" aria-label="Previous">&#8592;</button>
    <button class="lb-next" aria-label="Next">&#8594;</button>
    <div class="lightbox-content">
      <img src="" alt="">
      <p class="lightbox-caption"></p>
    </div>`;
  document.body.appendChild(lb);

  const figures = Array.from(photoGrid.querySelectorAll('figure'));
  let current = 0;

  function openLb(idx) {
    current = idx;
    const fig = figures[idx];
    lb.querySelector('img').src = fig.querySelector('img').src;
    lb.querySelector('img').alt = fig.querySelector('img').alt;
    lb.querySelector('.lightbox-caption').textContent = fig.querySelector('figcaption')?.textContent || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  figures.forEach((fig, i) => {
    fig.style.cursor = 'zoom-in';
    fig.addEventListener('click', () => openLb(i));
  });

  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); openLb((current - 1 + figures.length) % figures.length); });
  lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); openLb((current + 1) % figures.length); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb((current - 1 + figures.length) % figures.length);
    if (e.key === 'ArrowRight') openLb((current + 1) % figures.length);
  });
}

// ── Animated stars (non-marquee only) ─────────────────────
document.querySelectorAll('.stars').forEach(el => {
  if (el.closest('.marquee-card')) {
    // Inside marquee — show instantly, no observer
    el.innerHTML = Array(5).fill('<span class="star lit">&#9733;</span>').join('');
    return;
  }
  el.innerHTML = Array(5).fill('<span class="star">&#9733;</span>').join('');
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      el.querySelectorAll('.star').forEach((s, i) => {
        setTimeout(() => s.classList.add('lit'), i * 130);
      });
    }
  }, { threshold: 0.8 }).observe(el);
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
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const msg = form.querySelector(".form-message");

    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const selects = form.querySelectorAll("select");
    const eventType = selects[0].value;
    const duration = selects[1].value;
    const rawDate = form.querySelector('input[type="date"]').value;
    const location = form.querySelectorAll('input[type="text"]')[1]?.value.trim() || "";
    const message = form.querySelector("textarea").value.trim();

    // Convert YYYY-MM-DD to MM/DD/YYYY
    let eventDate = "";
    if (rawDate) {
      const [y, m, d] = rawDate.split("-");
      eventDate = `${m}/${d}/${y}`;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";
    msg.textContent = "";

    try {
      await fetch("https://script.google.com/macros/s/AKfycbxDsAwyC1pVdEyqXA9s_hCWg42ZGLhhhVxhKer6aGoE4Na7pJnIjdAN7ObShAUv-VpWSg/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, eventType, eventDate, duration, location, message }),
        mode: "no-cors"
      });
      msg.style.color = "green";
      msg.textContent = "Message sent! Mike will be in touch soon.";
      form.reset();
    } catch {
      msg.style.color = "red";
      msg.textContent = "Something went wrong. Please try again or call 404-663-1407.";
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Send to Mike <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
    }
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
