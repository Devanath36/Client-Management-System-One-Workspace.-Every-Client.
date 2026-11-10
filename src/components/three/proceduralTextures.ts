import * as THREE from 'three';

/**
 * Creates a procedural high-tech circuit floor texture on a 2D HTML5 canvas.
 * Sets sRGBColorSpace and max anisotropy for razor-sharp rendering at grazing angles.
 */
export function createCircuitFloorTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep midnight-navy ground
    ctx.fillStyle = '#070d1e';
    ctx.fillRect(0, 0, size, size);

    // Primary grid lines
    ctx.strokeStyle = 'rgba(30, 58, 110, 0.4)';
    ctx.lineWidth = 1.5;
    const step = 64;
    for (let x = 0; x <= size; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Secondary subgrid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 0.8;
    for (let x = 0; x <= size; x += step * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += step * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // High-tech circuit traces & glowing intersection pads
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const nodes = [
      [256, 256], [512, 256], [768, 256],
      [256, 512], [512, 512], [768, 512],
      [256, 768], [512, 768], [768, 768],
    ];

    nodes.forEach(([x, y]) => {
      // Glow circle
      const radGrad = ctx.createRadialGradient(x, y, 2, x, y, 16);
      radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      radGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
      radGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Connecting circuit runs
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(384, 256);
    ctx.lineTo(448, 320);
    ctx.lineTo(512, 320);
    ctx.lineTo(512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(768, 768);
    ctx.lineTo(640, 768);
    ctx.lineTo(576, 704);
    ctx.lineTo(512, 704);
    ctx.stroke();

    // Coordinate markers
    ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.font = '12px monospace';
    ctx.fillText('NEXUS-01 [42.8N]', 270, 250);
    ctx.fillText('NODE-ALPHA [SEC-7]', 526, 506);
    ctx.fillText('DATA-SLOT [88.2%]', 782, 762);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

/**
 * Creates a soft radial contact shadow texture for grounding 3D props flush to the floor.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(2, 6, 23, 0.85)');
    gradient.addColorStop(0.35, 'rgba(2, 6, 23, 0.55)');
    gradient.addColorStop(0.75, 'rgba(2, 6, 23, 0.18)');
    gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates procedural holographic HUD screen textures with dynamic typography and charts.
 */
export function createHoloScreenTexture(
  title: string,
  badge: string,
  lines: string[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Semi-translucent dark glass background
    ctx.fillStyle = 'rgba(7, 18, 42, 0.85)';
    ctx.fillRect(0, 0, 512, 320);

    // Glowing border outline
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 312);

    // Corner accents
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    const corner = 24;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(4, 4 + corner);
    ctx.lineTo(4, 4);
    ctx.lineTo(4 + corner, 4);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(508 - corner, 4);
    ctx.lineTo(508, 4);
    ctx.lineTo(508, 4 + corner);
    ctx.stroke();

    // Top status strip
    ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
    ctx.fillRect(8, 8, 496, 44);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(title, 24, 38);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`[ ${badge} ]`, 370, 38);

    // Content lines
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    lines.forEach((line, i) => {
      ctx.fillText(line, 24, 90 + i * 36);
    });

    // Holographic mini bar chart
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    const bars = [45, 68, 92, 54, 86, 95, 78, 88];
    bars.forEach((val, i) => {
      const h = (val / 100) * 60;
      ctx.fillRect(24 + i * 56, 280 - h, 38, h);
    });

    // Baseline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 280);
    ctx.lineTo(480, 280);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
