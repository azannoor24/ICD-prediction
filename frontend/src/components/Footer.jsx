import { Heart, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black/40 border-t border-white/10 mt-16 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              AI-powered ICD-10 code prediction system for healthcare professionals.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Features</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>✓ Instant predictions</li>
              <li>✓ Confidence scores</li>
              <li>✓ JSON export</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart size={16} className="text-pink-500" /> for healthcare professionals
          </p>
          <p className="mt-2">© 2024 ICD-10 Prediction System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
