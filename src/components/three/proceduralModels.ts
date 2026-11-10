import * as THREE from 'three';

export interface SceneMaterials {
  darkMetal: THREE.MeshStandardMaterial;
  brushedSteel: THREE.MeshStandardMaterial;
  goldAccent: THREE.MeshStandardMaterial;
  glowCyan: THREE.MeshStandardMaterial;
  glowBlue: THREE.MeshStandardMaterial;
  opticalGlass: THREE.MeshPhysicalMaterial;
  contactShadow: THREE.MeshBasicMaterial;
}

export interface ExplodedPart {
  mesh: THREE.Object3D;
  initialY: number;
  explodeMultiplier: number;
}

export interface NexusModelResult {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  gyroRing: THREE.Mesh;
  haloRing: THREE.Mesh;
  explodedParts: ExplodedPart[];
}

export interface WorkstationPodResult {
  group: THREE.Group;
  beaconOrb: THREE.Mesh;
  explodedParts: ExplodedPart[];
}

/**
 * Builds the Central Command Nexus as a composite 11-part procedural THREE.Group
 * grounded at bottom-center with varied PBR roughness/metalness and contact shadow.
 */
export function createCommandNexus(
  materials: SceneMaterials,
  shadowTexture: THREE.CanvasTexture
): NexusModelResult {
  const group = new THREE.Group();
  group.name = 'CommandNexus';
  const explodedParts: ExplodedPart[] = [];

  // Ground Contact Shadow (flush at y = 0.01 to prevent z-fighting)
  const shadowGeo = new THREE.PlaneGeometry(13, 13);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  shadow.renderOrder = 0;
  group.add(shadow);

  // Part 1: Heavy Octagonal Foundation Plinth (Primary silhouette, ground flush)
  const baseGeo = new THREE.CylinderGeometry(4.4, 4.8, 0.45, 8);
  const baseMesh = new THREE.Mesh(baseGeo, materials.darkMetal);
  baseMesh.position.y = 0.225;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);
  explodedParts.push({ mesh: baseMesh, initialY: 0.225, explodeMultiplier: 0.0 });

  // Part 2: Sub-Deck Elevation Tier with Beveled Stepped Profile
  const deckGeo = new THREE.CylinderGeometry(3.8, 4.1, 0.35, 16);
  const deckMesh = new THREE.Mesh(deckGeo, materials.brushedSteel);
  deckMesh.position.y = 0.625;
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  group.add(deckMesh);
  explodedParts.push({ mesh: deckMesh, initialY: 0.625, explodeMultiplier: 0.3 });

  // Part 3: Inner Energy Housing Pedestal
  const collarGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.8, 16);
  const collarMesh = new THREE.Mesh(collarGeo, materials.darkMetal);
  collarMesh.position.y = 1.2;
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  group.add(collarMesh);
  explodedParts.push({ mesh: collarMesh, initialY: 1.2, explodeMultiplier: 0.6 });

  // Part 4: Floating Optical Glass Observation Ring
  const glassRingGeo = new THREE.TorusGeometry(3.1, 0.22, 16, 48);
  const glassRing = new THREE.Mesh(glassRingGeo, materials.opticalGlass);
  glassRing.rotation.x = Math.PI / 2;
  glassRing.position.y = 1.4;
  glassRing.castShadow = false;
  glassRing.receiveShadow = true;
  group.add(glassRing);
  explodedParts.push({ mesh: glassRing, initialY: 1.4, explodeMultiplier: 1.0 });

  // Part 5: Central Quantum Reactor Core (Glowing pulsing geometric core)
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const coreMesh = new THREE.Mesh(coreGeo, materials.glowCyan);
  coreMesh.position.y = 2.4;
  coreMesh.castShadow = true;
  group.add(coreMesh);
  explodedParts.push({ mesh: coreMesh, initialY: 2.4, explodeMultiplier: 1.5 });

  // Part 6: Rotating Gyroscopic Energy Accelerator Ring
  const gyroGeo = new THREE.TorusGeometry(1.85, 0.08, 12, 36);
  const gyroRing = new THREE.Mesh(gyroGeo, materials.goldAccent);
  gyroRing.position.y = 2.4;
  group.add(gyroRing);
  explodedParts.push({ mesh: gyroRing, initialY: 2.4, explodeMultiplier: 1.5 });

  // Part 7: Secondary Holographic Emitter Ring
  const haloGeo = new THREE.TorusGeometry(1.4, 0.05, 12, 32);
  const haloRing = new THREE.Mesh(haloGeo, materials.glowBlue);
  haloRing.rotation.x = Math.PI / 4;
  haloRing.position.y = 2.4;
  group.add(haloRing);
  explodedParts.push({ mesh: haloRing, initialY: 2.4, explodeMultiplier: 1.5 });

  // Parts 8-11: Four Perimeter Stabilizer Pylon Struts
  const strutAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  strutAngles.forEach((ang) => {
    const pylonGroup = new THREE.Group();
    pylonGroup.position.x = Math.cos(ang) * 3.4;
    pylonGroup.position.z = Math.sin(ang) * 3.4;
    pylonGroup.position.y = 1.6;

    // Strut column
    const strutGeo = new THREE.BoxGeometry(0.3, 1.8, 0.3);
    const strutMesh = new THREE.Mesh(strutGeo, materials.brushedSteel);
    strutMesh.castShadow = true;
    pylonGroup.add(strutMesh);

    // Strut top cap accent
    const capGeo = new THREE.BoxGeometry(0.36, 0.2, 0.36);
    const capMesh = new THREE.Mesh(capGeo, materials.goldAccent);
    capMesh.position.y = 0.95;
    pylonGroup.add(capMesh);

    // Glowing emitter tip
    const tipGeo = new THREE.SphereGeometry(0.12, 12, 8);
    const tipMesh = new THREE.Mesh(tipGeo, materials.glowCyan);
    tipMesh.position.y = 1.15;
    pylonGroup.add(tipMesh);

    group.add(pylonGroup);
    explodedParts.push({ mesh: pylonGroup, initialY: 1.6, explodeMultiplier: 0.8 });
  });

  return { group, coreMesh, gyroRing, haloRing, explodedParts };
}

