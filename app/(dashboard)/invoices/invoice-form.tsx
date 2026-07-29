'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ArrowLeft, Upload, FileImage } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createInvoice, updateInvoice, updateInvoiceStatus, getNextInvoiceNumber, CreateInvoiceInput } from './actions'

export function InvoiceForm({
  initialData,
  customers,
  orders,
  nextInvoiceNo
}: {
  initialData?: any
  customers: { id: string, name: string }[]
  orders: { id: string, orderNumber: string, projectName: string }[]
  nextInvoiceNo: string
}) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [loading, setLoading] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || nextInvoiceNo)
  const [customerId, setCustomerId] = useState(initialData?.customerId || '')
  const [orderId, setOrderId] = useState(initialData?.orderId || '')
  const [discountPercent, setDiscountPercent] = useState<number | string>(initialData && initialData.subtotal > 0 ? (Number(initialData.discount) / Number(initialData.subtotal)) * 100 : 0)
  const [dp, setDp] = useState<number | string>(initialData?.dp !== undefined ? Number(initialData.dp) : 0)
  const [taxRate, setTaxRate] = useState<number | string>(initialData && (Number(initialData.subtotal) - Number(initialData.discount)) > 0 ? (Number(initialData.tax) / (Number(initialData.subtotal) - Number(initialData.discount)) * 100) : 11)
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '')
  
  const [items, setItems] = useState<{
    id?: string, 
    description: string, 
    qty: number | string, 
    price: number | string,
    productImage?: string,
    file?: File | null
  }[]>(
    initialData?.items?.map((item: any) => ({
      id: item.id,
      description: item.description,
      qty: item.qty,
      price: Number(item.price),
      productImage: item.productImage
    })) || [{ description: '', qty: 1, price: 0 }]
  )

  const handleAddItem = () => {
    setItems([...items, { description: '', qty: 1, price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items]
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleItemChange(index, 'file', e.target.files[0])
    }
  }

  const handleRemoveImage = (index: number) => {
    const newItems = [...items]
    newItems[index].file = null
    newItems[index].productImage = undefined
    setItems(newItems)
  }

  const convertFilesToBase64 = async () => {
    const itemsWithUploadedImages = [...items]
    
    for (let i = 0; i < itemsWithUploadedImages.length; i++) {
      const file = itemsWithUploadedImages[i].file
      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = error => reject(error)
        })
        
        itemsWithUploadedImages[i].productImage = base64
        delete itemsWithUploadedImages[i].file // clean up before sending to server
      }
    }
    
    return itemsWithUploadedImages
  }

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + ((Number(item.qty) || 0) * (Number(item.price) || 0)), 0)
  const discountAmount = subtotal * ((Number(discountPercent) || 0) / 100)
  const tax = (subtotal - discountAmount) * ((Number(taxRate) || 0) / 100)
  const total = subtotal - discountAmount + tax
  const remaining = total - (Number(dp) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId) {
      toast.error('Please select a customer')
      return
    }

    if (items.some(i => !i.description)) {
      toast.error('All items must have a description')
      return
    }

    try {
      setLoading(true)
      toast.loading('Processing invoice...', { id: 'invoice-form' })
      
      const processedItems = await convertFilesToBase64()

      const payload: CreateInvoiceInput = {
        invoiceNumber,
        customerId,
        orderId: orderId || undefined,
        logoUrl,
        discount: discountAmount,
        dp: Number(dp) || 0,
        taxRate: Number(taxRate) || 0,
        notes,
        items: processedItems.map(i => ({
          ...i,
          qty: Number(i.qty) || 1,
          price: Number(i.price) || 0
        }))
      }

      // Fix serialization issue for Server Actions
      const safePayload = JSON.parse(JSON.stringify(payload))

      if (isEditing) {
        await updateInvoice(initialData.id, safePayload)
        toast.success('Invoice updated successfully', { id: 'invoice-form' })
        router.push(`/invoices/${initialData.id}`)
      } else {
        const invoiceId = await createInvoice(safePayload)
        toast.success('Invoice created successfully', { id: 'invoice-form' })
        router.push(`/invoices/${invoiceId}`)
      }

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'An error occurred', { id: 'invoice-form' })
    } finally {
      setLoading(false)
    }
  }

  // Calculations are hoisted above

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-heading">
            {isEditing ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
        </div>
        <Button type="submit" disabled={loading} className="px-8">
          {loading ? 'Saving...' : 'Save Invoice'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-2 text-heading">General Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input id="invoiceNumber" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <select 
              id="customerId" 
              value={customerId} 
              onChange={e => setCustomerId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderId">Link to Order (Optional)</Label>
            <select 
              id="orderId" 
              value={orderId} 
              onChange={e => setOrderId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">-- No Order Selected --</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>{o.orderNumber} - {o.projectName}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Custom Logo URL (Optional)</Label>
            <Input id="logoUrl" placeholder="https://..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">Overrides the default company logo in Settings.</p>
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-2 text-heading">Summary Preview</h2>
          
          <div className="flex-1 space-y-3 mt-4 bg-muted/20 p-4 rounded-lg border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Discount (%)</span>
              <div className="w-32">
                <Input 
                  type="number" 
                  value={discountPercent} 
                  onChange={e => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="h-8 text-right"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Tax Rate (%)</span>
              <div className="w-20">
                <Input 
                  type="number" 
                  value={taxRate} 
                  onChange={e => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="h-8 text-right"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Amount</span>
              <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="border-t border-border pt-3 mt-3 flex justify-between font-semibold text-base text-heading">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between text-sm items-center mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground font-medium">Down Payment (DP)</span>
              <div className="w-32">
                <Input 
                  type="number" 
                  value={dp} 
                  onChange={e => setDp(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="h-8 text-right"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-between font-semibold text-lg text-primary mt-2">
              <span>Remaining Balance</span>
              <span>Rp {remaining.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-heading">Invoice Items</h2>
          <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-lg bg-muted/10 relative group">
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(index)}
                  className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              
              <div className="w-full md:w-32 flex flex-col gap-2 shrink-0">
                <Label>Product Image</Label>
                <div className="border-2 border-dashed border-border rounded-md h-24 flex items-center justify-center bg-background relative overflow-hidden group/image">
                  {item.productImage ? (
                    <>
                      <img src={item.productImage} alt="Product" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                    </>
                  ) : item.file ? (
                    <>
                      <div className="text-xs text-center p-2 break-all text-muted-foreground flex flex-col items-center">
                        <FileImage className="h-6 w-6 mb-1 text-primary/50" />
                        {item.file.name}
                      </div>
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center p-2 flex flex-col items-center">
                      <Upload className="h-5 w-5 mb-1 opacity-50" />
                      Upload
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={(e) => handleFileChange(index, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={item.description} 
                    onChange={e => handleItemChange(index, 'description', e.target.value)} 
                    placeholder="Sofa 3 Seater Custom..." 
                    required 
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="space-y-2 w-24">
                    <Label>Qty</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.qty} 
                      onChange={e => handleItemChange(index, 'qty', e.target.value === '' ? '' : parseInt(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Unit Price (Rp)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={item.price} 
                      onChange={e => handleItemChange(index, 'price', e.target.value === '' ? '' : parseInt(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Line Total</Label>
                    <Input 
                      type="text" 
                      value={`Rp ${((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString('id-ID')}`} 
                      disabled 
                      className="bg-muted font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4">
        <h2 className="text-xl font-semibold mb-2 text-heading">Additional Notes</h2>
        <Textarea 
          placeholder="Terms & Conditions, payment instructions, etc." 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          className="min-h-[100px]"
        />
      </div>
    </form>
  )
}
