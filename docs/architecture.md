# Architecture

A deeper look at how Kahaani AI is built, for engineering reviewers.

## System diagram

```
┌─────────────────────────────────────────────┐
│  Browser (Vite-bundled React SPA)           │
│  ─────────────────────────────────────────  │
│  • Hero (mode + language + Generate)        │
│  • LoadingStages (5 staged transitions)     │
│  • ResultsSummary + ScriptCard × N          │
│  • HistoryDrawer (localStorage-backed)      │
└─────────────────────────────────────────────┘
                  │ POST /api/generate
                  │ { mode, language, exclude_topics }
                  ▼
┌─────────────────────────────────────────────┐
│  Vercel Serverless Function (Node.js)       │
│  api/generate.js — 290 lines, single file   │
└─────────────────────────────────────────────┘
       │                    │
       │ (parallel fetch)   │
       ▼                    ▼
┌──────────────┐    ┌──────────────┐
│ Google News  │    │ Google Trends│
│ India RSS    │    │ India RSS    │
└──────────────┘    └──────────────┘
       │                    │
       └─────────┬──────────┘
                 ▼
       ┌────────────────────┐
       │ RSS title parser   │
       │ + 15-topic curated │
       │ fallback if < 5    │
       └────────────────────┘
                 │
                 ▼
       ┌────────────────────┐
       │ Research Agent     │
       │ GPT-4.1 · JSON mode│ ← 75s timeout
       │ Picks 3 topics     │
       └────────────────────┘
                 │
                 ▼
       ┌────────────────────┐
       │ Writer + Scorer    │
       │ GPT-4.1 · JSON mode│ ← 75s timeout
       │ 3 × 800-1200 words │
       └────────────────────┘
                 │
                 ▼
       ┌────────────────────┐
       │ Cost analysis      │
       │ + format response  │
       └────────────────────┘
                 │
                 ▼
            JSON to client
```

## Why two agents?

A single prompt asking "pick three topics from this RSS feed and write three full scripts" produces shallow output. The model spends its attention budget on selection and underdelivers on the writing.

Splitting into:

1. **Research Agent** — given ~30 RSS titles, picks the 3 highest-potential topics with category, angle, and rationale. Returns small structured JSON.
2. **Writer Agent** — given the 3 selected topics, writes 800–1200 words per script with self-rated confidence scores across 4 dimensions (hook, narrative, emotion, audio readiness).

…lets each call use its full attention on a focused job. The total token budget stays similar; the quality jumps noticeably.

The frontend's staged loading animation mirrors this split — users see "Scanning topics → Selecting 3 → Writing → Scoring", which is what's actually happening.

## Why JSON mode?

OpenAI's `response_format: { type: 'json_object' }` guarantees the model returns valid JSON. The previous regex fallback (`raw.match(/```json\n([\s\S]*?)\n```/)`) handled markdown-fenced responses, but breaks on edge cases (nested code blocks, unfinished fences, models that ignore the system prompt).

JSON mode requires:
- A system message that mentions "JSON" (silently required by the API).
- The expected schema described in the user prompt.
- A 2000-token room buffer to avoid truncation in the middle of an object.

The fallback regex parsing is still in the code as a defensive layer in case the model ever returns malformed JSON, but in practice it hasn't fired since JSON mode landed.

## RSS fallback strategy

Vercel's edge regions occasionally return sparse Google News/Trends RSS payloads — sometimes due to rate-limiting, sometimes regional content gaps. If `news.length + trends.length < 5`, the function shuffles in 15 curated India-relevant fallback topics and continues:

```js
const FALLBACK_TOPICS = [
  'Indian Space Research Organisation (ISRO) latest mission updates',
  'UPI digital payments revolution in India',
  'Indian Premier League cricket season highlights',
  // … 12 more
]
```

This means the demo never silently degrades to "couldn't find topics" — recruiters always see a working flow.

## Per-call timeouts (the 75s rule)

Vercel Pro caps function duration at 300s. We set `maxDuration: 180` in `vercel.json` to balance cost vs reliability. Within that 180s budget:

- Research call: ~10–20s
- Writer call: ~60–120s (8000 max_tokens)

