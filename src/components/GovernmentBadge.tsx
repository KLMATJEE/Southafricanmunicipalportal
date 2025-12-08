import { Badge } from './ui/badge'
import { Shield } from 'lucide-react'

interface GovernmentBadgeProps {
  label: string
  variant?: 'official' | 'verified' | 'secure'
}

export function GovernmentBadge({ label, variant = 'official' }: GovernmentBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'official':
        return 'bg-sa-green text-white border-sa-gold'
      case 'verified':
        return 'bg-sa-gold text-black border-sa-green'
      case 'secure':
        return 'bg-gray-900 text-sa-gold border-sa-gold'
      default:
        return 'bg-sa-green text-white'
    }
  }

  return (
    <Badge className={`${getVariantStyles()} border-2 gap-1.5 px-3 py-1`}>
      <Shield className="w-3 h-3" />
      {label}
    </Badge>
  )
}
