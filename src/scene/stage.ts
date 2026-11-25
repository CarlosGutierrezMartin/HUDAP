import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ANCHORS, buildCloud } from './bodyGeometry';
import { createParticleMaterial } from './particleMaterial';
import { breath, contraction } from './ecg';
import { GROUP, type OrganKey } from '../content/groups';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  onHover: (organ: OrganKey | null, clientX: number, clientY: number) => void;
  onPick: (organ: OrganKey | null) => void;
}

type Tier = 'low' | 'mid' | 'high';

const BUDGET: Record<Tier, number> = { low: 16000, mid: 30000, high: 52000 };

function detectTier(): Tier {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (mem <= 2 || cores <= 2) return 'low';
  if (coarse || mem <= 4 || cores < 8) return 'mid';
  return 'high';
}

/** Where the camera looks and how far it sits for each organ. */
const FOCUS: Record<OrganKey | 'home', { target: THREE.Vector3; dist: number }> = {
  home: { target: new THREE.Vector3(0, 0.93, 0), dist: 0 },
  heart: { target: ANCHORS.heart, dist: 1.45 },
  eyes: { target: ANCHORS.eyes.clone().setZ(0.05), dist: 0.95 },
  brain: { target: ANCHORS.brain.clone().setY(1.66), dist: 1.15 },
  lungs: { target: ANCHORS.lungs, dist: 1.7 },
  blood: { target: new THREE.Vector3(0, 0.93, 0), dist: 0 },
};

/** Invisible shapes used for picking, in priority order (small targets first). */
function buildProxies(): { mesh: THREE.Mesh; organ: OrganKey }[] {
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  const out: { mesh: THREE.Mesh; organ: OrganKey }[] = [];
  const add = (organ: OrganKey, geo: THREE.BufferGeometry, pos: THREE.Vector3, rotZ = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.rotation.z = rotZ;
    m.updateMatrixWorld();
    out.push({ mesh: m, organ });
  };
  add('eyes', new THREE.BoxGeometry(0.11, 0.035, 0.06), new THREE.Vector3(0, 1.655, 0.08));
  add('heart', new THREE.SphereGeometry(0.065, 16, 12), ANCHORS.heart);
  add('brain', new THREE.SphereGeometry(0.11, 16, 12), new THREE.Vector3(0, 1.69, 0));
  add('lungs', new THREE.CylinderGeometry(0.17, 0.15, 0.3, 16), ANCHORS.lungs);
  for (const s of [-1, 1]) {
    add('blood', new THREE.CylinderGeometry(0.05, 0.04, 0.6, 10), new THREE.Vector3(0.25 * s, 1.12, 0.01), 0.12 * s);
    add('blood', new THREE.CylinderGeometry(0.09, 0.05, 0.9, 10), new THREE.Vector3(0.1 * s, 0.5, 0));
  }
  add('blood', new THREE.CylinderGeometry(0.16, 0.17, 0.22, 16), new THREE.Vector3(0, 1.03, 0));
  return out;
}

