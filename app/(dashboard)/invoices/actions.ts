'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { InvoiceStatus } from '@prisma/client'

export async function getInvoices(statusFilter?: string) {
  return prisma.invoice.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      customer: true,
      order: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      order: true,
      items: true,
      payments: true
    }
  })
}

export async function getNextInvoiceNumber() {
  const settings = await prisma.settings.findFirst()
  const prefix = settings?.invoicePrefix || 'INV'
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `${prefix}-` } },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true }
  })
  
  if (!lastInvoice) {
    return `${prefix}-0001`
  }
  
  const numPart = lastInvoice.invoiceNumber.replace(`${prefix}-`, '')
  const num = parseInt(numPart)
  if (isNaN(num)) return `${prefix}-0001`
  
  return `${prefix}-${(num + 1).toString().padStart(4, '0')}`
}

import { createClient } from '@/lib/supabase/server'

export async function uploadInvoiceImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  
  const { error } = await supabase.storage
    .from('uploads')
    .upload(`invoices/${fileName}`, file)
    
  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(`invoices/${fileName}`)
    
  return publicUrl
}

export async function getCustomersForDropdown() {
  return prisma.customer.findMany({
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' }
  })
}

export async function getOrdersForDropdown(customerId?: string) {
  return prisma.order.findMany({
    where: customerId ? { customerId } : undefined,
    select: { id: true, orderNumber: true, projectName: true },
    orderBy: { createdAt: 'desc' }
  })
}

export type CreateInvoiceInput = {
  invoiceNumber: string
  customerId: string
  orderId?: string
  logoUrl?: string
  status?: InvoiceStatus
  notes?: string
  items: {
    id?: string
    description: string
    qty: number
    price: number
    productImage?: string
  }[]
  discount: number
  dp: number
  taxRate: number // percentage e.g. 11 for 11%
}

export async function createInvoice(data: CreateInvoiceInput) {
  const { invoiceNumber, customerId, orderId, logoUrl, status, notes, items, discount, dp, taxRate } = data
  
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0)
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax
  const remainingBalance = total - dp
  
  const newInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      orderId: orderId || null,
      logoUrl,
      status: status || 'DRAFT',
      notes,
      subtotal,
      tax,
      discount,
      total,
      dp,
      remainingBalance,
      items: {
        create: items.map(item => ({
          description: item.description,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price,
          productImage: item.productImage
        }))
      }
    }
  })
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'INVOICE_CREATED',
      description: `Invoice ${invoiceNumber} created`,
      refId: newInvoice.id
    }
  })
  
  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return newInvoice.id
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status }
  })
  
  await prisma.activityLog.create({
    data: {
      type: 'INVOICE_UPDATED',
      description: `Invoice ${invoice.invoiceNumber} status updated to ${status}`,
      refId: id
    }
  })
  
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/dashboard')
}

export async function updateInvoice(id: string, data: CreateInvoiceInput) {
  const { invoiceNumber, customerId, orderId, logoUrl, status, notes, items, discount, dp, taxRate } = data
  
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0)
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax
  const remainingBalance = total - dp
  
  await prisma.$transaction(async (tx) => {
    // 1. Delete all existing items
    await tx.invoiceItem.deleteMany({
      where: { invoiceId: id }
    })
    
    // 2. Update invoice and recreate items
    await tx.invoice.update({
      where: { id },
      data: {
        invoiceNumber,
        customerId,
        orderId: orderId || null,
        logoUrl,
        status: status || 'DRAFT',
        notes,
        subtotal,
        tax,
        discount,
        total,
        dp,
        remainingBalance,
        items: {
          create: items.map(item => ({
            description: item.description,
            qty: item.qty,
            price: item.price,
            total: item.qty * item.price,
            productImage: item.productImage
          }))
        }
      }
    })
  })
  
  await prisma.activityLog.create({
    data: {
      type: 'INVOICE_UPDATED',
      description: `Invoice ${invoiceNumber} updated`,
      refId: id
    }
  })
  
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/dashboard')
}
