import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createCircuitFloorTexture,
  createContactShadowTexture,
  createHoloScreenTexture,
} from './proceduralTextures';
import {
  createCommandNexus,
  createClientWorkstationPod,
  createPipelineConduit,
  SceneMaterials,
  NexusModelResult,
  WorkstationPodResult,
} from './proceduralModels';
import {
  Layers,
  Camera,
  RotateCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  Shield,
  Activity,
  Maximize2,
  Check,
} from 'lucide-react';

interface ThreeUniverseSceneProps {
  onExit?: () => void;
}

type FinishPreset = 'crimson-obsidian' | 'matte-graphite' | 'solar-orange' | 'amber-gold';
type CameraPreset = 'overview' | 'nexus-core' | 'client-pod' | 'pipeline-stream';

// Pre-allocated scratch helpers at module scope to avoid GC in animation loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _color = new THREE.Color();

export const ThreeUniverseScene: React.FC<ThreeUniverseSceneProps> = ({ onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI State
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0.0);
  const [finishPreset, setFinishPreset] = useState<FinishPreset>('crimson-obsidian');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [fps, setFps] = useState(60);

  // Mutable refs to bridge UI changes into the animation loop without restarting WebGL
  const loopStateRef = useRef({
    explodedFactor: 0.0,
    currentExploded: 0.0,
    finishPreset: 'crimson-obsidian' as FinishPreset,
    autoRotate: true,
    rotationSpeed: 1.0,
    cameraTargetPos: new THREE.Vector3(15, 12, 19),
    cameraTargetLookAt: new THREE.Vector3(0, 1.8, 0),
    isTransitioningCamera: false,
    particlesCount: 120,
  });

  // Keep refs in sync with React state
  useEffect(() => {
    loopStateRef.current.explodedFactor = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    loopStateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    loopStateRef.current.rotationSpeed = rotationSpeed;
  }, [rotationSpeed]);

  // Camera preset handler
  const handleSelectCamera = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    const s = loopStateRef.current;
    s.isTransitioningCamera = true;

    switch (preset) {
      case 'overview':
        s.cameraTargetPos.set(15, 12, 19);
        s.cameraTargetLookAt.set(0, 1.8, 0);
        break;
      case 'nexus-core':
        s.cameraTargetPos.set(0, 3.2, 5.8);
        s.cameraTargetLookAt.set(0, 2.4, 0);
        break;
      case 'client-pod':
        s.cameraTargetPos.set(11, 4.2, 3.5);
        s.cameraTargetLookAt.set(8.5, 1.6, 0);
        break;
      case 'pipeline-stream':
        s.cameraTargetPos.set(5.5, 6.5, 10.5);
        s.cameraTargetLookAt.set(4.2, 1.4, 0);
        break;
    }
  }, []);

  // Keyboard shortcut listener ('H' to toggle HUD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsControlsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WebGL Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Modern Renderer, Color Pipeline & Tone Mapping
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Horizon-Matched Atmosphere Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c0c);
    scene.fog = new THREE.FogExp2(0x0c0c0c, 0.016);

    // 4. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Perspective Camera & Damped OrbitControls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 19);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above floor
    controls.minDistance = 4.5;
    controls.maxDistance = 55;
    controls.target.set(0, 1.8, 0);
    controls.update();

    // Cancel scripted camera transitions when user manually rotates
    controls.addEventListener('start', () => {
      loopStateRef.current.isTransitioningCamera = false;
    });

    // 6. Studio Lighting Rig: Warm Key Light + Neutral Hemisphere Fill + Orange Rim
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(14, 22, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    const d = 15;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x101010, 1.3);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xff7900, 1.4);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 7. Procedural Ground Grid Floor
    const floorTexture = createCircuitFloorTexture(renderer);
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.85,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // 8. Shared PBR Materials
    const contactShadowTexture = createContactShadowTexture();

    const materials: SceneMaterials = {
      darkMetal: new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.35,
        metalness: 0.85,
      }),
      brushedSteel: new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.2,
        metalness: 0.95,
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: 0xffc928,
        roughness: 0.25,
        metalness: 0.9,
      }),
      glowCyan: new THREE.MeshStandardMaterial({
        color: 0xe50914,
        emissive: 0xe50914,
        emissiveIntensity: 1.6,
        roughness: 0.2,
        metalness: 0.5,
      }),
      glowBlue: new THREE.MeshStandardMaterial({
        color: 0xff7900,
        emissive: 0xff7900,
        emissiveIntensity: 1.4,
        roughness: 0.2,
        metalness: 0.4,
      }),
      opticalGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.08,
        transmission: isSoftwareGl ? 0 : 0.9,
        transparent: true,
        opacity: isSoftwareGl ? 0.35 : 1.0,
        ior: 1.52,
        thickness: 1.2,
      }),
      contactShadow: new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    };

    // 9. Procedural Holographic Monitors for Satellite Pods
    const screenAlpha = createHoloScreenTexture('CLIENT PORTFOLIO', 'LIVE SLA 99.8%', [
      'Account: Nexus Enterprise Corp',
      'Active Projects: 4 In-Flight',
      'Pending Reviews: 2 Deliverables',
      'Next Milestone: 14:00 UTC',
    ]);
    const screenBeta = createHoloScreenTexture('TASK EXECUTION HUB', 'ON TRACK', [
      'Assigned Focus: 18 Tasks',
      'Tasks Completed: 94.2%',
      'SLA Overdue: 0 Breaches',
      'Sprint Status: On Schedule',
    ]);
    const screenGamma = createHoloScreenTexture('DELIVERY PIPELINES', 'CONNECTED', [
      'Pipeline Nodes: 3 Workspaces',
      'Role Isolation: Active (4 Roles)',
      'Security Audit: Confirmed',
      'Realtime Sync: 60 FPS',
    ]);

    // 10. Assemble Central Command Nexus
    const nexus = createCommandNexus(materials, contactShadowTexture);
    scene.add(nexus.group);

    // 11. Assemble 3 Client Workstation Satellite Pods
    const podAlpha = createClientWorkstationPod(
      'Alpha',
      8.5,
      0,
      -Math.PI / 2,
      materials,
      contactShadowTexture,
      screenAlpha
    );
    const podBeta = createClientWorkstationPod(
      'Beta',
      -4.25,
      7.36,
      Math.PI / 6,
      materials,
      contactShadowTexture,
      screenBeta
    );
    const podGamma = createClientWorkstationPod(
      'Gamma',
      -4.25,
      -7.36,
      (5 * Math.PI) / 6,
      materials,
      contactShadowTexture,
      screenGamma
    );

    scene.add(podAlpha.group);
    scene.add(podBeta.group);
    scene.add(podGamma.group);

    const allPods: WorkstationPodResult[] = [podAlpha, podBeta, podGamma];

    // 12. Connect Curved Energy Conduits
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0xff7900,
      emissive: 0xe50914,
      emissiveIntensity: 1.8,
      roughness: 0.3,
      metalness: 0.7,
    });

    const pipeAlpha = createPipelineConduit(
      new THREE.Vector3(3.2, 0.4, 0),
      new THREE.Vector3(7.2, 0.4, 0),
      pipeMat
    );
    const pipeBeta = createPipelineConduit(
      new THREE.Vector3(-1.6, 0.4, 2.77),
      new THREE.Vector3(-3.6, 0.4, 6.2),
      pipeMat
    );
    const pipeGamma = createPipelineConduit(
      new THREE.Vector3(-1.6, 0.4, -2.77),
      new THREE.Vector3(-3.6, 0.4, -6.2),
      pipeMat
    );

    scene.add(pipeAlpha);
    scene.add(pipeBeta);
    scene.add(pipeGamma);

    // 13. High-Performance InstancedMesh Data Particles Cloud (120 Nodes)
    const particleCount = 120;
    const particleGeo = new THREE.IcosahedronGeometry(0.08, 1);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffc928,
      wireframe: true,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    instancedParticles.frustumCulled = false;

    // Seed particle orbit radii and speeds
    const particleData: { radius: number; speed: number; y: number; phase: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 8.5;
      const speed = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);
      const y = 0.5 + Math.random() * 4.5;
      const phase = Math.random() * Math.PI * 2;
      particleData.push({ radius, speed, y, phase });

      _vec3A.set(Math.cos(phase) * radius, y, Math.sin(phase) * radius);
      _mat4.makeTranslation(_vec3A.x, _vec3A.y, _vec3A.z);
      instancedParticles.setMatrixAt(i, _mat4);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    scene.add(instancedParticles);

    // Handle Finish Preset changes
    const applyFinish = (preset: FinishPreset) => {
      switch (preset) {
        case 'crimson-obsidian':
          materials.darkMetal.color.setHex(0x101010);
          materials.brushedSteel.color.setHex(0x333333);
          materials.glowCyan.color.setHex(0xe50914);
          materials.glowCyan.emissive.setHex(0xe50914);
          keyLight.color.setHex(0xfff7ed);
          scene.fog!.color.setHex(0x0c0c0c);
          scene.background = new THREE.Color(0x0c0c0c);
          break;
        case 'matte-graphite':
          materials.darkMetal.color.setHex(0x171717);
          materials.brushedSteel.color.setHex(0x555555);
          materials.glowCyan.color.setHex(0xffffff);
          materials.glowCyan.emissive.setHex(0xe50914);
          keyLight.color.setHex(0xffffff);
          scene.fog!.color.setHex(0x141414);
          scene.background = new THREE.Color(0x141414);
          break;
        case 'solar-orange':
          materials.darkMetal.color.setHex(0x17120e);
          materials.brushedSteel.color.setHex(0x44332a);
          materials.glowCyan.color.setHex(0xff7900);
          materials.glowCyan.emissive.setHex(0xff7900);
          keyLight.color.setHex(0xffedd5);
          scene.fog!.color.setHex(0x120d0a);
          scene.background = new THREE.Color(0x120d0a);
          break;
        case 'amber-gold':
          materials.darkMetal.color.setHex(0x1a160c);
          materials.brushedSteel.color.setHex(0x4a3e22);
          materials.glowCyan.color.setHex(0xffc928);
          materials.glowCyan.emissive.setHex(0xff7900);
          keyLight.color.setHex(0xfffbeb);
          scene.fog!.color.setHex(0x141008);
          scene.background = new THREE.Color(0x141008);
          break;
      }
    };

    // 14. Responsive Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 15. Damped Render & Simulation Loop
    let frameId = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Track FPS
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      const s = loopStateRef.current;

      // Check finish preset update
      if (s.finishPreset !== finishPreset) {
        s.finishPreset = finishPreset;
        applyFinish(finishPreset);
      }

      // Smoothly damp exploded view height
      s.currentExploded = THREE.MathUtils.damp(
        s.currentExploded,
        s.explodedFactor,
        8,
        delta
      );

      // Apply exploded view translation to nexus parts
      nexus.explodedParts.forEach((part) => {
        part.mesh.position.y = part.initialY + s.currentExploded * part.explodeMultiplier * 2.2;
      });

      // Apply exploded view translation to satellite pods
      allPods.forEach((pod) => {
        pod.explodedParts.forEach((part) => {
          part.mesh.position.y = part.initialY + s.currentExploded * part.explodeMultiplier * 1.5;
        });
      });

      // Smooth Camera Transitions when selecting presets
      if (s.isTransitioningCamera) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, s.cameraTargetPos.x, 4.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, s.cameraTargetPos.y, 4.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraTargetPos.z, 4.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, s.cameraTargetLookAt.x, 4.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, s.cameraTargetLookAt.y, 4.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, s.cameraTargetLookAt.z, 4.5, delta);

        if (camera.position.distanceTo(s.cameraTargetPos) < 0.08) {
          s.isTransitioningCamera = false;
        }
      }

      // Gyroscopic Reactor Core & Ring Kinematics
      const timeSec = now * 0.001;
      nexus.coreMesh.rotation.y += delta * 0.45;
      nexus.coreMesh.rotation.x = Math.sin(timeSec * 0.8) * 0.15;

      nexus.gyroRing.rotation.x += delta * 0.9;
      nexus.gyroRing.rotation.y += delta * 0.6;

      nexus.haloRing.rotation.z += delta * 0.7;

      // Pulse beacon orbs on satellite pods
      allPods.forEach((pod, idx) => {
        const pulse = 1.0 + Math.sin(timeSec * 3 + idx * 2) * 0.15;
        pod.beaconOrb.scale.set(pulse, pulse, pulse);
      });

      // Orbit particles around the command nexus
      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        p.phase += p.speed * delta;
        _vec3A.set(Math.cos(p.phase) * p.radius, p.y + Math.sin(p.phase * 2) * 0.3, Math.sin(p.phase) * p.radius);
        _mat4.makeTranslation(_vec3A.x, _vec3A.y, _vec3A.z);
        instancedParticles.setMatrixAt(i, _mat4);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;

      // Auto-rotation when not interacting
      if (s.autoRotate && !s.isTransitioningCamera) {
        nexus.group.rotation.y += delta * 0.12 * s.rotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Pre-warm WebGL shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
      frameId = requestAnimationFrame(tick);
    } else {
      tick();
    }

    // 16. Cleanup & Resource Disposal on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        window.clearTimeout(frameId);
      } else {
        cancelAnimationFrame(frameId);
      }

      controls.dispose();
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      floorTexture.dispose();
      contactShadowTexture.dispose();
      screenAlpha.dispose();
      screenBeta.dispose();
      screenGamma.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      Object.values(materials).forEach((m) => m.dispose());

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [finishPreset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#101010] select-none">
      {/* Isolated WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ========================================================= */}
      {/* MINIMAL TOP-LEFT HUD STRIP (Zero Central Occlusion)       */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold text-white bg-[#171717]/95 hover:bg-[#202020] border border-[#333333] shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
            title="Exit 3D Scene"
          >
            <ArrowLeft className="w-4 h-4 text-[#E50914]" />
            <span>Return to Workspace</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-[#171717]/95 border border-[#333333] text-xs shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[#FFC928]" />
          <span className="font-bold text-white tracking-wide">3D Command Universe</span>
          <span className="text-[#555555]">|</span>
          <span className="text-[#A3A3A3] font-mono text-[11px]">{fps} FPS Studio PBR</span>
        </div>
      </div>

      {/* Top-Right Quick Legend */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171717]/95 border border-[#333333] text-[11px] text-[#D4D4D4] shadow-lg">
        <span className="text-[#A3A3A3]">Drag to orbit • Scroll to zoom • Press</span>
        <kbd className="px-1.5 py-0.5 bg-[#202020] border border-[#333333] rounded text-[#FFC928] font-mono text-[10px]">
          H
        </kbd>
        <span className="text-[#A3A3A3]">to toggle HUD</span>
      </div>

      {/* ========================================================= */}
      {/* VIEWPORT-FIRST COLLAPSIBLE BOTTOM CONTROL DOCK            */}
      {/* <= 15% Viewport footprint, solid/rgba (No backdrop-filter)*/}
      {/* ========================================================= */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[920px] transition-transform duration-300 ease-out ${
          isControlsCollapsed ? 'translate-y-[calc(100%+16px)]' : 'translate-y-0'
        }`}
      >
        {/* Dock Collapse / Expand Toggle Button Pinned to Top-Center */}
        <div className="flex justify-center -mb-px">
          <button
            type="button"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-4 py-1.5 rounded-t-xl text-xs font-semibold text-[#D4D4D4] hover:text-white bg-[#171717] border-t border-x border-[#333333] shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Solid Control Panel (NO backdrop-filter over WebGL) */}
        <div className="bg-[#141414] border border-[#333333] rounded-2xl shadow-2xl p-4 sm:p-5 text-xs text-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* 1. Exploded View Slider */}
            <div className="md:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#D4D4D4] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FF7900]" />
                  <span>Exploded Architecture</span>
                </span>
                <span className="font-mono text-[#FF7900] font-semibold">
                  {Math.round(explodedFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#202020] rounded-lg appearance-none cursor-pointer accent-[#E50914]"
              />
            </div>

            {/* 2. Camera View Presets */}
            <div className="md:col-span-5 space-y-1.5">
              <span className="font-bold text-[#D4D4D4] block text-xs">
                Camera Perspective Presets
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'overview', label: 'Overview' },
                    { id: 'nexus-core', label: 'Nexus' },
                    { id: 'client-pod', label: 'Pod' },
                    { id: 'pipeline-stream', label: 'Pipeline' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCamera(c.id)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center truncate transition-colors cursor-pointer border ${
                      cameraPreset === c.id
                        ? 'bg-[#E50914] text-white border-[#E50914] shadow-xs'
                        : 'bg-[#171717] text-[#D4D4D4] border-[#333333] hover:bg-[#202020] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Kinetic Rotation & Speed */}
            <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0 border-t md:border-t-0 border-[#333333]">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  autoRotate
                    ? 'bg-[#E50914]/15 text-[#FFC928] border-[#E50914]/40'
                    : 'bg-[#171717] text-[#A3A3A3] border-[#333333] hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'text-[#FFC928]' : ''}`} />
                <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] font-mono text-[#A3A3A3]">
                <button
                  type="button"
                  onClick={() => setRotationSpeed((s) => Math.max(0.5, s - 0.5))}
                  className="w-6 h-6 rounded bg-[#202020] hover:bg-[#333333] flex items-center justify-center text-[#D4D4D4] cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center">{rotationSpeed}x</span>
                <button
                  type="button"
                  onClick={() => setRotationSpeed((s) => Math.min(3.0, s + 0.5))}
                  className="w-6 h-6 rounded bg-[#202020] hover:bg-[#333333] flex items-center justify-center text-[#D4D4D4] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Sub-row: Finish & Lighting Presets */}
          <div className="pt-3 border-t border-[#333333] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#A3A3A3] text-[11px] font-medium">
              Studio Atmosphere & Material Swatch:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { id: 'crimson-obsidian', label: 'Crimson Obsidian', dot: 'bg-[#E50914]' },
                  { id: 'matte-graphite', label: 'Matte Graphite', dot: 'bg-[#D4D4D4]' },
                  { id: 'solar-orange', label: 'Solar Orange', dot: 'bg-[#FF7900]' },
                  { id: 'amber-gold', label: 'Amber Gold', dot: 'bg-[#FFC928]' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinishPreset(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    finishPreset === f.id
                      ? 'bg-[#202020] text-white border-[#E50914] shadow-xs'
                      : 'bg-[#171717] text-[#A3A3A3] border-[#333333] hover:border-[#555555] hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
