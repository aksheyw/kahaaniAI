import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import LoadingStages from './components/LoadingStages'
import ResultsSummary from './components/ResultsSummary'
import ScriptCard from './components/ScriptCard'

const API_URL = import.meta.env.VITE_API_URL || '/api/generate'

function friendlyError(raw) {
  if (!raw) return 'Something went wrong. Please try again.'
  if (raw.includes('500') || raw.includes('Internal'))
    return 'Our AI is taking a moment. Please try again.'
  if (raw.includes('timeout') || raw.includes('abort'))
    return 'The request took too long. Please try again — it usually works on the second attempt.'
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError'))
    return 'Please check your internet connection and try again.'
  return 'Something went wrong. Please try again.'
}

export default function App() {
  const [mode, setMode] = useState('both')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, language }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (data.status === 'success') {
        setResults(data)
      } else {
        throw new Error(data.error || 'Generation failed')
      }
    } catch (err) {
      clearTimeout(timeout)
      setError(friendlyError(err.message))
    } finally {
      setLoading(false)
    }
  }, [mode, language])

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.04)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <Hero
          mode={mode}
          setMode={setMode}
          language={language}
          setLanguage={setLanguage}
          onGenerate={generate}
          loading={loading}
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
          {results && !loading && (
            <div className="mt-16 pb-24">
              <ResultsSummary data={results} />

              {/* Research Summary */}
              <div className="mt-10 glass rounded-2xl p-6 sm:p-8">
                <h3 className="text-sm font-medium text-[#999] uppercase tracking-wider mb-3">Research Summary</h3>
                <p className="text-[#FAFAFA] text-lg leading-relaxed">{results.research?.summary}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#999]">
                  <span>Sources: {results.research?.sources?.join(', ')}</span>
                  <span className="text-[rgba(255,255,255,0.2)]">|</span>
                  <span>Topics analyzed: <span className="text-[#F5A623] font-semibold">{results.research?.topics_analyzed}</span></span>
                </div>
              </div>

              {/* Script Cards */}
              <div className="mt-10 space-y-6">
                {results.scripts?.map((script, i) => (
                  <ScriptCard key={i} script={script} index={i} language={language} costAnalysis={results.cost_analysis} />
                ))}
              </div>

              {/* Generate More */}
              <div className="mt-12 text-center">
                <button
                  onClick={generate}
                  className="px-8 py-4 rounded-xl bg-transparent border border-[#F5A623] text-[#F5A623] font-semibold text-lg hover:bg-[#F5A623] hover:text-black transition-all duration-300"
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
