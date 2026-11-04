import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CarbonGlobe = ({ co2 = 44 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Globe
    const globeGeo = new THREE.SphereGeometry(1, 48, 48);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0b113a,
      emissive: 0x001133,
      specular: 0x00d2ff,
      shininess: 30,
      transparent: true,
      opacity: 0.9
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe
    const wireGeo = new THREE.SphereGeometry(1.005, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true, transparent: true, opacity: 0.12 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Hotspot points
    const hotspots = [];
    const count = Math.max(6, Math.min(40, Math.round(co2 / 1.2)));
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.02;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const size = 0.012 + Math.random() * 0.02;
      const geo = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xff4b4b : i % 3 === 1 ? 0xffbb00 : 0x00ff87 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      hotspots.push(mesh);
    }

    // Lights
    const ambient = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00d2ff, 1.2, 10);
    point.position.set(2, 2, 2);
    scene.add(point);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      globe.rotation.y += 0.003;
      wire.rotation.y += 0.003;
      hotspots.forEach((h, i) => {
        h.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + i) * 0.3);
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [co2]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '320px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(0,20,60,0.6), rgba(5,8,22,0.9))',
        border: '1px solid rgba(0,210,255,0.2)'
      }}
    />
  );
};

export default CarbonGlobe;
