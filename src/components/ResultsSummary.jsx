import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

export default function ResultsSummary({ data }) {
  const { totals, cost_analysis } = data
  const savings = cost_analysis?.savings?.multiplier || '—'
  const aiCost = cost_analysis?.ai?.total_inr || 0
  const humanCost = cost_analysis?.human?.total_inr || 0
  const humanBasis = cost_analysis?.human?.basis || 'Indian freelance content marketplace average'
  const aiPerScript = cost_analysis?.ai?.per_script_inr || 0
  const humanPerScript = cost_analysis?.human?.per_script_inr || 650
  const aiConfidence = cost_analysis?.ai?.confidence || null
  const isEstimate = cost_analysis?.ai?.is_estimate || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary strip */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
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
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F5A623]">{savings}</div>
            <div className="text-xs text-[#999] mt-1">cost savings</div>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2 text-xs sm:text-sm">
          <span className="text-[#999]">
            AI Cost{isEstimate ? '*' : ''}: <span className="text-[#FAFAFA] font-medium">₹{aiCost.toFixed(2)}</span>
            <span className="text-[#888] ml-1">(₹{aiPerScript.toFixed(2)}/script)</span>
            {aiConfidence && (
              <span className="inline-flex items-center gap-1 ml-2 text-[10px] text-[#F5A623] opacity-80">
                <Info size={10} />
                {aiConfidence}% confidence
              </span>
            )}
          </span>
          <span className="text-[#999]">
            Human Cost: <span className="text-[#FAFAFA] font-medium">₹{humanCost.toLocaleString()}</span>
            <span className="text-[#888] ml-1">(₹{humanPerScript}/script)</span>
          </span>
          <span className="text-[#999]">
            Saved: <span className="text-[#F5A623] font-semibold">₹{cost_analysis?.savings?.saved_inr?.toLocaleString()}</span>
          </span>
        </div>

        {/* Basis footnote */}
        <p className="mt-3 text-[10px] text-[#888] leading-relaxed">
          {isEstimate ? '*AI cost is an estimate — ' : ''}Token count approximated at ~4 chars/token from measured prompt and response lengths. Based on official GPT-4.1 API pricing ($2/M input, $8/M output tokens) at ₹90/USD. Actual cost may vary ±15%. Human cost based on {humanBasis}. Professional audio scriptwriting rates are typically ₹1,500-5,000/script — real savings may be significantly higher.
        </p>
      </div>
    </motion.div>
  )
}
