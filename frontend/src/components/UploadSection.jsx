import { useState, useRef } from 'react'
import { Upload, FileText, Zap, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function UploadSection({ onResultsChange, loading, setLoading }) {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles([...files, ...newFiles])
    }
  }

  const handleChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handlePredict = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setLoading(true)
    setProgress(0)
    setCurrentStage('Uploading...')
    setStartTime(Date.now())
    
    // Estimate time based on file count and size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const estimatedSeconds = Math.max(15, Math.min(120, 10 + files.length * 8 + (totalSize / (1024 * 1024)) * 2))
    setEstimatedTime(estimatedSeconds)
    
    const toastId = toast.loading(`Processing ${files.length} file(s)...`)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      // Realistic progress simulation with stages
      const stages = [
        { name: 'Uploading files...', duration: 0.1, progress: 10 },
        { name: 'Extracting text...', duration: 0.25, progress: 35 },
        { name: 'Analyzing with AI...', duration: 0.35, progress: 70 },
        { name: 'Verifying codes...', duration: 0.2, progress: 90 },
        { name: 'Finalizing...', duration: 0.1, progress: 95 }
      ]

      let currentStageIndex = 0
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const progressRatio = Math.min(elapsed / estimatedSeconds, 0.95)
        
        // Update stage based on progress
        for (let i = 0; i < stages.length; i++) {
          if (progressRatio * 100 <= stages[i].progress) {
            if (currentStageIndex !== i) {
              currentStageIndex = i
              setCurrentStage(stages[i].name)
            }
            break
          }
        }
        
        // Smooth progress that never exceeds 95% until complete
        const targetProgress = progressRatio * 95
        setProgress((prev) => {
          const increment = (targetProgress - prev) * 0.3
          return Math.min(95, prev + increment)
        })
      }, 300)

      const response = await axios.post('/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      clearInterval(progressInterval)
      setCurrentStage('Complete!')
      setProgress(100)

      onResultsChange(response.data)
      toast.success('Prediction complete!', { id: toastId })
      
      // Reset after a short delay
      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setCurrentStage('')
        setEstimatedTime(0)
        setStartTime(null)
      }, 1000)
    } catch (error) {
      setProgress(0)
      setCurrentStage('')
      setEstimatedTime(0)
      setStartTime(null)
      toast.error(error.response?.data?.error || 'Prediction failed', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    const toastId = toast.loading('Loading demo report...')

    try {
      const response = await axios.get('/api/demo')
      onResultsChange(response.data)
      toast.success('Demo loaded!', { id: toastId })
    } catch (error) {
      toast.error('Failed to load demo', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg">
            <Upload size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Upload Report</h2>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-pink-400 bg-pink-400/10'
              : 'border-white/30 bg-white/5 hover:bg-white/10'
          }`}
        >
          <FileText size={48} className="mx-auto mb-4 text-purple-300" />
          <p className="text-white font-semibold mb-2">
            Drag and drop your file here
          </p>
          <p className="text-gray-300 text-sm mb-4">
            or click to browse
          </p>
          <p className="text-gray-400 text-xs">
            Supported: PDF, TXT, MD (Max 50MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept=".pdf,.txt,.md"
          multiple
          className="hidden"
        />

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-white font-semibold">✓ Selected Files ({files.length})</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30"
                >
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm font-mono truncate">{file.name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="ml-2 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <X size={18} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || files.length === 0}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Processing {files.length} file(s)...
            </>
          ) : (
            <>
              <Zap size={20} />
              Predict Codes
            </>
          )}
        </button>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm">{currentStage}</p>
              <p className="text-pink-400 font-bold text-sm">{Math.round(progress)}%</p>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              ></motion.div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-3 text-gray-400">
                <span className={progress >= 10 ? 'text-purple-300' : ''}>📤 Upload</span>
                <span className={progress >= 35 ? 'text-purple-300' : ''}>📄 Extract</span>
                <span className={progress >= 70 ? 'text-purple-300' : ''}>🤖 Analyze</span>
                <span className={progress >= 90 ? 'text-purple-300' : ''}>✅ Verify</span>
              </div>
              {estimatedTime > 0 && progress < 95 && (
                <span className="text-gray-400">
                  ~{Math.max(0, Math.round(estimatedTime * (1 - progress / 100)))}s remaining
                </span>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-white font-semibold">Upload a Report</p>
              <p className="text-gray-300 text-sm">PDF, TXT, or MD format</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-white font-semibold">AI Processes</p>
              <p className="text-gray-300 text-sm">Extracts and predicts codes</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-white font-semibold">View Results</p>
              <p className="text-gray-300 text-sm">With confidence scores</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all border border-white/30 hover:border-white/50"
        >
          {loading ? 'Loading...' : '📋 Try Demo Report'}
        </button>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">💡 Tip:</span> Try the demo report first to see how the system works!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
