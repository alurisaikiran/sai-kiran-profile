const roles = [
  "Website Developer",
  "Frontend Developer",
  "Full-Stack Engineer",
  "AWS Certified Developer",
  "AI Workflow Builder"
];

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const roleText = document.querySelector("#roleText");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const copyEmailButton = document.querySelector("[data-copy-email]");
const flipCards = document.querySelectorAll("[data-flip-card]");

let roleIndex = 0;

setInterval(() => {
  if (!roleText) return;
  roleIndex = (roleIndex + 1) % roles.length;
  roleText.textContent = roles[roleIndex];
}, 1800);

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteNav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  contactForm.reset();
  formNote.textContent = "Message drafted locally. Connect this form before using the site live.";
});

copyEmailButton?.addEventListener("click", async () => {
  const email = "alurisai15@gmail.com";
  try {
    await navigator.clipboard.writeText(email);
    copyEmailButton.textContent = "Email Copied";
  } catch {
    copyEmailButton.textContent = email;
  }
  setTimeout(() => {
    copyEmailButton.textContent = "Copy Email";
  }, 1800);
});

flipCards.forEach((card) => {
  card.addEventListener("click", () => {
    flipCards.forEach((item) => {
      if (item !== card) item.classList.remove("is-flipped");
    });
    card.classList.toggle("is-flipped");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }

    if (event.key === "Escape") {
      card.classList.remove("is-flipped");
    }
  });
});

const animatedItems = document.querySelectorAll(
  ".section-heading, .about-copy, .about-cards article, .skill-card, .project-card, .demo-card, .timeline-item, .credential-grid article, .contact-panel, .contact-form"
);

animatedItems.forEach((item) => item.classList.add("motion-item"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

animatedItems.forEach((item) => revealObserver.observe(item));

function initAIBackground() {
  const canvas = document.querySelector("#ai-bg");
  const hero = document.querySelector(".hero");

  if (!canvas || !hero || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = window.innerWidth < 760 ? 90 : 150;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const radius = 3.2 + Math.random() * 2.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x10c8d2,
    size: window.innerWidth < 760 ? 0.045 : 0.035,
    transparent: true,
    opacity: 0.82
  });

  const points = new THREE.Points(particleGeometry, particleMaterial);
  group.add(points);

  const linePositions = [];
  for (let i = 0; i < particleCount; i += 1) {
    for (let j = i + 1; j < particleCount; j += 11) {
      const ax = positions[i * 3];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      const bx = positions[j * 3];
      const by = positions[j * 3 + 1];
      const bz = positions[j * 3 + 2];
      const distance = Math.hypot(ax - bx, ay - by, az - bz);

      if (distance < 1.32) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x7c4dff,
    transparent: true,
    opacity: 0.22
  });
  group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 1),
    new THREE.MeshBasicMaterial({
      color: 0xf05d52,
      wireframe: true,
      transparent: true,
      opacity: 0.16
    })
  );
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.01, 12, 96),
    new THREE.MeshBasicMaterial({
      color: 0x9bc53d,
      transparent: true,
      opacity: 0.18
    })
  );
  ring.rotation.x = Math.PI / 2.7;
  group.add(ring);

  let targetX = 0;
  let targetY = 0;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.35;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.28;
  });

  function resize() {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    group.rotation.y += 0.0018;
    group.rotation.x += 0.0009;
    group.rotation.y += (targetX - group.rotation.y * 0.08) * 0.008;
    group.rotation.x += (targetY - group.rotation.x * 0.08) * 0.008;
    core.rotation.x += 0.004;
    core.rotation.y += 0.006;
    ring.rotation.z += 0.0025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);
}

initAIBackground();
