import { useState, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import LoadingStages from './components/LoadingStages'
import ResultsSummary from './components/ResultsSummary'
import ScriptCard from './components/ScriptCard'
import HistoryDrawer from './components/HistoryDrawer'
import { getHistory, addToHistory, getUsedTopics, clearHistory } from './lib/history'

const API_URL = import.meta.env.VITE_API_URL || '/api/generate'

function friendlyError(raw) {
  if (!raw) return 'Something went wrong. Please try again.'
  if (raw.includes('500') || raw.includes('Internal'))
    return 'Our AI is taking a moment. Please try again.'
  if (raw.includes('timeout') || raw.includes('abort'))
    return 'The request timed out. This usually takes 1–2 minutes — please try again and keep this tab open.'
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError'))
    return 'Please check your internet connection and try again.'
  return 'Something went wrong. Please try again.'
}

export default function App() {
  const [mode, setMode] = useState('both')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [error, setError] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState(() => getHistory())
  const generatingRef = useRef(false)

  const hasResults = allResults.length > 0

  // Cumulative totals across all generations this session
  const cumulativeTotals = allResults.reduce(
    (acc, r) => ({
      scripts_generated: acc.scripts_generated + (r.totals?.scripts_generated || 0),
      total_words: acc.total_words + (r.totals?.total_words || 0),
      total_audio_minutes:
        Math.round((acc.total_audio_minutes + (r.totals?.total_audio_minutes || 0)) * 10) / 10,
    }),
    { scripts_generated: 0, total_words: 0, total_audio_minutes: 0 }
  )

  const generate = useCallback(async (append = false) => {
    // Double-click protection
    if (generatingRef.current) return
    generatingRef.current = true

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 180000)

    try {
      const excludeTopics = getUsedTopics()

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, language, exclude_topics: excludeTopics }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (data.status === 'success') {
        setAllResults(append ? prev => [...prev, data] : [data])
        const entry = addToHistory(data)
        setHistory(prev => [entry, ...prev])
      } else {
        throw new Error(data.error || 'Generation failed')
      }
    } catch (err) {
      clearTimeout(timeout)
      setError(friendlyError(err.message))
    } finally {
      setLoading(false)
      generatingRef.current = false
    }
  }, [mode, language])

  // Flatten all scripts across all generations, tagging each with its cost_analysis
  const allScripts = allResults.flatMap(r =>
    (r.scripts || []).map(s => ({ ...s, _costAnalysis: r.cost_analysis }))
  )

  // Use the latest result's cost_analysis for the summary strip
  const latestResult = allResults[allResults.length - 1] || null

  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
  }

  const handleRestoreFromHistory = useCallback((entry) => {
    // Reconstruct a result object from the history entry
    const restored = {
      status: 'success',
      params: { mode: entry.mode, language: entry.language },
      scripts: entry.scripts || [],
      totals: entry.totals || {
        scripts_generated: (entry.scripts || []).length,
        total_words: (entry.scripts || []).reduce((sum, s) => sum + (s.word_count || 0), 0),
        total_audio_minutes: (entry.scripts || []).reduce((sum, s) => sum + (s.estimated_audio_minutes || 0), 0),
      },
      cost_analysis: entry.cost_analysis || null,
      research: null, // research summary not stored in history
    }
    setAllResults([restored])
    setHistoryOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.04)_0%,transparent_70%)]" />
      </div>

      {/* History button — fixed top right */}
      {history.length > 0 && (
        <button
          onClick={() => setHistoryOpen(true)}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 px-4 py-2 rounded-xl text-xs font-medium text-[#999] hover:text-[#F5A623] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,166,35,0.3)] bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-all duration-300"
        >
          History ({history.length})
        </button>
      )}

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClear={handleClearHistory}
        onRestore={handleRestoreFromHistory}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <Hero
          mode={mode}
          setMode={setMode}
          language={language}
          setLanguage={setLanguage}
          onGenerate={generate}
          loading={loading}
          hasResults={hasResults}
        />

        {/* Loading */}
        <AnimatePresence mode="wait">
          {loading && <LoadingStages key="loading" language={language} />}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && !loading && (
            <div className="mt-12 text-center">
              <div className="glass rounded-2xl p-8 max-w-lg mx-auto">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={generate}
                  className="px-6 py-3 rounded-xl bg-[#F5A623] text-black font-semibold hover:bg-[#E8B84B] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {hasResults && !loading && (
            <div className="mt-16 pb-24">
              <ResultsSummary
                data={{
                  totals: cumulativeTotals,
                  cost_analysis: latestResult?.cost_analysis,
                }}
              />

              {/* Research Summary — latest generation */}
              {latestResult?.research && (
                <div className="mt-8 sm:mt-10 glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                  <h3 className="text-xs sm:text-sm font-medium text-[#999] uppercase tracking-wider mb-3">Research Summary</h3>
                  <p className="text-[#FAFAFA] text-base sm:text-lg leading-relaxed">{latestResult.research.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#999]">
                    <span>Sources: {latestResult.research.sources?.join(', ')}</span>
                    <span className="text-[rgba(255,255,255,0.2)]">|</span>
                    <span>Topics analyzed: <span className="text-[#F5A623] font-semibold">{latestResult.research.topics_analyzed}</span></span>
                  </div>
                </div>
              )}

              {/* Script Cards — all accumulated scripts */}
              <div className="mt-10 space-y-6">
                {allScripts.map((script, i) => (
                  <ScriptCard
                    key={`${script.title}-${i}`}
                    script={script}
                    index={i}
                    language={language}
                    costAnalysis={script._costAnalysis}
                  />
                ))}
              </div>

              {/* Generate More */}
              <div className="mt-12 text-center">
                <button
                  onClick={() => generate(true)}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl bg-transparent border border-[#F5A623] text-[#F5A623] font-semibold text-base sm:text-lg hover:bg-[#F5A623] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate More Scripts
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-12 text-center text-[#888] text-sm border-t border-[rgba(255,255,255,0.05)]">
          Powered by Kahaani AI
        </footer>
      </div>
    </div>
  )
}
