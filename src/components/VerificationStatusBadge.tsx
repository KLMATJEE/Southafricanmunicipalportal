import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Shield, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface VerificationStatusBadgeProps {
  user: {
    creditScore?: number
    creditApproved?: boolean
    biometricVerified?: boolean
    riskScore?: number
    verificationDate?: string
  }
}

export function VerificationStatusBadge({ user }: VerificationStatusBadgeProps) {
  const hasAnyVerification = user.creditApproved !== undefined || 
                            user.biometricVerified !== undefined || 
                            user.riskScore !== undefined

  if (!hasAnyVerification) {
    return null
  }

  const getVerificationLevel = () => {
    let level = 0
    if (user.creditApproved) level++
    if (user.biometricVerified) level++
    if (user.riskScore !== undefined && user.riskScore < 0.3) level++
    
    if (level >= 3) return { label: 'Fully Verified', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' }
    if (level >= 2) return { label: 'Verified', variant: 'secondary' as const, icon: Shield, color: 'text-blue-600' }
    if (level >= 1) return { label: 'Partially Verified', variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-600' }
    return { label: 'Unverified', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
  }

  const verification = getVerificationLevel()
  const Icon = verification.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={verification.variant} className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {verification.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">Verification Details</p>
            <div className="space-y-1 text-sm">
              {user.creditApproved !== undefined && (
                <div className="flex justify-between gap-2">
                  <span>Credit Check:</span>
                  <span className={user.creditApproved ? 'text-green-600' : 'text-red-600'}>
                    {user.creditApproved ? '✓ Approved' : '✗ Not Approved'}
                  </span>
                </div>
              )}
              {user.creditScore !== undefined && user.creditScore > 0 && (
                <div className="flex justify-between gap-2">
                  <span>Credit Score:</span>
                  <span className="font-medium">{user.creditScore}</span>
                </div>
              )}
              {user.biometricVerified !== undefined && (
                <div className="flex justify-between gap-2">
                  <span>Biometric:</span>
                  <span className={user.biometricVerified ? 'text-green-600' : 'text-gray-500'}>
                    {user.biometricVerified ? '✓ Verified' : '○ Skipped'}
                  </span>
                </div>
              )}
              {user.riskScore !== undefined && (
                <div className="flex justify-between gap-2">
                  <span>Risk Score:</span>
                  <span className={user.riskScore < 0.3 ? 'text-green-600' : user.riskScore < 0.7 ? 'text-yellow-600' : 'text-red-600'}>
                    {(user.riskScore * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {user.verificationDate && (
                <div className="flex justify-between gap-2 pt-1 border-t mt-2">
                  <span>Verified:</span>
                  <span className="text-gray-600">
                    {new Date(user.verificationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
