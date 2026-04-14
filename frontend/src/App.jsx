import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import ResultsSection from './components/ResultsSection'
import Footer from './components/Footer'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <UploadSection 
          onResultsChange={setResults}
          loading={loading}
          setLoading={setLoading}
        />
        
        {results && (
          <ResultsSection results={results} />
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default App
