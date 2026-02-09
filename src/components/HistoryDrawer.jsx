import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkles, Target } from 'lucide-react'

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

export default function HistoryDrawer({ open, onClose, history, onClear }) {
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
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[#111] border-l border-[rgba(255,255,255,0.05)] z-50 overflow-y-auto"
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

              {history.length === 0 ? (
                <p className="text-[#888] text-sm">No generations yet. Click Generate to create your first scripts.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="glass rounded-xl p-4 glass-hover transition-all duration-300"
                    >
                      {/* Meta */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#888]">{formatTime(entry.timestamp)}</span>
                        <ModeLabel mode={entry.mode} />
                      </div>

                      {/* Script titles */}
                      <div className="space-y-2">
                        {(entry.scripts || []).map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#F5A623] text-xs mt-0.5">•</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#ccc] leading-snug truncate">{s.title}</p>
                              <p className="text-xs text-[#888] mt-0.5">
                                {s.word_count} words • {s.estimated_audio_minutes} min
                                {s.confidence_overall ? ` • Score: ${s.confidence_overall}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cost summary */}
                      {entry.cost_analysis_summary?.savings_multiplier && (
                        <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)] text-xs text-[#888]">
                          AI cost: ₹{entry.cost_analysis_summary.ai_total_inr?.toFixed(2)} •
                          {' '}{entry.cost_analysis_summary.savings_multiplier} savings
                        </div>
                      )}
                    </div>
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
