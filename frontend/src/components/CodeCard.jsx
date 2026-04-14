import { motion } from 'framer-motion'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CodeCard({ code, isPrimary, index }) {
  const copyCode = () => {
    navigator.clipboard.writeText(code.code)
    toast.success('Code copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-6 border transition-all hover:shadow-lg ${
        isPrimary
          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-pink-400/50 shadow-lg shadow-pink-500/20'
          : 'bg-white/10 border-white/20 hover:border-white/40'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold font-mono text-white">
              {code.code}
            </span>
            {isPrimary && (
              <span className="px-3 py-1 bg-yellow-500/30 text-yellow-200 rounded-full text-xs font-semibold">
                PRIMARY
              </span>
            )}
            {index && (
              <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-semibold">
                #{index}
              </span>
            )}
          </div>
          {code.confidence && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all"
                  style={{ width: `${code.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-white">
                {(code.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        <button
          onClick={copyCode}
          className="p-2 hover:bg-white/20 rounded-lg transition-all"
          title="Copy code"
        >
          <Copy size={18} className="text-gray-300" />
        </button>
      </div>

      <div className="space-y-3">
        {code.short_desc && (
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Short Description
            </p>
            <p className="text-white font-semibold">{code.short_desc}</p>
          </div>
        )}

        {code.reasoning && (
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Reason
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">
              {code.reasoning}
            </p>
          </div>
        )}

        {code.description && !code.long_desc && (
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">
              {code.description}
            </p>
          </div>
        )}

        {code.source && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-gray-400 text-xs">
              Source: <span className="text-purple-300 font-semibold">{code.source}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
