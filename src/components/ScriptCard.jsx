import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkles } from 'lucide-react'
import ConfidenceScore from './ConfidenceScore'

const categoryColors = {
  technology: '#3B82F6',
  news: '#EF4444',
  culture: '#8B5CF6',
  mythology: '#F59E0B',
  drama: '#EC4899',
  sports: '#10B981',
  politics: '#6366F1',
  entertainment: '#F97316',
  finance: '#14B8A6',
  health: '#22C55E',
}

function parseCategories(raw) {
  if (!raw) return []
  return raw
    .split(/[|,]/)
    .map(c => c.trim().toLowerCase())
    .filter(Boolean)
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function ScriptCard({ script, index, language, costAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const categories = parseCategories(script.category)
  const langLabel = language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish' : 'English'

  const preview = script.script?.substring(0, 200) || ''
  const aiPerScript = costAnalysis?.ai?.per_script_inr ?? 0
  const humanPerScript = costAnalysis?.human?.per_script_inr ?? 650

  const copyScript = useCallback(() => {
    if (!script.script) return
    navigator.clipboard.writeText(script.script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => { /* clipboard API may be blocked in some browsers */ })
  }, [script.script])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 glass-hover transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {categories.map((cat) => {
              const color = categoryColors[cat] || '#888'
              return (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${color}20`, color }}
                >
                  {capitalize(cat)}
                </span>
              )
            })}
            <span className={`px-3 py-1 rounded-full text-xs font-medium
              ${script.content_type === 'inform'
                ? 'bg-[rgba(59,130,246,0.1)] text-blue-400'
                : 'bg-[rgba(236,72,153,0.1)] text-pink-400'
              }
            `}>
              <span className="flex items-center gap-1">
                {script.content_type === 'inform'
                  ? <><Lightbulb size={10} strokeWidth={2} /> Inform</>
                  : <><Sparkles size={10} strokeWidth={2} /> Imagine</>
                }
              </span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#FAFAFA] leading-tight">
            {script.title}
          </h3>
        </div>

        {/* Confidence Score - circle + toggle only */}
        <div className="flex-shrink-0">
          <ConfidenceScore score={script.confidence_score} rationale={script.confidence_rationale} />
        </div>
      </div>

      {/* Hook */}
      <div className="mt-5 pl-4 border-l-2 border-[#F5A623]">
        <p className="text-[#E8B84B] text-sm font-medium italic leading-relaxed">
          "{script.hook}"
        </p>
      </div>

      {/* Script preview / full */}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-[#ccc] text-sm leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto pr-2">
                {script.script}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="mt-3 text-[#F5A623] text-sm font-medium hover:underline"
              >
                Show Less
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[#999] text-sm leading-relaxed">
                {preview}...
              </p>
              <button
                onClick={() => setExpanded(true)}
                className="mt-2 text-[#F5A623] text-sm font-medium hover:underline"
              >
                Read Full Script
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics row */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-xs text-[#999]">
          <span>{(script.word_count || 0).toLocaleString()} words</span>
          <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">|</span>
          <span>{script.estimated_audio_minutes || 0} min audio</span>
          <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">|</span>
          <span>{langLabel}</span>
        </div>
        <div className="flex items-center justify-between mt-2.5 gap-3">
          <span className="text-xs text-[#999]">
            <span className="text-[#F5A623] font-semibold">₹{aiPerScript.toFixed(2)}</span>
            {' '}AI vs{' '}
            <span className="text-[#999]">₹{humanPerScript.toLocaleString()}</span>
            {' '}human
          </span>
          <button
            onClick={copyScript}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-[#999] hover:text-[#F5A623] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,166,35,0.3)] transition-all duration-300"
          >
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
