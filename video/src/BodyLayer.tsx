import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { ANCHORS, buildCloud } from './body/bodyGeometry';
import { breath, contraction } from './body/ecg';
import { GROUP, type OrganKey } from './body/groups';
import { createParticleMaterial } from './body/particleMaterial';
import { EASE } from './theme';
import { SCENES } from './timeline';

interface Shot {
  target: THREE.Vector3;
  dist: number;
  /** Horizontal angle around the body, 0 = front. */
  az: number;
}

const FULL = 5.7;
const HOME = new THREE.Vector3(0, 0.93, 0);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Camera for each scene at local frame f (small drifts keep the frame alive). */
const SHOTS: Record<(typeof SCENES)[number]['id'], (f: number) => Shot> = {
  Intro: (f) => ({ target: HOME, dist: FULL + 0.6 - f * 0.003, az: -0.7 + f * 0.0052 }),
  Heart: (f) => ({ target: ANCHORS.heart, dist: 2.1 - f * 0.0012, az: 0.22 - f * 0.0008 }),
  Eyes: (f) => ({ target: v(0, 1.655, 0.05), dist: 1.0 - f * 0.0008, az: 0.08 + f * 0.0008 }),
  Brain: (f) => ({ target: v(0, 1.66, 0), dist: 1.4 - f * 0.0008, az: 0.55 + f * 0.0014 }),
  Lungs: (f) => ({ target: ANCHORS.lungs, dist: 2.3 - f * 0.001, az: -0.3 + f * 0.0012 }),
  Blood: (f) => ({ target: HOME, dist: FULL, az: 0.5 - f * 0.0025 }),
  Line: (f) => ({ target: v(0, 0.45, 0), dist: FULL * 1.9, az: 0.05 - f * 0.0022 }),
  Notice: (f) => ({ target: ANCHORS.heart, dist: 2.4 - f * 0.001, az: -0.25 + f * 0.0008 }),
  Outro: (f) => ({ target: HOME, dist: FULL + 0.2, az: 0.2 + f * 0.0035 }),
};

const MOVE = 48; // frames a camera move takes at the start of a scene

function shotAt(frame: number): Shot {
  let start = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    if (frame < start + s.frames || i === SCENES.length - 1) {
      const local = frame - start;
      const cur = SHOTS[s.id](local);
      if (i === 0) return cur;
      const prevScene = SCENES[i - 1];
      const prev = SHOTS[prevScene.id](prevScene.frames + local);
      const k = interpolate(local, [0, MOVE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
      return {
        target: prev.target.clone().lerp(cur.target, k),
        dist: prev.dist + (cur.dist - prev.dist) * k,
        az: prev.az + (cur.az - prev.az) * k,
      };
    }
    start += s.frames;
  }
  throw new Error('unreachable');
}

/** Which organ is lit, and how strongly. */
function focusAt(frame: number): { organ: OrganKey | null; amt: number } {
  let start = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    if (frame < start + s.frames) {
      if (!s.focus) return { organ: null, amt: 0 };
      const local = frame - start;
      const next = SCENES[i + 1];
      const amtIn = interpolate(local, [8, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
      const amtOut = next && next.focus === s.focus ? 1 : interpolate(local, [s.frames - 16, s.frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return { organ: s.focus, amt: Math.min(amtIn, amtOut) };
    }
    start += s.frames;
  }
  return { organ: null, amt: 0 };
}

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { points, material } = useMemo(() => {
    const cloud = buildCloud(52000);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
    geometry.setAttribute('aScatter', new THREE.BufferAttribute(cloud.scatter, 3));
    geometry.setAttribute('aGroup', new THREE.BufferAttribute(cloud.groups, 1));
    geometry.setAttribute('aRand', new THREE.BufferAttribute(cloud.rand, 3));
    geometry.setAttribute('aFlow', new THREE.BufferAttribute(cloud.flow, 1));
    const mat = createParticleMaterial();
    const p = new THREE.Points(geometry, mat);
    p.frustumCulled = false;
    return { points: p, material: mat };
  }, []);

  useLayoutEffect(() => {
    const t = frame / fps;
    const u = material.uniforms;
    u.uTime.value = t;
    u.uIntro.value = interpolate(frame, [0, 84], [0.32, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    u.uBeat.value = contraction(t);
    u.uBreath.value = breath(t);
    u.uPixelRatio.value = height / 900;
    u.uMaxSize.value = 6.5;
    const focus = focusAt(frame);
    u.uFocus.value = focus.organ ? GROUP[focus.organ] : -1;
    u.uFocusAmt.value = focus.amt;

    const shot = shotAt(frame);
    camera.fov = 32;
    camera.near = 0.05;
    camera.far = 40;
    camera.aspect = width / height;
    camera.position.set(
      shot.target.x + Math.sin(shot.az) * shot.dist,
      shot.target.y + shot.dist * 0.08,
      shot.target.z + Math.cos(shot.az) * shot.dist,
    );
    camera.lookAt(shot.target);
    // Push the subject into the upper part of the frame; text lives below it.
    camera.setViewOffset(width, height, 0, height * 0.13, width, height);
    camera.updateProjectionMatrix();
  }, [frame, fps, width, height, camera, material]);

  return <primitive object={points} />;
};

export const BodyLayer: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }} dpr={1}>
      <Body />
    </ThreeCanvas>
  );
};
