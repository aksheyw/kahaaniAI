import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const stages = [
  { text: 'Scanning trending topics across India', icon: '🔍', duration: 4000 },
  { text: 'Discovered topics from Google News & Google Trends', icon: '📰', duration: 3000 },
  { text: 'AI Research Agent selecting top 3 stories', icon: '🧠', duration: 5000 },
  { text: 'Writing scripts', icon: '✍️', duration: 15000 },
  { text: 'Scoring quality & calculating costs', icon: '📊', duration: 3000 },
]

export default function LoadingStages({ language }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timers = []
    let total = 0
    stages.forEach((stage, i) => {
      if (i === 0) return
      total += stages[i - 1].duration
      timers.push(setTimeout(() => setCurrentStage(i), total))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // Track elapsed seconds for the "still working" message
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const langLabel = language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish' : 'English'
  const allStagesDone = currentStage === stages.length - 1
  const totalTimerDone = elapsed > 32

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="mt-16 max-w-lg mx-auto"
    >
      <div className="glass rounded-2xl p-8 sm:p-10">
        <div className="space-y-5">
          {stages.map((stage, i) => {
            const isActive = i === currentStage
            const isDone = i < currentStage
            const isPending = i > currentStage
            let text = stage.text
            if (i === 3) text = `Writing scripts in ${langLabel}`

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isPending ? 0.2 : 1,
                  x: 0,
                }}
                transition={{ duration: 0.5, delay: isPending ? 0 : 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Status indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${isDone ? 'bg-[rgba(245,166,35,0.15)] text-[#F5A623]' : ''}
                  ${isActive ? 'bg-[rgba(245,166,35,0.2)]' : ''}
                  ${isPending ? 'bg-[rgba(255,255,255,0.03)]' : ''}
                `}>
                  {isDone ? '✓' : stage.icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className={`text-sm sm:text-base transition-colors duration-500
                    ${isActive ? 'text-[#FAFAFA]' : isDone ? 'text-[#999]' : 'text-[#555]'}
                  `}>
                    {text}
                    {isActive && (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-1 text-[#F5A623]"
                      >
                        ...
                      </motion.span>
                    )}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* "Still working" message — appears after all timer stages complete */}
          {allStagesDone && totalTimerDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mt-2"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[rgba(245,166,35,0.2)]">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </motion.span>
              </div>
              <p className="text-sm text-[#FAFAFA]">
                Almost there — polishing the final output
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-1 text-[#F5A623]"
                >
                  ...
                </motion.span>
              </p>
            </motion.div>
          )}
        </div>

        {/* Progress bar — stops at 90% until "still working" then pulses */}
        <div className="mt-8 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#F5A623] to-[#E8B84B] rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: allStagesDone && totalTimerDone
                ? ['88%', '92%', '88%']
                : `${((currentStage + 1) / stages.length) * 90}%`,
            }}
            transition={
              allStagesDone && totalTimerDone
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8, ease: 'easeOut' }
            }
          />
        </div>
      </div>
    </motion.div>
  )
}
