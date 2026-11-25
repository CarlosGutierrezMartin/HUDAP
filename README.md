# HUDAP · Human Data Platform

An interactive 3D particle body that explains, organ by organ, what health data the body generates, what AI does with it, and where wellness wearables end and medical devices begin.

Inspired by the Medica 2026 talk reported as “AI’s rise in healthcare will render humans as data platforms” ([Medical Device Network](https://www.medicaldevice-network.com/news/medica-2026-ai-rise-in-healthcare-will-render-humans-as-data-platforms/)).

## Run it

```bash
npm install
npm run dev       # local development
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

Deep links open an organ directly: `/#heart`, `/#eyes`, `/#brain`, `/#lungs`, `/#blood`.

## How it is built

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite + TypeScript | Fast, static output that any host can serve |
| 3D | three.js, one `THREE.Points` draw call | Tens of thousands of particles animated on the GPU |
| Body | Procedural figure from primitives (`src/scene/bodyGeometry.ts`) | Generic look and no third-party model licence |
| Motion | Custom GLSL shader (`src/scene/particleMaterial.ts`) | Heartbeat, breathing, blood flow and the intro run on the GPU |
| Content | Typed data files (`src/content/`) | Every claim carries its source and can be reviewed without touching code |
| Fonts | Self-hosted via Fontsource | No requests to third-party font servers (GDPR) |

### Performance

- A device tier (low, mid, high) sets the particle budget: 16k, 30k or 52k.
- After start-up, the frame rate is sampled; if it stays under 45 fps the pixel ratio and then the particle count drop. Particles are shuffled so any subset keeps every organ.
- Point size is clamped so close-ups stay sharp, and rendering pauses when the tab is hidden.

### Accessibility

- Every organ is reachable from a keyboard-accessible list; the canvas is decorative for assistive technology.
- `Escape` closes the panel, arrow keys move between organs, focus returns to the control that opened it.
- `prefers-reduced-motion` freezes the intro, heartbeat, breathing, drift and auto-rotation.
- If WebGL is unavailable, the list and panels still work.

## Editorial rules

1. Every figure links to the page it came from, preferring peer-reviewed papers, regulators and medical societies.
2. Manufacturer-reported figures are labelled as such.
3. Notification, screening and triage are never described as diagnosis.
4. Regulatory status is written as the regulator states it, with the year.
5. The “last reviewed” date in `src/content/organs.ts` is updated on every content review.

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## Disclaimer

Educational content, not medical advice. The figure, organ shapes and ECG waveform are illustrative. No personal data is collected.
