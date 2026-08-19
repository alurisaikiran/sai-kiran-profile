"use client";

import { useEffect, useRef } from "react";

/** Three.js particle network — gold/cinematic palette */
export default function AIBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero   = canvas?.closest(".hero") as HTMLElement | null;
    if (!canvas || !hero) return;

    let frame = 0;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed) return;

      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = 8;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

      const group = new THREE.Group();
      scene.add(group);

      const count = window.innerWidth < 760 ? 100 : 180;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const r     = 3.4 + Math.random() * 2.8;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      // Gold particles
      group.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color: 0xD4AF37,
            size: window.innerWidth < 760 ? 0.048 : 0.036,
            transparent: true,
            opacity: 0.75,
          })
        )
      );

      // Amber connection lines
      const linePos: number[] = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j += 10) {
          const [ax, ay, az] = [positions[i*3], positions[i*3+1], positions[i*3+2]];
          const [bx, by, bz] = [positions[j*3], positions[j*3+1], positions[j*3+2]];
          if (Math.hypot(ax-bx, ay-by, az-bz) < 1.4) {
            linePos.push(ax, ay, az, bx, by, bz);
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
      group.add(
        new THREE.LineSegments(
          lineGeo,
          new THREE.LineBasicMaterial({ color: 0xB8961E, transparent: true, opacity: 0.18 })
        )
      );

      // Wireframe icosahedron — warm bronze
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.2, 1),
        new THREE.MeshBasicMaterial({ color: 0xC4956A, wireframe: true, transparent: true, opacity: 0.14 })
      );
      group.add(core);

      // Orbiting torus — gold
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.012, 10, 96),
        new THREE.MeshBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: 0.22 })
      );
      ring.rotation.x = Math.PI / 2.8;
      group.add(ring);

      // Second torus at different angle
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.0, 0.008, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0xE8C547, transparent: true, opacity: 0.1 })
      );
      ring2.rotation.y = Math.PI / 4;
      group.add(ring2);

      let targetX = 0, targetY = 0;

      const onPointerMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        targetX = ((e.clientX - r.left) / r.width  - 0.5) * 0.4;
        targetY = ((e.clientY - r.top)  / r.height - 0.5) * 0.32;
      };

      const resize = () => {
        const { width, height } = hero.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const animate = () => {
        group.rotation.y += 0.0016;
        group.rotation.x += 0.0008;
        group.rotation.y += (targetX - group.rotation.y * 0.08) * 0.007;
        group.rotation.x += (targetY - group.rotation.x * 0.08) * 0.007;
        core.rotation.x  += 0.003;
        core.rotation.y  += 0.005;
        ring.rotation.z  += 0.002;
        ring2.rotation.x += 0.0015;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };

      hero.addEventListener("pointermove", onPointerMove);
      window.addEventListener("resize", resize);
      resize();
      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        hero.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", resize);
        renderer.dispose();
      };
    });

    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <canvas className="ai-bg" aria-hidden="true" ref={canvasRef} />;
}
