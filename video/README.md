# HUDAP: LinkedIn video

A 54-second, 4:5 (1080 × 1350) video made with [Remotion](https://www.remotion.dev). It reuses the site's own particle body (`src/body/` is copied from `../src/scene` and `../src/content/groups.ts`), so the figure matches the website.

Every figure on screen comes from a source the site cites in `../src/content/organs.ts`:

| Scene | Figure | Source on the site |
|---|---|---|
| Heart | 419,297 participants; PPV 0.84 | Perez et al., N Engl J Med 2019 (`perez-2019`) |
| Eyes | 87.4% sensitivity | ACP Diabetes Monthly 2018 (`acp-2018`) |
| Brain | FDA De Novo 2018, triage | FDA press release (`fda-viz`) |
| Lungs and sleep | 1,000+ of about 1,250 AI algorithms are imaging | Cardiovascular Business 2025 (`cvb-count`) |
| Blood | Readings every 15 min, first OTC CGM (2024) | FDA (`fda-stelo`) |
| Notice | 18% of notified under-40s had AF | Perez et al. 2019 (`perez-2019`) |

The ECG trace is the site's synthetic waveform and is labelled as illustrative.

## Commands

```bash
npm i
npm run dev                         # Remotion Studio
npx remotion render HudapLinkedIn out/hudap-linkedin.mp4 --crf=16
```

If the Remotion browser download is blocked, point `REMOTION_BROWSER` at a local Chromium.
Scene lengths live in `src/timeline.ts`; camera moves in `src/BodyLayer.tsx`.
