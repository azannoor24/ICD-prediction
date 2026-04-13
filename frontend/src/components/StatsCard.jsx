import { motion } from 'framer-motion'

export default function StatsCard({ label, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
            {label}
          </p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-50">{icon}</div>
      </div>
    </motion.div>
  )
}
