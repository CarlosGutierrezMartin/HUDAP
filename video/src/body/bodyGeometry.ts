import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { GROUP, type GroupId } from './groups';

/**
 * Procedural, generic human figure built from primitives.
 * No third-party anatomy model is used, so there are no licence obligations.
 * Units: metres, feet at y = 0, height ~1.8, facing +z.
 */

export interface ParticleCloud {
  positions: Float32Array;
  scatter: Float32Array;
  groups: Float32Array;
  rand: Float32Array;
  flow: Float32Array;
  count: number;
}

export interface Anchors {
  heart: THREE.Vector3;
  lungs: THREE.Vector3;
  brain: THREE.Vector3;
  eyes: THREE.Vector3;
  blood: THREE.Vector3;
}

export const ANCHORS: Anchors = {
  heart: new THREE.Vector3(0.028, 1.3, 0.035),
  lungs: new THREE.Vector3(0, 1.31, 0.0),
  brain: new THREE.Vector3(0, 1.7, -0.005),
  eyes: new THREE.Vector3(0, 1.655, 0.09),
  blood: new THREE.Vector3(0, 1.0, 0),
};

const UP = new THREE.Vector3(0, 1, 0);

function limb(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, radial = 20): THREE.BufferGeometry[] {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const cyl = new THREE.CylinderGeometry(rb, ra, len, radial, Math.max(2, Math.round(len * 40)), true);
  cyl.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()));
  cyl.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return [cyl, joint(b, rb)];
}

function joint(p: THREE.Vector3, r: number, scale = new THREE.Vector3(1, 1, 1)): THREE.BufferGeometry {
  const s = new THREE.SphereGeometry(r, 18, 12);
  s.scale(scale.x, scale.y, scale.z);
  s.translate(p.x, p.y, p.z);
  return s;
}

function torso(): THREE.BufferGeometry {
  // Radius profile from crotch to base of neck.
  const profile: [number, number][] = [
    [0.02, 0.86], [0.12, 0.88], [0.165, 0.95], [0.175, 1.0], [0.155, 1.08],
    [0.14, 1.13], [0.15, 1.2], [0.168, 1.3], [0.18, 1.38], [0.19, 1.43],
    [0.16, 1.47], [0.09, 1.5], [0.055, 1.51],
  ];
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.scale(1, 1, 0.6); // flatten front-to-back
  return g;
}

function buildSkinGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  parts.push(torso());
  // Neck and head
  parts.push(...limb(v(0, 1.49, 0), v(0, 1.585, 0.005), 0.052, 0.048));
  parts.push(joint(v(0, 1.68, 0.005), 0.105, v(0.82, 1.06, 0.95)));
  // Jaw hint
  parts.push(joint(v(0, 1.615, 0.03), 0.07, v(0.95, 0.8, 1)));

  for (const side of [-1, 1]) {
    const s = side;
    // Shoulder, arm, forearm, hand (relaxed A-pose)
    parts.push(joint(v(0.19 * s, 1.42, 0), 0.058));
    parts.push(...limb(v(0.2 * s, 1.41, 0), v(0.25 * s, 1.15, -0.01), 0.05, 0.038));
    parts.push(...limb(v(0.25 * s, 1.15, -0.01), v(0.29 * s, 0.9, 0.03), 0.037, 0.028));
    parts.push(joint(v(0.3 * s, 0.84, 0.035), 0.04, v(0.55, 1.35, 0.9)));
    // Thigh, shin, foot
    parts.push(joint(v(0.09 * s, 0.93, 0), 0.085));
    parts.push(...limb(v(0.09 * s, 0.93, 0), v(0.1 * s, 0.5, 0.01), 0.085, 0.052));
    parts.push(...limb(v(0.1 * s, 0.5, 0.01), v(0.105 * s, 0.09, -0.01), 0.05, 0.034));
    parts.push(joint(v(0.105 * s, 0.045, 0.05), 0.045, v(0.75, 0.55, 2.1)));
  }

  const clean = parts.map((g) => {
    const ni = g.index ? g.toNonIndexed() : g;
    for (const name of Object.keys(ni.attributes)) {
      if (name !== 'position' && name !== 'normal') ni.deleteAttribute(name);
    }
    if (!ni.getAttribute('normal')) ni.computeVertexNormals();
    return ni;
  });
  const merged = mergeGeometries(clean, false);
  if (!merged) throw new Error('Body geometry merge failed');
  return merged;
}

