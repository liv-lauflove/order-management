'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings } from './actions'
import { toast } from 'sonner'
import { Settings } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function SettingsForm({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false)
  
  async function action(formData: FormData) {
    setLoading(true)
    try {
      await updateSettings(settings.id, formData)
      toast.success('Settings updated successfully')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto w-full mt-4">
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          Manage your company information, branding, and invoice prefixes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form key={settings.updatedAt.toString()} action={action} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
              <Input id="companyName" name="companyName" defaultValue={settings.companyName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogoUrl">Company Logo URL <span className="text-destructive">*</span></Label>
              <Input id="companyLogoUrl" name="companyLogoUrl" defaultValue={settings.companyLogoUrl || ''} placeholder="https://..." required />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Company Address <span className="text-destructive">*</span></Label>
              <Input id="address" name="address" defaultValue={settings.address || ''} placeholder="Full address..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number <span className="text-destructive">*</span></Label>
              <Input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber || ''} placeholder="+62..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account Details <span className="text-destructive">*</span></Label>
              <Input id="bankAccount" name="bankAccount" defaultValue={settings.bankAccount || ''} placeholder="e.g. BCA 123456 a/n DC Habitat" required />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground tracking-tight">Invoice Settings</h3>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="invoicePrefix">Invoice Prefix <span className="text-destructive">*</span></Label>
              <Input id="invoicePrefix" name="invoicePrefix" defaultValue={settings.invoicePrefix} required />
              <p className="text-xs text-muted-foreground mt-1">This prefix will be used for auto-generating invoices (e.g., {settings.invoicePrefix}-0001).</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
