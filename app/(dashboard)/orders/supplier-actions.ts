'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SupplierOrderStatus, SupplierPaymentStatus } from '@prisma/client'

export async function getSuppliersForDropdown() {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

export async function getSupplierOrdersForOrderItem(orderItemId: string) {
  return prisma.supplierOrder.findMany({
    where: { orderItemId },
    include: {
      supplier: true
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createSupplierOrder(orderItemId: string, orderId: string, formData: FormData) {
  const supplierId = formData.get('supplierId') as string
  const supplierPrice = formData.get('supplierPrice') as string
  const deadlineStr = formData.get('deadline') as string
  const status = formData.get('status') as SupplierOrderStatus
  const paymentStatus = formData.get('paymentStatus') as SupplierPaymentStatus
  const supplierInvoice = formData.get('supplierInvoice') as string
  const notes = formData.get('notes') as string
  const photoFile = formData.get('photoFile') as File | null

  let photoUrl = null

  if (photoFile && photoFile.size > 0) {
    const supabase = await createClient()
    const ext = photoFile.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(`supplier-orders/${fileName}`, photoFile)
      
    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload photo: ${error.message}. Ensure you have created a public bucket named "uploads" in Supabase Storage.`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`supplier-orders/${fileName}`)
      
    photoUrl = publicUrl
  }

  await prisma.supplierOrder.create({
    data: {
      orderItemId,
      supplierId,
      supplierPrice: supplierPrice ? parseFloat(supplierPrice) : null,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      status: status || 'WAITING',
      paymentStatus: paymentStatus || 'UNPAID',
      supplierInvoice,
      notes,
      photoUrl
    }
  })
  
  revalidatePath(`/orders/${orderId}`)
}

export async function deleteSupplierOrder(id: string, orderId: string) {
  await prisma.supplierOrder.delete({ where: { id } })
  revalidatePath(`/orders/${orderId}`)
}