// Deterministic PRNG so the figure looks identical on every load.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Emitter {
  group: GroupId;
  count: number;
  sample: (out: THREE.Vector3, rnd: () => number) => number; // returns flow value
}

function ellipsoidPoint(out: THREE.Vector3, rnd: () => number, c: THREE.Vector3, r: THREE.Vector3, shell = 0.7) {
  // Mix of shell and volume so the organ reads as a solid with a crisp outline.
  const u = rnd() * 2 - 1;
  const th = rnd() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const k = rnd() < shell ? 0.92 + rnd() * 0.08 : Math.cbrt(rnd());
  out.set(s * Math.cos(th) * r.x * k, u * r.y * k, s * Math.sin(th) * r.z * k).add(c);
}

function vesselCurves(): THREE.CatmullRomCurve3[] {
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const curves: THREE.CatmullRomCurve3[] = [];
  // Aorta: from heart, arch, descending to the iliac bifurcation.
  const aorta = [v(0.02, 1.3, 0.03), v(0.01, 1.38, 0.02), v(-0.02, 1.4, -0.01), v(-0.015, 1.3, -0.04), v(-0.01, 1.1, -0.04), v(0, 0.98, -0.03)];
  curves.push(new THREE.CatmullRomCurve3(aorta));
  for (const s of [-1, 1]) {
    // Carotid to head
    curves.push(new THREE.CatmullRomCurve3([v(0.01 * s, 1.39, 0.01), v(0.025 * s, 1.5, 0.02), v(0.035 * s, 1.6, 0.02), v(0.03 * s, 1.7, 0)]));
    // Subclavian and brachial to the hand
    curves.push(new THREE.CatmullRomCurve3([v(0.02 * s, 1.4, 0), v(0.12 * s, 1.43, 0), v(0.21 * s, 1.36, 0.01), v(0.25 * s, 1.15, 0), v(0.28 * s, 0.95, 0.03), v(0.3 * s, 0.85, 0.035)]));
    // Iliac and femoral to the foot
    curves.push(new THREE.CatmullRomCurve3([v(0, 0.98, -0.03), v(0.06 * s, 0.9, 0.01), v(0.095 * s, 0.7, 0.03), v(0.1 * s, 0.5, 0.0), v(0.1 * s, 0.25, -0.01), v(0.105 * s, 0.06, 0.05)]));
  }
  return curves;
}

