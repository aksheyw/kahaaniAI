import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const breakdownLabels = {
  hook_strength: 'Hook Strength',
  narrative_flow: 'Narrative Flow',
  emotional_engagement: 'Emotional Engagement',
  audio_readiness: 'Audio Readiness',
}

function CircularProgress({ score, size = 64 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#F5A623' : score >= 60 ? '#E8B84B' : '#888'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          strokeDasharray={circ}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

export default function ConfidenceScore({ score, rationale }) {
  const [expanded, setExpanded] = useState(false)
  const overall = score?.overall || 0

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 group cursor-pointer"
      >
        <CircularProgress score={overall} />
        <div className="text-left">
          <p className="text-xs text-[#888] group-hover:text-[#aaa] transition-colors">AI Confidence</p>
          <p className="text-xs text-[#555]">{expanded ? 'Hide' : 'See'} breakdown</p>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 w-48">
              {Object.entries(breakdownLabels).map(([key, label]) => {
                const val = score?.[key] || 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">{label}</span>
                      <span className="text-[#aaa] font-medium">{val}</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: val >= 80 ? '#F5A623' : val >= 60 ? '#E8B84B' : '#666' }}
                      />
                    </div>
                  </div>
                )
              })}
              {rationale && (
                <p className="text-xs text-[#666] mt-3 leading-relaxed italic">{rationale}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