export class Stage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private material = createParticleMaterial();
  private geometry = new THREE.BufferGeometry();
  private points: THREE.Points;
  private proxies = buildProxies();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Clock();
  private tier: Tier;
  private count: number;
  private reducedMotion: boolean;
  private focus: OrganKey | null = null;
  private hover: OrganKey | null = null;
  private introStart = 0;
  private lastInteraction = 0;
  private running = true;
  private frameTimes: number[] = [];
  private qualityLocked = false;
  private maxPixelRatio: number;
  /** Fraction of the viewport covered by UI, so the body is framed in the free space. */
  private inset = { right: 0, bottom: 0, top: 0 };
  private flight: { fromT: THREE.Vector3; toT: THREE.Vector3; fromP: THREE.Vector3; toP: THREE.Vector3; t0: number; dur: number } | null = null;

  constructor(private opts: StageOptions) {
    this.reducedMotion = opts.reducedMotion;
    this.tier = detectTier();
    this.maxPixelRatio = this.tier === 'high' ? 2 : 1.5;

    this.renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.maxPixelRatio));
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);
    this.camera.position.set(0, 1.05, 4.5);

    const cloud = buildCloud(BUDGET[this.tier]);
    this.count = cloud.count;
    this.geometry.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
    this.geometry.setAttribute('aScatter', new THREE.BufferAttribute(cloud.scatter, 3));
    this.geometry.setAttribute('aGroup', new THREE.BufferAttribute(cloud.groups, 1));
    this.geometry.setAttribute('aRand', new THREE.BufferAttribute(cloud.rand, 3));
    this.geometry.setAttribute('aFlow', new THREE.BufferAttribute(cloud.flow, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.95, 0), 3.2);
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.controls = new OrbitControls(this.camera, opts.canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.6;
    this.controls.minPolarAngle = Math.PI * 0.28;
    this.controls.maxPolarAngle = Math.PI * 0.68;
    this.controls.minDistance = 0.4;
    this.controls.maxDistance = 7;
    this.controls.target.copy(FOCUS.home.target);
    this.controls.autoRotateSpeed = 0.55;
    this.controls.addEventListener('start', () => { this.lastInteraction = performance.now(); this.flight = null; });

    this.material.uniforms.uMotion.value = this.reducedMotion ? 0 : 1;
    if (this.reducedMotion) this.material.uniforms.uIntro.value = 1;

    this.bindPointer();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.running = document.visibilityState === 'visible';
      if (this.running) this.clock.getDelta();
    });

    this.introStart = performance.now();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  get particleCount() { return this.count; }
  get qualityTier() { return this.tier; }

  setReducedMotion(v: boolean) {
    this.reducedMotion = v;
    this.material.uniforms.uMotion.value = v ? 0 : 1;
    if (v) this.material.uniforms.uIntro.value = 1;
  }

  /** Tell the stage how much of the viewport the panel covers (0..1). */
  setInset(right: number, bottom: number, top = 0) {
    const changed = right !== this.inset.right || bottom !== this.inset.bottom || top !== this.inset.top;
    this.inset = { right, bottom, top };
    this.applyViewOffset();
    // Re-frame the full body when the free area changes.
    if (changed && (!this.focus || this.focus === 'blood')) this.focusOn(this.focus);
  }

  focusOn(organ: OrganKey | null) {
    this.focus = organ;
    this.material.uniforms.uFocus.value = organ ? GROUP[organ] : -1;
    const f = FOCUS[organ ?? 'home'];
    const dist = f.dist || this.homeDistance();
    // Keep the current horizontal viewing angle so the move feels continuous,
    // but bias towards the front of the body where organs read best.
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    dir.y = 0;
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();
    const front = new THREE.Vector3(0.18, 0, 1).normalize();
    if (organ && organ !== 'blood') dir.lerp(front, 0.85).normalize();
    const toP = f.target.clone().addScaledVector(dir, dist).add(new THREE.Vector3(0, dist * 0.08, 0));
    this.flyTo(f.target, toP);
    this.lastInteraction = performance.now();
  }

  private flyTo(target: THREE.Vector3, position: THREE.Vector3) {
    if (this.reducedMotion) {
      this.controls.target.copy(target);
      this.camera.position.copy(position);
      this.flight = null;
      return;
    }
    this.flight = {
      fromT: this.controls.target.clone(), toT: target.clone(),
      fromP: this.camera.position.clone(), toP: position.clone(),
      t0: performance.now(), dur: 1100,
    };
  }

  private homeDistance(): number {
    // Fit a ~2 m tall, 0.84 m wide figure inside the part of the viewport not covered by UI.
    const el = this.renderer.domElement;
    const fw = Math.max(0.3, 1 - this.inset.right);
    const fh = Math.max(0.3, 1 - this.inset.bottom - this.inset.top);
    const aspect = el.clientWidth / Math.max(1, el.clientHeight);
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const byHeight = 1.0 / (tanV * fh);
    const byWidth = 0.42 / (tanV * aspect * fw);
    return Math.max(byHeight, byWidth) * 1.02;
  }

  private resize() {
    const el = this.renderer.domElement;
    const w = el.clientWidth;
    const h = el.clientHeight;
    this.renderer.setSize(w, h, false);
    const pr = this.renderer.getPixelRatio();
    this.material.uniforms.uPixelRatio.value = pr * (h / 900);
    this.material.uniforms.uMaxSize.value = 4.5 * pr;
    this.applyViewOffset();
    if (!this.focus || this.focus === 'blood') this.focusOn(this.focus);
  }

  private applyViewOffset() {
    const el = this.renderer.domElement;
    const w = el.clientWidth;
    const h = el.clientHeight;
    this.camera.aspect = w / Math.max(1, h);
    // Shift the projection centre into the free area (left of a side panel, above a bottom sheet).
    const ox = (this.inset.right * w) / 2;
    const oy = ((this.inset.bottom - this.inset.top) * h) / 2;
    if (ox || oy) this.camera.setViewOffset(w, h, ox, oy, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private bindPointer() {
    const el = this.opts.canvas;
    let downAt = { x: 0, y: 0, t: 0 };
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const organ = this.pick(e.clientX, e.clientY);
      if (organ !== this.hover) {
        this.hover = organ;
        this.material.uniforms.uHover.value = organ ? GROUP[organ] : -1;
        el.style.cursor = organ ? 'pointer' : 'grab';
      }
      this.opts.onHover(organ, e.clientX, e.clientY);
    });
    el.addEventListener('pointerleave', () => {
      this.hover = null;
      this.material.uniforms.uHover.value = -1;
      this.opts.onHover(null, 0, 0);
    });
    el.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    el.addEventListener('pointerup', (e) => {
      // Treat as a tap only if the pointer barely moved: drags rotate the body.
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      if (moved > 8 || performance.now() - downAt.t > 450) return;
      const organ = this.pick(e.clientX, e.clientY);
      if (organ) this.opts.onPick(organ);
    });
  }

  private pick(clientX: number, clientY: number): OrganKey | null {
    const rect = this.opts.canvas.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    let best: { organ: OrganKey; d: number } | null = null;
    for (const p of this.proxies) {
      const hit = this.raycaster.intersectObject(p.mesh, false)[0];
      if (!hit) continue;
      // Small organs win ties against the large shapes that contain them.
      const bias = p.organ === 'eyes' ? -0.3 : p.organ === 'heart' ? -0.2 : p.organ === 'brain' ? -0.05 : 0;
      const d = hit.distance + bias;
      if (!best || d < best.d) best = { organ: p.organ, d };
    }
    return best?.organ ?? null;
  }

  private adaptQuality(dt: number) {
    if (this.qualityLocked) return;
    const since = performance.now() - this.introStart;
    if (since < 1500) return; // ignore start-up hitches
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes = [];
    const fps = 1 / avg;
    if (fps < 45) {
      const pr = this.renderer.getPixelRatio();
      if (pr > 1) {
        this.renderer.setPixelRatio(Math.max(1, pr - 0.5));
        this.resize();
      } else {
        const current = this.geometry.drawRange.count === Infinity ? this.count : this.geometry.drawRange.count;
        const next = Math.floor(current * 0.7);
        if (next < 9000) { this.qualityLocked = true; return; }
        this.geometry.setDrawRange(0, next);
      }
    } else if (since > 8000) {
      this.qualityLocked = true;
    }
  }

  private tick() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;
    const u = this.material.uniforms;
    u.uTime.value = t;
    if (!this.reducedMotion) {
      u.uIntro.value = Math.min(1, (performance.now() - this.introStart) / 2600);
      u.uBeat.value = contraction(t);
      u.uBreath.value = breath(t);
    }

    if (this.flight) {
      const f = this.flight;
      let k = Math.min(1, (performance.now() - f.t0) / f.dur);
      k = 1 - Math.pow(1 - k, 3);
      this.controls.target.lerpVectors(f.fromT, f.toT, k);
      this.camera.position.lerpVectors(f.fromP, f.toP, k);
      if (k >= 1) this.flight = null;
    }

    const idle = performance.now() - this.lastInteraction > 4000;
    this.controls.autoRotate = !this.reducedMotion && !this.focus && idle && !this.flight;
    this.controls.update(dt);
    this.adaptQuality(dt);
    this.renderer.render(this.scene, this.camera);
  }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
