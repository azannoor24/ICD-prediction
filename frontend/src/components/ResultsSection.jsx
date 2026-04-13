import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Code, FileJson, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import CodeCard from './CodeCard'
import StatsCard from './StatsCard'

export default function ResultsSection({ results }) {
  const [activeTab, setActiveTab] = useState('codes')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  // Handle combined results (all files processed together)
  const prediction = results.prediction || {}
  const secondary = prediction.secondary || []
  const totalCodes = prediction.total_codes || (secondary.length + 1)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadJSON = () => {
    const element = document.createElement('a')
    element.href = URL.createObjectURL(
      new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    )
    element.download = `prediction_${Date.now()}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Downloaded!')
  }

  const handleEvaluate = async () => {
    setEvaluating(true)
    const toastId = toast.loading('Running LLM2 evaluation...')

    try {
      const response = await axios.post('/api/evaluate', {
        prediction: prediction,
        report: results.combined_report_preview
      })

      setEvaluation(response.data.evaluation)
      setActiveTab('evaluation')
      toast.success('Evaluation complete!', { id: toastId })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Evaluation failed', { id: toastId })
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard
          label="Total Codes"
          value={totalCodes}
          icon="📊"
        />
        <StatsCard
          label="Primary Code"
          value="1"
          icon="🎯"
        />
        <StatsCard
          label="Secondary Codes"
          value={secondary.length}
          icon="📋"
        />
      </div>

      {/* Report Preview */}
      {results.combined_report_preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info size={20} />
            Report Preview
          </h3>
          <div className="bg-black/30 rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-gray-300 text-sm leading-relaxed">
              {results.combined_report_preview}...
            </p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/20 overflow-x-auto">
        {[
          { id: 'codes', label: '🔍 ICD-10 Codes', icon: Code },
          { id: 'json', label: '{ } JSON Data', icon: FileJson },
          { id: 'meta', label: 'ℹ️ Metadata', icon: Info },
          ...(evaluation ? [{ id: 'evaluation', label: '✅ Evaluation', icon: Info }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white border-b-pink-500'
                : 'text-gray-400 border-b-transparent hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Evaluate Button */}
      {!evaluation && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleEvaluate}
          disabled={evaluating}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {evaluating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Running LLM2 Evaluation...
            </>
          ) : (
            <>
              ✅ Verify with LLM2
            </>
          )}
        </motion.button>
      )}

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        {activeTab === 'codes' && (
          <div className="space-y-6">
            {/* Primary Diagnosis */}
            {prediction.primary && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Primary Diagnosis
                </h3>
                <CodeCard
                  code={prediction.primary}
                  isPrimary={true}
                />
              </div>
            )}

            {/* Secondary Diagnoses */}
            {secondary.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Secondary Diagnoses ({secondary.length})
                </h3>
                <div className="grid gap-4">
                  {secondary.map((code, idx) => (
                    <CodeCard
                      key={idx}
                      code={code}
                      isPrimary={false}
                      index={idx + 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => copyToClipboard(JSON.stringify(prediction, null, 2))}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
              >
                <Copy size={18} />
                Copy
              </button>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition-all"
              >
                <Download size={18} />
                Download
              </button>
            </div>
            <pre className="bg-black/50 text-gray-300 p-6 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(prediction, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'meta' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm">File Count</p>
                <p className="text-white font-semibold mt-1">{results.file_count || 1}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm">Backend</p>
                <p className="text-white font-semibold mt-1">
                  {results.meta?.backend || 'N/A'}
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Summary</p>
              <p className="text-white">{results.summary}</p>
            </div>
            {results.meta?.explicit_codes_found?.length > 0 && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Explicit Codes Found</p>
                <div className="flex flex-wrap gap-2">
                  {results.meta.explicit_codes_found.map((code, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm font-mono"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluation' && evaluation && (
          <div className="space-y-6">
            {/* Evaluation Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-400/30">
                <p className="text-gray-300 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-green-300 mt-2">
                  {(evaluation.metrics?.accuracy * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-400/30">
                <p className="text-gray-300 text-sm">Verified</p>
                <p className="text-2xl font-bold text-blue-300 mt-2">
                  {evaluation.metrics?.verified_codes || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-4 rounded-lg border border-red-400/30">
                <p className="text-gray-300 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-300 mt-2">
                  {evaluation.metrics?.rejected_codes || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-400/30">
                <p className="text-gray-300 text-sm">Missed</p>
                <p className="text-2xl font-bold text-yellow-300 mt-2">
                  {evaluation.metrics?.missed_codes || 0}
                </p>
              </div>
            </div>

            {/* Per-Code Results */}
            {evaluation.per_code_results && evaluation.per_code_results.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Per-Code Breakdown</h3>
                <div className="space-y-3">
                  {evaluation.per_code_results.map((result, idx) => {
                    const statusColors = {
                      keep: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
                      remove: 'from-red-500/20 to-pink-500/20 border-red-400/30',
                      add: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
                    }
                    const statusIcons = {
                      keep: '✓',
                      remove: '✗',
                      add: '+',
                    }
                    const statusLabels = {
                      keep: 'Keep',
                      remove: 'Remove',
                      add: 'Add',
                    }

                    return (
                      <div
                        key={idx}
                        className={`bg-gradient-to-r ${statusColors[result.status] || statusColors.keep} p-4 rounded-lg border`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">{statusIcons[result.status]}</span>
                            <div>
                              <p className="text-white font-semibold">{result.code}</p>
                              <p className="text-gray-300 text-sm">{result.description}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                            {statusLabels[result.status]}
                          </span>
                        </div>
                        {result.reasoning && (
                          <p className="text-gray-200 text-sm ml-8">
                            💡 {result.reasoning}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {evaluation.metrics?.notes && (
              <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <span className="font-semibold">📝 Notes:</span> {evaluation.metrics.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
