# CLAUDE.md — Tik Tov (תיק טוב)

Financial education game for Israeli 10th graders (React + TypeScript + three.js via @react-three/fiber + Zustand).

Rules for changes:
- All student-facing text is Hebrew, RTL.
- Returns come only from `src/data/history.ts` (real past data, 2017–2024) or from series marked fictional. Never add live/real-time market data, ads, trading, investment advice, network calls or personal data collection.
- Every buy/sell needs a written reasoning (MIN_REASONING_CHARS). Score = decision quality, not profit. No cash rewards for missions.
- Time advances only by the teacher's "next year" button.
- Keep light mode (`liteMode`, `?lite=1`) working without WebGL.
- The 3D font is bundled in `public/fonts`; do not load fonts from the internet.
- Check with `npx tsc --noEmit` and `npx vite build`.
