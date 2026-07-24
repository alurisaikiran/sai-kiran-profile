/**
 * Three.js particle network rendered on the hero canvas.
 * Extracted from the original monolithic script so it can be imported
 * as a pure side-effect module and tested in isolation.
 */

export function initAIBackground() {
  const canvas = document.querySelector("#ai-bg");
  const hero   = document.querySelector(".hero");

  if (!canvas || !hero || !window.THREE) return;

  const { THREE } = window;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = window.innerWidth < 760 ? 90 : 150;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 3.2 + Math.random() * 2.6;
    const theta  = Math.random() * Math.PI * 2;
    const phi    = Math.acos(Math.random() * 2 - 1);
    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x10c8d2,
    size: window.innerWidth < 760 ? 0.045 : 0.035,
    transparent: true,
    opacity: 0.82,
  })));

  const linePositions = [];
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j += 11) {
      const [ax, ay, az] = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
      const [bx, by, bz] = [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]];
      if (Math.hypot(ax - bx, ay - by, az - bz) < 1.32) {
        linePositions.push(ax, ay, az, bx, by, bz);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  group.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.22 })));

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 1),
    new THREE.MeshBasicMaterial({ color: 0xf05d52, wireframe: true, transparent: true, opacity: 0.16 })
  );
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.01, 12, 96),
    new THREE.MeshBasicMaterial({ color: 0x9bc53d, transparent: true, opacity: 0.18 })
  );
  ring.rotation.x = Math.PI / 2.7;
  group.add(ring);

  let targetX = 0, targetY = 0;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    targetX = ((e.clientX - r.left)  / r.width  - 0.5) * 0.35;
    targetY = ((e.clientY - r.top)   / r.height - 0.5) * 0.28;
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
    core.rotation.x  += 0.004;
    core.rotation.y  += 0.006;
    ring.rotation.z  += 0.0025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);
}
