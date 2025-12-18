/**
 * Meter Registration Form
 * 
 * Allows users to register new electricity or water meters
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface MeterRegistrationFormProps {
  userId: string;
  accessToken?: string;
  onSuccess?: () => void;
}

export function MeterRegistrationForm({ userId, accessToken, onSuccess }: MeterRegistrationFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meterType: 'electricity',
    provider: 'city_power_jhb',
    locationName: '',
    isSmart: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4/meters/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            meterType: formData.meterType,
            provider: formData.provider,
            location: {
              name: formData.locationName || `${formData.meterType} meter`
            },
            isSmart: formData.isSmart
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register meter');
      }

      const result = await response.json();
      toast.success('Meter registered successfully!');
      
      // Reset form
      setFormData({
        meterType: 'electricity',
        provider: 'city_power_jhb',
        locationName: '',
        isSmart: true
      });
      
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
      console.error('Meter registration error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          Register Meter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Meter</DialogTitle>
          <DialogDescription>
            Add a new electricity or water meter to track your usage
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meterType">Meter Type</Label>
            <Select
              value={formData.meterType}
              onValueChange={(value) => setFormData({ ...formData, meterType: value })}
            >
              <SelectTrigger id="meterType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="water">Water</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({ ...formData, provider: value })}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formData.meterType === 'electricity' ? (
                  <>
                    <SelectItem value="city_power_jhb">City Power (Johannesburg)</SelectItem>
                    <SelectItem value="eskom">Eskom</SelectItem>
                    <SelectItem value="city_of_ct">City of Cape Town</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="jhb_water">Johannesburg Water</SelectItem>
                    <SelectItem value="rand_water">Rand Water</SelectItem>
                    <SelectItem value="city_of_ct_water">City of Cape Town Water</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name (Optional)</Label>
            <Input
              id="locationName"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              placeholder="e.g., Main House, Cottage"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSmart"
              checked={formData.isSmart}
              onChange={(e) => setFormData({ ...formData, isSmart: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isSmart" className="cursor-pointer">
              Smart meter (automatic readings)
            </Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Meter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
