import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkles, Target, ChevronDown, ChevronUp, Copy, Check, RotateCcw } from 'lucide-react'

function formatTime(iso) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const modeIcons = {
  inform: { Icon: Lightbulb, label: 'Inform' },
  imagine: { Icon: Sparkles, label: 'Imagine' },
  both: { Icon: Target, label: 'Both' },
}

function ModeLabel({ mode }) {
  const { Icon, label } = modeIcons[mode] || modeIcons.both
  return (
    <span className="flex items-center gap-1 text-xs text-[#999]">
      <Icon size={10} strokeWidth={2} />
      {label}
    </span>
  )
}

function HistoryScript({ script }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasFullScript = Boolean(script.script)

  const copyScript = useCallback(() => {
    if (!script.script) return
    navigator.clipboard.writeText(script.script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => { /* clipboard may be blocked */ })
  }, [script.script])

  return (
    <div className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0 pb-3 last:pb-0">
      <button
        onClick={() => hasFullScript && setExpanded(prev => !prev)}
        className={`w-full text-left flex items-start gap-2 group ${hasFullScript ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-[#F5A623] text-xs mt-0.5 flex-shrink-0">•</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#ccc] leading-snug">{script.title}</p>
          <p className="text-xs text-[#888] mt-0.5">
            {script.word_count || 0} words • {script.estimated_audio_minutes || 0} min
            {script.confidence_score?.overall ? ` • Score: ${script.confidence_score.overall}` : ''}
          </p>
        </div>
        {hasFullScript && (
          <span className="flex-shrink-0 mt-0.5 text-[#666] group-hover:text-[#F5A623] transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>

      <AnimatePresence>
        {expanded && hasFullScript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Hook */}
            {script.hook && (
              <div className="mt-3 ml-4 pl-3 border-l-2 border-[#F5A623]/50">
                <p className="text-[#E8B84B] text-xs italic leading-relaxed">"{script.hook}"</p>
              </div>
            )}

            {/* Full script */}
            <div className="mt-3 ml-4 text-[#aaa] text-xs leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {script.script}
            </div>

            {/* Copy button */}
            <div className="mt-2 ml-4">
              <button
                onClick={(e) => { e.stopPropagation(); copyScript() }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#999] hover:text-[#F5A623] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,166,35,0.3)] transition-all duration-300"
              >
                {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy Script</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HistoryEntry({ entry, onRestore }) {
  const [open, setOpen] = useState(false)
  const hasScripts = (entry.scripts || []).some(s => Boolean(s.script))
  const costAnalysis = entry.cost_analysis || entry.cost_analysis_summary || null
  const savingsMultiplier = costAnalysis?.savings?.multiplier || costAnalysis?.savings_multiplier || null
  const aiCost = costAnalysis?.ai?.total_inr || costAnalysis?.ai_total_inr || null

  return (
    <div className="glass rounded-xl p-4 glass-hover transition-all duration-300">
      {/* Meta row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#888]">{formatTime(entry.timestamp)}</span>
        <ModeLabel mode={entry.mode} />
      </div>

      {/* Script titles (always visible) */}
      <div className="space-y-1.5 mb-3">
        {(entry.scripts || []).map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#F5A623] text-xs mt-0.5">•</span>
            <p className="text-sm text-[#ccc] leading-snug truncate flex-1 min-w-0">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Cost summary */}
      {savingsMultiplier && (
        <div className="text-xs text-[#888] mb-3">
          AI cost: ₹{typeof aiCost === 'number' ? aiCost.toFixed(2) : aiCost} • {savingsMultiplier} savings
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
        {hasScripts && (
          <button
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#999] hover:text-[#F5A623] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,166,35,0.3)] transition-all duration-300"
          >
            {open ? <><ChevronUp size={12} /> Hide Scripts</> : <><ChevronDown size={12} /> Read Scripts</>}
          </button>
        )}
        {hasScripts && onRestore && (
          <button
            onClick={() => onRestore(entry)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#999] hover:text-[#F5A623] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,166,35,0.3)] transition-all duration-300"
          >
            <RotateCcw size={12} /> Restore
          </button>
        )}
      </div>

      {/* Expanded scripts */}
      <AnimatePresence>
        {open && hasScripts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] space-y-3">
              {(entry.scripts || []).map((s, i) => (
                <HistoryScript key={i} script={s} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HistoryDrawer({ open, onClose, history, onClear, onRestore }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#111] border-l border-[rgba(255,255,255,0.05)] z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#FAFAFA]">Generation History</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-[#999] hover:text-[#FAFAFA] text-2xl leading-none transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                >
                  ×
                </button>
              </div>

              {/* Help text */}
              {history.length > 0 && (
                <p className="text-[10px] text-[#666] mb-4">
                  Click "Read Scripts" to expand full scripts. "Restore" loads a past generation back into the main view.
                </p>
              )}

              {history.length === 0 ? (
                <p className="text-[#888] text-sm">No generations yet. Click Generate to create your first scripts.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <HistoryEntry key={entry.id} entry={entry} onRestore={onRestore} />
                  ))}

                  {/* Clear button */}
                  <button
                    onClick={onClear}
                    className="w-full mt-4 py-2 rounded-xl text-sm text-[#888] hover:text-red-400 border border-[rgba(255,255,255,0.05)] hover:border-red-400/30 transition-all duration-300"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