export function buildCloud(totalBudget: number): ParticleCloud {
  const rnd = mulberry32(1337);
  const skinGeo = buildSkinGeometry();
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(skinGeo)).build();

  const vessels = vesselCurves();
  const vesselLengths = vessels.map((c) => c.getLength());
  const totalVesselLen = vesselLengths.reduce((a, b) => a + b, 0);

  const share = (f: number) => Math.round(totalBudget * f);

  const emitters: Emitter[] = [
    { group: GROUP.skin, count: share(0.68), sample: (o) => { sampler.sample(o); return 0; } },
    {
      group: GROUP.heart, count: share(0.07),
      sample: (o, r) => {
        // Two overlapping lobes, tilted towards the left, approximate a heart silhouette.
        const lobe = r() < 0.55 ? new THREE.Vector3(-0.012, 0.012, 0) : new THREE.Vector3(0.016, -0.01, 0.004);
        ellipsoidPoint(o, r, lobe, new THREE.Vector3(0.042, 0.05, 0.038), 0.75);
        o.applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.45).add(ANCHORS.heart);
        return 0;
      },
    },
    {
      group: GROUP.lungs, count: share(0.09),
      sample: (o, r) => {
        const s = r() < 0.5 ? -1 : 1;
        // The left lung is slightly smaller to leave room for the heart.
        const rx = s > 0 ? 0.055 : 0.064;
        for (let i = 0; i < 6; i++) {
          ellipsoidPoint(o, r, new THREE.Vector3(0.08 * s, 1.315, -0.005), new THREE.Vector3(rx, 0.115, 0.07), 0.6);
          // Keep a cardiac notch free on the left lung.
          if (!(s > 0 && o.distanceTo(ANCHORS.heart) < 0.06)) break;
        }
        return 0;
      },
    },
    {
      group: GROUP.brain, count: share(0.07),
      sample: (o, r) => {
        ellipsoidPoint(o, r, ANCHORS.brain, new THREE.Vector3(0.07, 0.058, 0.082), 0.8);
        // Subtle folds: push points along a ridged pattern.
        const fold = 0.004 * Math.sin(o.x * 180) * Math.sin(o.z * 160);
        o.addScaledVector(new THREE.Vector3().subVectors(o, ANCHORS.brain).normalize(), fold);
        return 0;
      },
    },
    {
      group: GROUP.eyes, count: share(0.025),
      sample: (o, r) => {
        const s = r() < 0.5 ? -1 : 1;
        const c = new THREE.Vector3(0.034 * s, 1.655, 0.082);
        if (r() < 0.45) {
          // Iris ring facing forward.
          const a = r() * Math.PI * 2;
          const rad = 0.006 + r() * 0.004;
          o.set(c.x + Math.cos(a) * rad, c.y + Math.sin(a) * rad, c.z + 0.012);
        } else {
          ellipsoidPoint(o, r, c, new THREE.Vector3(0.0125, 0.0125, 0.0125), 0.9);
        }
        return 0;
      },
    },
    {
      group: GROUP.blood, count: share(0.065),
      sample: (o, r) => {
        let pick = r() * totalVesselLen;
        let idx = 0;
        while (idx < vessels.length - 1 && pick > vesselLengths[idx]) { pick -= vesselLengths[idx]; idx++; }
        const t = r();
        vessels[idx].getPointAt(t, o);
        const jitter = 0.006;
        o.x += (r() - 0.5) * jitter; o.y += (r() - 0.5) * jitter; o.z += (r() - 0.5) * jitter;
        // Flow coordinate in metres along the vessel, so pulses travel at a constant speed.
        return t * vesselLengths[idx];
      },
    },
  ];

  const count = emitters.reduce((a, e) => a + e.count, 0);
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const groups = new Float32Array(count);
  const rand = new Float32Array(count * 3);
  const flow = new Float32Array(count);

  const tmp = new THREE.Vector3();
  let i = 0;
  for (const e of emitters) {
    for (let k = 0; k < e.count; k++, i++) {
      flow[i] = e.sample(tmp, rnd);
      positions.set([tmp.x, tmp.y, tmp.z], i * 3);
      groups[i] = e.group;
      rand.set([rnd(), rnd(), rnd()], i * 3);
      // Start positions for the intro: a loose sphere around the body.
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const rad = 1.6 + rnd() * 1.4;
      const s = Math.sqrt(1 - u * u);
      scatter.set([s * Math.cos(th) * rad, 0.95 + u * rad * 0.7, s * Math.sin(th) * rad], i * 3);
    }
  }

  // Shuffle so that any prefix (drawRange) is an even subsample of every group.
  // This lets the adaptive-quality system drop particles without losing organs.
  for (let a = count - 1; a > 0; a--) {
    const b = Math.floor(rnd() * (a + 1));
    swap3(positions, a, b); swap3(scatter, a, b); swap3(rand, a, b);
    swap1(groups, a, b); swap1(flow, a, b);
  }

  skinGeo.dispose();
  return { positions, scatter, groups, rand, flow, count };
}

function swap3(arr: Float32Array, a: number, b: number) {
  for (let k = 0; k < 3; k++) {
    const t = arr[a * 3 + k]; arr[a * 3 + k] = arr[b * 3 + k]; arr[b * 3 + k] = t;
  }
}
function swap1(arr: Float32Array, a: number, b: number) {
  const t = arr[a]; arr[a] = arr[b]; arr[b] = t;
}