A single slow OpenAI call could consume the entire budget. So each call has its own 75s `AbortController`:

```js
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 75000)
// ... fetch with signal: controller.signal
```

If a call times out, the user gets a friendly retry prompt — not a 504 from Vercel.

## Cost-tracking math

The cost analysis surface in the UI is a real calculation, not a stub:

```js
const inTokens  = Math.ceil((researchPrompt.length + writerPrompt.length) / 4)
const outTokens = Math.ceil((researchResp.length + writerResp.length) / 4)
const inCost    = (inTokens  / 1_000_000) * 2  // GPT-4.1 input pricing
const outCost   = (outTokens / 1_000_000) * 8  // GPT-4.1 output pricing
const totalUSD  = inCost + outCost
const totalINR  = totalUSD * 90                // ~Feb 2026 rate
```

The 4-character-per-token approximation has a ±15% variance from actual `usage` tokens. The UI surfaces this with an "85% confidence" badge — honest framing trumps impressive but inaccurate numbers.

Human cost basis: Indian freelance content marketplace entry-level rate (Pepper Content, Fiverr India). For *premium* Indian audio scriptwriting, real rates are ₹1,500–5,000 per script — meaning the 920× savings number is conservative.

## Topic deduplication

Each generation's titles are cached client-side in `localStorage` under `kahaani_history`:

```js
{
  scripts: [
    { title: '...', topic: '...', script: '...', confidence_score: {...} },
    ...
  ],
  totals: {...}, cost_analysis: {...}
}
```

On the next generation, `getUsedTopics()` flattens all historical titles + topics into a Set and POSTs them as `exclude_topics`. The Research Agent's prompt includes a "do not select these or closely related topics" instruction. This prevents repeated generations from producing overlapping scripts during a demo session.

The `HistoryDrawer` component reads the same store and lets the user view, copy, or restore any past generation — useful for recruiters who want to see multiple example outputs without paying for re-generation.

## Mobile responsiveness

The hardest viewport is the Motorola Razr's outer display at 280px wide. Solved via:

- `flex-wrap` on button rows (mode + language toggles)
- `flex-col sm:flex-row` on data rows (cost summary)
- `p-4 sm:p-6 md:p-8` for padding scale
- `py-3` (44px+ touch targets) on language pills, `py-1.5` on text links
- `rounded-xl` on mobile, `rounded-2xl` on `sm:` and up

The cost summary strip stacks vertically below 640px. The script-card metrics row splits into two rows below 480px.

## File layout

```
api/generate.js     290 lines  Full backend pipeline
api/health.js        15 lines  GET /api/health → 200 ok

src/App.jsx                State, generation flow, history mgmt
src/components/Hero.jsx    Mode + language selectors
src/components/LoadingStages.jsx   5-stage animated progress
src/components/ResultsSummary.jsx  Cost + totals strip
src/components/ScriptCard.jsx      Per-script card, expandable
src/components/ConfidenceScore.jsx Circular score + breakdown
src/components/HistoryDrawer.jsx   Slide-out history with restore
src/lib/history.js                 localStorage wrapper

vercel.json         maxDuration: 180s for /api/generate
package.json        React 18 + Vite + Tailwind + Framer Motion + Lucide
```

## What I'd build next

Honest list of follow-ups, sized roughly:

- **Streaming responses** (medium): use OpenAI's stream API and `Server-Sent Events` to ship script tokens to the browser as they generate. Cuts perceived latency by ~80%.
- **TTS pipeline** (medium): pipe scripts to ElevenLabs or Sarvam Bulbul for actual audio generation. Add a play button on each script card.
- **Quality scoring eval** (large): set up a labeled dataset of ~50 generated scripts with human ratings, then track confidence-score-vs-human-rating correlation across model upgrades.
- **Topic clustering** (small): instead of exact-match dedup, embed prior topics and reject anything within 0.85 cosine similarity. Lets the model produce different-angle takes on the same broad topic.
- **A/B compare two-agent vs one-agent** (small): instrument both pipelines, run 100 generations each, pay 5 freelance writers ₹500 to blind-rate output quality. Quantify the architectural decision.
