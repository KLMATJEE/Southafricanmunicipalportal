import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { api } from '../utils/api'
import { 
  Shield, 
  User, 
  CreditCard, 
  Camera, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  IdCard,
  Fingerprint,
  Activity
} from 'lucide-react'
import { Badge } from './ui/badge'

interface VerifiedUserOnboardingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function VerifiedUserOnboarding({ open, onOpenChange, onSuccess }: VerifiedUserOnboardingProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationResults, setVerificationResults] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'citizen',
    phone: '',
    idType: 'sa_id',
    idNumber: '',
    photoUrl: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange('photoUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all basic information fields')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.idType || !formData.idNumber) {
      setError('Please provide valid government ID information')
      return false
    }
    
    // Validate SA ID number format (13 digits)
    if (formData.idType === 'sa_id' && !/^\d{13}$/.test(formData.idNumber)) {
      setError('South African ID number must be 13 digits')
      return false
    }
    
    return true
  }

  const validateStep3 = () => {
    if (!formData.phone) {
      setError('Phone number is required for verification')
      return false
    }
    
    // Validate SA phone number format
    if (!/^(\+27|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid South African phone number')
      return false
    }
    
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
      setStep(4)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.createVerifiedUser(formData)
      
      if (response.success) {
        setVerificationResults(response.verification)
        setStep(5) // Success screen
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          // Reset form
          setFormData({
            email: '',
            password: '',
            name: '',
            role: 'citizen',
            phone: '',
            idType: 'sa_id',
            idNumber: '',
            photoUrl: ''
          })
          setStep(1)
          setVerificationResults(null)
        }, 3000)
      }
    } catch (err: any) {
      console.error('Verified user creation error:', err)
      setError(err.message || 'Failed to create verified user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Enhanced Verified User Onboarding
          </DialogTitle>
          <DialogDescription>
            Multi-step verification including ID verification, credit checks, biometric authentication, and behavioral analysis
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div 
                  className={`h-1 w-16 ${
                    step > s ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3>Step 1: Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Thabo Mbeki"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="thabo@example.co.za"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="billing_officer">Billing Officer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Government ID Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <IdCard className="w-5 h-5 text-purple-600" />
                <h3>Step 2: Government ID Verification</h3>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your ID information will be securely verified against government databases
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="idType">ID Type</Label>
                <Select value={formData.idType} onValueChange={(value) => handleInputChange('idType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sa_id">South African ID (Smart Card)</SelectItem>
                    <SelectItem value="greenbook">Green Book ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="smartcard">Smart Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder={formData.idType === 'sa_id' ? '13-digit ID number' : 'Enter ID/Passport number'}
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  required
                />
                {formData.idType === 'sa_id' && (
                  <p className="text-sm text-gray-500">Format: YYMMDDGGGGSSCZ (13 digits)</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Contact & Credit Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h3>Step 3: Contact & Credit Verification</h3>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We'll perform a credit check via PayJoy to verify creditworthiness
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 XX XXX XXXX or 0XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Required for credit check and adaptive authentication
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Verification Checks
                </h4>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li>Credit score assessment via PayJoy API</li>
                  <li>Behavioral risk analysis</li>
                  <li>Phone number validation</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Biometric Authentication (Optional) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Fingerprint className="w-5 h-5 text-green-600" />
                <h3>Step 4: Biometric Authentication (Optional)</h3>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload a photo for facial recognition verification via Incode. This step is optional but recommended for enhanced security.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                />
                {formData.photoUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                    />
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Photo uploaded successfully
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Biometric Verification
                </h4>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li>Facial recognition via Incode API</li>
                  <li>Liveness detection to prevent spoofing</li>
                  <li>Match verification against ID photo</li>
                </ul>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  All verification data is encrypted and stored securely. We comply with POPIA (Protection of Personal Information Act) regulations.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && verificationResults && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                <h3 className="text-xl mb-2">Verification Successful!</h3>
                <p className="text-gray-600 text-center mb-6">
                  User has been created and verified successfully
                </p>

                <div className="w-full space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Verification Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Credit Check:</span>
                        <Badge variant={verificationResults.creditApproved ? "default" : "destructive"}>
                          {verificationResults.creditApproved ? 'Approved' : 'Not Approved'}
                        </Badge>
                      </div>
                      {verificationResults.creditScore > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Credit Score:</span>
                          <span className="font-medium">{verificationResults.creditScore}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Biometric Verification:</span>
                        <Badge variant={verificationResults.biometricVerified ? "default" : "secondary"}>
                          {verificationResults.biometricVerified ? 'Verified' : 'Skipped'}
                        </Badge>
                      </div>
                      {verificationResults.riskScore !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Risk Score:</span>
                          <span className="font-medium">
                            {(verificationResults.riskScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation buttons */}
          {step < 5 && (
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isLoading}
              >
                Back
              </Button>
              
              {step < 4 ? (
                <Button type="button" onClick={handleNext} disabled={isLoading}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating User...' : 'Create Verified User'}
                </Button>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