/**
 * Builds an enterprise client workstation pod as a 7-part composite model.
 */
export function createClientWorkstationPod(
  name: string,
  x: number,
  z: number,
  angle: number,
  materials: SceneMaterials,
  shadowTexture: THREE.CanvasTexture,
  screenTexture: THREE.CanvasTexture
): WorkstationPodResult {
  const group = new THREE.Group();
  group.name = `Pod_${name}`;
  group.position.set(x, 0, z);
  group.rotation.y = angle;
  const explodedParts: ExplodedPart[] = [];

  // Ground Contact Shadow
  const shadowGeo = new THREE.PlaneGeometry(5.5, 5.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  // Part 1: Levitation Base Pad
  const padGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.25, 8);
  const padMesh = new THREE.Mesh(padGeo, materials.darkMetal);
  padMesh.position.y = 0.125;
  padMesh.castShadow = true;
  padMesh.receiveShadow = true;
  group.add(padMesh);
  explodedParts.push({ mesh: padMesh, initialY: 0.125, explodeMultiplier: 0.0 });

  // Part 2: Support Pedestal with Metallic Heatsink
  const colGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.9, 12);
  const colMesh = new THREE.Mesh(colGeo, materials.brushedSteel);
  colMesh.position.y = 0.7;
  colMesh.castShadow = true;
  group.add(colMesh);
  explodedParts.push({ mesh: colMesh, initialY: 0.7, explodeMultiplier: 0.4 });

  // Part 3: Console Deck Hull
  const consoleGeo = new THREE.BoxGeometry(2.4, 0.35, 1.6);
  const consoleMesh = new THREE.Mesh(consoleGeo, materials.darkMetal);
  consoleMesh.position.y = 1.325;
  consoleMesh.castShadow = true;
  group.add(consoleMesh);
  explodedParts.push({ mesh: consoleMesh, initialY: 1.325, explodeMultiplier: 0.8 });

  // Part 4: Holographic Display Screen (translucent glass with UI texture)
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const screenGeo = new THREE.PlaneGeometry(1.9, 1.2);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 2.1, -0.3);
  screenMesh.rotation.x = -0.15;
  group.add(screenMesh);
  explodedParts.push({ mesh: screenMesh, initialY: 2.1, explodeMultiplier: 1.3 });

  // Part 5: Glass Protective Shroud
  const glassGeo = new THREE.BoxGeometry(2.0, 1.3, 0.06);
  const glassMesh = new THREE.Mesh(glassGeo, materials.opticalGlass);
  glassMesh.position.set(0, 2.1, -0.32);
  glassMesh.rotation.x = -0.15;
  group.add(glassMesh);
  explodedParts.push({ mesh: glassMesh, initialY: 2.1, explodeMultiplier: 1.3 });

  // Part 6: Sensor Mast Antenna
  const mastGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.4, 8);
  const mastMesh = new THREE.Mesh(mastGeo, materials.goldAccent);
  mastMesh.position.set(1.0, 1.9, 0.6);
  group.add(mastMesh);
  explodedParts.push({ mesh: mastMesh, initialY: 1.9, explodeMultiplier: 1.0 });

  // Part 7: Telemetry Beacon Orb
  const orbGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const beaconOrb = new THREE.Mesh(orbGeo, materials.glowCyan);
  beaconOrb.position.set(1.0, 2.65, 0.6);
  group.add(beaconOrb);
  explodedParts.push({ mesh: beaconOrb, initialY: 2.65, explodeMultiplier: 1.5 });

  return { group, beaconOrb, explodedParts };
}

/**
 * Procedural curved energy conduit connecting the central nexus to client pods.
 */
export function createPipelineConduit(
  start: THREE.Vector3,
  end: THREE.Vector3,
  glowMaterial: THREE.Material
): THREE.Mesh {
  const midX = (start.x + end.x) * 0.5;
  const midZ = (start.z + end.z) * 0.5;
  const control = new THREE.Vector3(midX, 1.2, midZ);

  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.09, 8, false);
  const tube = new THREE.Mesh(tubeGeo, glowMaterial);
  tube.castShadow = true;
  return tube;
}
