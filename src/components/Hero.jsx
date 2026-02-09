import { motion } from 'framer-motion'
import { Lightbulb, Sparkles, Target } from 'lucide-react'

const modes = [
  { id: 'inform', label: 'Inform', Icon: Lightbulb, desc: 'Trending news explainers' },
  { id: 'imagine', label: 'Imagine', Icon: Sparkles, desc: 'Fiction & drama stories' },
  { id: 'both', label: 'Both', Icon: Target, desc: 'Mix of both' },
]

const languages = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'hinglish', label: 'Hinglish' },
]

export default function Hero({ mode, setMode, language, setLanguage, onGenerate, loading, hasResults }) {
  return (
    <div className="pt-20 sm:pt-28 pb-8 text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#F5A623] via-[#E8B84B] to-[#F5A623] bg-clip-text text-transparent">
            Kahaani AI
          </span>
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-[#888] font-light">कहानी AI</p>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="mt-6 text-lg sm:text-xl text-[#999] font-light max-w-xl mx-auto leading-relaxed"
      >
        Stories that India wants to hear, written by AI in seconds
      </motion.p>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 flex justify-center gap-3"
      >
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`
              relative px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300
              ${mode === m.id
                ? 'bg-[rgba(245,166,35,0.12)] text-[#F5A623] border border-[rgba(245,166,35,0.3)]'
                : 'glass text-[#888] hover:text-[#ccc] hover:border-[rgba(255,255,255,0.1)]'
              }
            `}
          >
            <span className="flex items-center justify-center gap-1.5">
              <m.Icon size={14} strokeWidth={2} />
              <span>{m.label}</span>
            </span>
            <span className="block text-[10px] font-normal opacity-60 mt-0.5">{m.desc}</span>
          </button>
        ))}
      </motion.div>

      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-5"
      >
        <p className="text-[10px] uppercase tracking-widest text-[#777] mb-2">Script Language</p>
        <div className="flex justify-center gap-2">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300
                ${language === l.id
                  ? 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.25)]'
                  : 'text-[#777] hover:text-[#999] border border-transparent'
                }
              `}
            >
              {l.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10"
      >
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`
            relative px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-500
            ${loading
              ? 'bg-[rgba(245,166,35,0.2)] text-[#F5A623] cursor-wait'
              : 'bg-[#F5A623] text-black hover:bg-[#E8B84B] hover:shadow-[0_0_40px_rgba(245,166,35,0.3)]'
            }
          `}
        >
          {loading ? 'Generating...' : hasResults ? 'Generate New Scripts' : 'Generate Scripts'}
        </button>
      </motion.div>
    </div>
  )
}
