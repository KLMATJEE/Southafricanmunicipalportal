import { Shield, CheckCircle, AlertCircle, Lock, FileText, Users, Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

/**
 * South African Government Design Kit
 * Contains reusable components following SA government branding standards
 */

interface SABadgeProps {
  label: string
  variant?: 'official' | 'verified' | 'secure' | 'compliance'
  size?: 'sm' | 'md' | 'lg'
}

export function SABadge({ label, variant = 'official', size = 'md' }: SABadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const variantStyles = {
    official: 'bg-sa-green text-white border-sa-gold',
    verified: 'bg-sa-gold text-black border-sa-green',
    secure: 'bg-gray-900 text-sa-gold border-sa-gold',
    compliance: 'bg-sa-blue text-white border-sa-gold'
  }

  const icons = {
    official: Shield,
    verified: CheckCircle,
    secure: Lock,
    compliance: FileText
  }

  const Icon = icons[variant]

  return (
    <Badge className={`${variantStyles[variant]} ${sizeClasses[size]} border-2 gap-1.5 font-medium`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

interface SAAlertProps {
  title: string
  description: string
  variant?: 'info' | 'warning' | 'success'
}

export function SAAlert({ title, description, variant = 'info' }: SAAlertProps) {
  const variantStyles = {
    info: 'border-sa-blue bg-sa-blue/5',
    warning: 'border-sa-gold bg-sa-gold/10',
    success: 'border-sa-green bg-sa-green/5'
  }

  const icons = {
    info: AlertCircle,
    warning: AlertCircle,
    success: CheckCircle
  }

  const Icon = icons[variant]

  return (
    <div className={`border-l-4 ${variantStyles[variant]} p-4 rounded-r-lg`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}

interface SAStatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: string; isPositive: boolean }
  description?: string
}

export function SAStatCard({ title, value, icon: Icon, trend, description }: SAStatCardProps) {
  return (
    <Card className="border-l-4 border-sa-green">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <div className="w-10 h-10 bg-sa-green/10 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-sa-green" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{value}</span>
            {trend && (
              <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SADepartmentBadgeProps {
  name: string
}

export function SADepartmentBadge({ name }: SADepartmentBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-sa-green text-white px-4 py-2 rounded-lg">
      <Building2 className="w-4 h-4" />
      <span className="text-sm font-medium">{name}</span>
    </div>
  )
}

interface SAServiceLevelProps {
  level: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
}

export function SAServiceLevel({ level, description }: SAServiceLevelProps) {
  const levelConfig = {
    excellent: { color: 'bg-green-500', label: 'Excellent Service' },
    good: { color: 'bg-sa-green', label: 'Good Service' },
    fair: { color: 'bg-sa-gold', label: 'Fair Service' },
    poor: { color: 'bg-sa-red', label: 'Needs Improvement' }
  }

  const config = levelConfig[level]

  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
      </div>
      <div>
        <p className="text-sm font-medium">{config.label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}

interface SAPOPIAComplianceProps {
  isCompliant: boolean
}

export function SAPOPIACompliance({ isCompliant }: SAPOPIAComplianceProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${
      isCompliant
        ? 'bg-green-50 border-green-500 text-green-700'
        : 'bg-red-50 border-red-500 text-red-700'
    }`}>
      {isCompliant ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isCompliant ? 'POPIA Compliant' : 'POPIA Review Required'}
      </span>
    </div>
  )
}

interface SAUserRoleBadgeProps {
  role: string
}

export function SAUserRoleBadge({ role }: SAUserRoleBadgeProps) {
  const roleConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    admin: { bg: 'bg-red-100', text: 'text-red-700', icon: Shield },
    billing_officer: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileText },
    auditor: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FileText },
    supervisor: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Users },
    citizen: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Users }
  }

  const config = roleConfig[role] || roleConfig.citizen
  const Icon = config.icon

  return (
    <Badge className={`${config.bg} ${config.text} gap-1.5`}>
      <Icon className="w-3 h-3" />
      {role.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

export const GovernmentKit = {
  SABadge,
  SAAlert,
  SAStatCard,
  SADepartmentBadge,
  SAServiceLevel,
  SAPOPIACompliance,
  SAUserRoleBadge
}
