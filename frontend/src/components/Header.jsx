import { Activity, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 shadow-2xl">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Activity size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">ICD-10 Predictor</h1>
        </div>
        <p className="text-lg text-purple-100 max-w-2xl">
          AI-powered medical code extraction and prediction system. Upload your clinical reports and get instant ICD-10 code predictions with confidence scores.
        </p>
        <div className="flex gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <Zap size={18} />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <Activity size={18} />
            <span>Highly Accurate</span>
          </div>
        </div>
      </div>
    </header>
  )
}
