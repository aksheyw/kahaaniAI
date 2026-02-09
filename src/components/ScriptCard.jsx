import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function ScriptCard({ script, index, language }) {
  const [expanded, setExpanded] = useState(false)
  const catColor = categoryColors[script.category?.toLowerCase()] || '#888'
  const langLabel = language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish' : 'English'

  const preview = script.script?.substring(0, 200) || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass rounded-2xl p-6 sm:p-8 glass-hover transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: `${catColor}20`, color: catColor }}
            >
              {script.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium
              ${script.content_type === 'inform'
                ? 'bg-[rgba(59,130,246,0.1)] text-blue-400'
                : 'bg-[rgba(236,72,153,0.1)] text-pink-400'
              }
            `}>
              {script.content_type === 'inform' ? '💡 Inform' : '✨ Imagine'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] leading-tight">
            {script.title}
          </h3>
        </div>

        {/* Confidence Score */}
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
      <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#888]">
        <span>{script.word_count?.toLocaleString()} words</span>
        <span className="text-[rgba(255,255,255,0.15)]">|</span>
        <span>{script.estimated_audio_minutes} min audio</span>
        <span className="text-[rgba(255,255,255,0.15)]">|</span>
        <span>{langLabel}</span>
        <span className="text-[rgba(255,255,255,0.15)]">|</span>
        <span>
          <span className="text-[#F5A623] font-semibold">~₹1</span>
          {' '}AI vs{' '}
          <span className="text-[#888]">₹650</span>
          {' '}human
        </span>
      </div>
    </motion.div>
  )
}
