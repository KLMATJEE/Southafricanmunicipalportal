import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { api } from '../utils/api'
import { FileText, Download, CreditCard, CheckCircle2 } from 'lucide-react'
import { SABadge } from './GovernmentKit'

interface BillingPortalProps {
  bills: any[]
  payments: any[]
  onPaymentComplete: () => void
}

// Transaction fee configuration
const TRANSACTION_FEES: { [key: string]: number } = {
  'card': 5.00,
  'eft': 5.00,
  'payfast': 5.00,
  'stripe': 5.00,
  'in-person': 0.00, // Free alternative
}

export function BillingPortal({ bills, payments, onPaymentComplete }: BillingPortalProps) {
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  const transactionFee = TRANSACTION_FEES[paymentMethod] || 0
  const totalWithFee = selectedBill ? selectedBill.total + transactionFee : 0
  
  const handlePayment = async () => {
    if (!selectedBill) return
    
    setIsProcessing(true)
    try {
      await api.makePayment({
        billId: selectedBill.id,
        amount: selectedBill.total,
        method: paymentMethod,
        transactionFee,
        totalWithFee,
      })
      
      setShowPaymentDialog(false)
      onPaymentComplete()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const downloadInvoice = (bill: any) => {
    // Generate a simple text invoice
    const invoiceText = `
MUNICIPAL INVOICE
================

Invoice ID: ${bill.id}
Date: ${new Date(bill.createdAt).toLocaleDateString()}
Due Date: ${new Date(bill.dueDate).toLocaleDateString()}
Status: ${bill.status}

SERVICES
--------
${bill.services.map((s: any) => `${s.name}: R ${s.amount.toFixed(2)}`).join('\n')}

TOTAL: R ${bill.total.toFixed(2)}
    `.trim()
    
    const blob = new Blob([invoiceText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${bill.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Bills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Bills</CardTitle>
          <CardDescription>View and pay your municipal bills</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bills available
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Bill #{bill.id.split('_')[2]}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {bill.services.map((service: any, idx: number) => (
                        <span key={idx}>{service.name}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl">R {bill.total.toFixed(2)}</p>
                      <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                        {bill.status}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice(bill)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {bill.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill)
                            setShowPaymentDialog(true)
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment history
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment {payment.receiptNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R {payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 capitalize">{payment.method}</p>
                    {payment.transactionFee > 0 && (
                      <p className="text-xs text-gray-400">Fee: R {payment.transactionFee.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Choose your payment method and confirm the transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Amount:</span>
                  <span className="font-medium">R {selectedBill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convenience Fee:</span>
                  <span className={transactionFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {transactionFee === 0 ? 'FREE' : `R ${transactionFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-semibold">R {totalWithFee.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  Due Date: {new Date(selectedBill.dueDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">💳 Credit/Debit Card (R5 fee)</SelectItem>
                    <SelectItem value="eft">🏦 EFT (R5 fee)</SelectItem>
                    <SelectItem value="payfast">⚡ PayFast (R5 fee)</SelectItem>
                    <SelectItem value="stripe">🌐 Stripe (R5 fee)</SelectItem>
                    <SelectItem value="in-person">🏢 In-Person Payment (FREE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {transactionFee > 0 ? (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-medium text-blue-900 mb-1">💡 Convenience Fee</p>
                  <p>A R{transactionFee.toFixed(2)} convenience fee applies for online payments to cover processing costs. This fee helps us maintain secure payment systems and faster service.</p>
                  <p className="mt-2 text-blue-700">Want to avoid the fee? Select "In-Person Payment" to pay at any municipal office for free.</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border border-green-200">
                  <p className="font-medium text-green-900 mb-1">✅ No Convenience Fee</p>
                  <p>In-person payments are completely free! Visit any municipal office during business hours to complete your payment.</p>
                </div>
              )}
              
              {paymentMethod !== 'in-person' && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  In production, this would integrate with payment gateways like PayFast or Stripe for secure processing.
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 
                  paymentMethod === 'in-person' 
                    ? `Schedule In-Person Payment - R ${selectedBill.total.toFixed(2)}`
                    : `Pay Now - R ${totalWithFee.toFixed(2)}`
                }
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
