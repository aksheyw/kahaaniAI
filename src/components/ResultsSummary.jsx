import { motion } from 'framer-motion'

export default function ResultsSummary({ data }) {
  const { totals, cost_analysis } = data
  const savings = cost_analysis?.savings?.multiplier || '—'
  const aiCost = cost_analysis?.ai?.total_inr || 0
  const humanCost = cost_analysis?.human?.total_inr || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary strip */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base text-[#ccc]">
            <span>
              <span className="text-[#FAFAFA] font-semibold">{totals?.scripts_generated}</span> scripts generated
            </span>
            <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">|</span>
            <span>
              <span className="text-[#FAFAFA] font-semibold">{totals?.total_words?.toLocaleString()}</span> words
            </span>
            <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">|</span>
            <span>
              <span className="text-[#FAFAFA] font-semibold">{totals?.total_audio_minutes}</span> min audio
            </span>
          </div>

          {/* Savings */}
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F5A623]">{savings}</div>
            <div className="text-xs text-[#888] mt-1">cost savings</div>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span className="text-[#888]">
            AI Cost: <span className="text-[#FAFAFA] font-medium">₹{aiCost.toFixed(2)}</span>
          </span>
          <span className="text-[#888]">
            Human Cost: <span className="text-[#FAFAFA] font-medium">₹{humanCost.toLocaleString()}</span>
          </span>
          <span className="text-[#888]">
            Saved: <span className="text-[#F5A623] font-semibold">₹{cost_analysis?.savings?.saved_inr?.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
