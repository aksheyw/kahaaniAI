# Kahaani AI — Expert Review Report

**Date**: 2026-02-10
**Reviewers**: Three Fortune 500 executive-level reviews (Head of Product, Head of Engineering, Head of UX)
**Production URL**: https://kahaani-ai-livid.vercel.app/

---

## Review Scores

| Reviewer | Overall | Key Concern |
|---|---|---|
| Head of Product | 6/10 | Feature gaps for CEO demo (no history, no share, no guidance) |
| Head of Engineering | Code 7/10, Security 3/10, Stability 4/10 | Zero auth on serverless, loading desync, no timeout |
| Head of UX | 5.5/10 | Low text contrast, mode labels unclear, no onboarding |

---

## Round 1 Fixes (Completed — commit `29db241`)

| # | Fix | File(s) |
|---|---|---|
| 1 | Replace hardcoded `~₹1` per-script cost with real API data | `ScriptCard.jsx` |
| 2 | Show mode descriptions under buttons | `Hero.jsx` |
| 3 | Fix loading desync — "Almost there" stage loops indefinitely | `LoadingStages.jsx` |
| 4 | Add 90s fetch timeout with AbortController | `App.jsx` |
| 5 | Add input validation (mode/language whitelist) | `api/generate.js` |
| 6 | Add Copy Script button to each card | `ScriptCard.jsx` |
| 7 | Remove unused ConfidenceScore import | `App.jsx` |
| 8 | Add ₹650 basis footnote in ResultsSummary | `ResultsSummary.jsx` |
| 9 | Raise text contrast from #555/#666 to #888+ | All components |
| 10 | Remove pulse-gold animation from Generate button | `Hero.jsx` |
| 11 | Friendly error messages (no raw HTTP status codes) | `App.jsx` |
| 12 | Sanitize serverless error responses | `api/generate.js` |

---

## Round 2 Fixes (In Progress)

### User-Requested Features

| # | Feature | Approach |
|---|---|---|
| R1 | **Prevent repeated stories** | localStorage cache of used topic titles → sent as `exclude_topics` to API |
| R2 | **History drawer** | Slide-out panel showing past generations stored in localStorage |
| R3 | **Loading time guidance** | "This usually takes 1-2 minutes" + elapsed timer + "keep tab open" banner |
| R4 | **Increase timeout to 180s** | AbortController bumped from 90s → 180s |

### Expert Review — Remaining HIGH/MEDIUM Items

| # | Source | Item | Approach |
|---|---|---|---|
| E1 | Engineering | OpenAI JSON mode (`response_format`) + system message | Add to `callOpenAI()` — eliminates regex fallback parsing |
| E2 | Product | RSS fallback topics | 10 curated Indian topics injected if RSS < 5 items |
| E3 | UX | Category pill normalization (handle `news\|culture`) | Split on `\|`, capitalize, render multiple pills |
| E4 | Product | "Generate More" appends instead of replacing | Accumulate scripts array in state |
| E5 | Engineering | Health check endpoint `/api/health` | New serverless function |
| E6 | Engineering | Double-click protection | Disable button via ref + loading state |
| E7 | UX | "Script Language" label above language pills | Tiny label in Hero.jsx |
| E8 | UX | Button text → "Regenerate" after first gen | Conditional based on `results` state |

### Items Deferred (Post-Demo / V2)

| # | Source | Item | Reason |
|---|---|---|---|
| D1 | Product | TTS audio preview (Sarvam Bulbul V2) | Requires TTS integration, not feasible by Wednesday |
| D2 | UX | Full typographic scale system | Design system work, low demo impact |
| D3 | UX | ARIA labels and accessibility roles | Important but not CEO-visible |
| D4 | Engineering | TypeScript migration | Significant refactor, demo works fine without it |
| D5 | Engineering | Vercel KV rate limiting | Requires Vercel KV setup, OpenAI billing cap suffices |
| D6 | Product | Supabase-backed history + auth | Post-demo, localStorage sufficient for now |
| D7 | UX | Hero gradient widening | Cosmetic, minimal impact |
| D8 | Engineering | Hindi token estimation accuracy | Token math is approximate either way |
| D9 | Product | Script A/B variants | V2 feature |
| D10 | Product | Batch generation (50-100 scripts) | V2 feature |

---

## Architecture Decisions

1. **localStorage over Supabase for history**: No login required. Per-browser scoping is fine for a demo. Can migrate to Supabase + auth post-demo.
2. **Topic exclusion via prompt, not database**: Send previously-used titles in the API request body. Research agent prompt says "do NOT select these topics." Simple, effective.
3. **OpenAI JSON mode**: `response_format: { type: "json_object" }` guarantees valid JSON output, eliminating all regex fallback parsing. Requires a system message that mentions JSON.
4. **Append on Generate More**: Accumulate `allResults` array. Summary strip shows cumulative totals.
