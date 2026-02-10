// localStorage-based generation history for topic deduplication and browsing

const STORAGE_KEY = 'kahaani_history'
const MAX_ENTRIES = 20 // reduced from 50 — full scripts stored now

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // localStorage full — try with fewer entries
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 10)))
    } catch {
      // still full — silently degrade
    }
  }
}

export function getHistory() {
  return readHistory()
}

export function addToHistory(result) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    mode: result.params?.mode || 'both',
    language: result.params?.language || 'en',
    scripts: (result.scripts || []).map(s => ({
      title: s.title,
      topic: s.topic,
      category: s.category,
      content_type: s.content_type,
      hook: s.hook,
      script: s.script,
      word_count: s.word_count,
      estimated_audio_minutes: s.estimated_audio_minutes,
      confidence_score: s.confidence_score,
      confidence_rationale: s.confidence_rationale,
    })),
    totals: result.totals,
    cost_analysis: result.cost_analysis,
  }
  const history = [entry, ...readHistory()]
  writeHistory(history)
  return entry
}

export function getUsedTopics() {
  const history = readHistory()
  const topics = new Set()
  for (const entry of history) {
    for (const script of entry.scripts || []) {
      if (script.title) topics.add(script.title.toLowerCase())
      if (script.topic) topics.add(script.topic.toLowerCase())
    }
  }
  return [...topics]
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silently degrade
  }
}
