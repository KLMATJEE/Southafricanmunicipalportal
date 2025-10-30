import { Shield, Globe } from 'lucide-react'

export function GovernmentHeader() {
  return (
    <div className="bg-sa-green border-b-4 border-sa-gold">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-sa-green" />
            </div>
            <div className="text-white">
              <div className="flex items-center gap-2">
                <span className="tracking-wide">Republic of South Africa</span>
              </div>
              <p className="text-xs text-sa-gold opacity-90">Department of Cooperative Governance</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-white text-xs">
            <Globe className="w-4 h-4" />
            <span>Transparency • Accountability • Service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
