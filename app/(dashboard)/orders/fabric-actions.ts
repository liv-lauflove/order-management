'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { FabricStatus } from '@prisma/client'

export async function createFabric(orderItemId: string, orderId: string, formData: FormData) {
  const brand = formData.get('brand') as string
  const colorCode = formData.get('colorCode') as string
  const supplierId = formData.get('supplierId') as string
  const metersNeeded = formData.get('metersNeeded') as string
  const price = formData.get('price') as string
  const status = formData.get('status') as FabricStatus
  const orderDateStr = formData.get('orderDate') as string
  const arrivalDateStr = formData.get('arrivalDate') as string
  
  const fabricPhotoFile = formData.get('fabricPhotoFile') as File | null
  const itemImageFile = formData.get('itemImageFile') as File | null

  let fabricPhotoUrl = null
  let itemImageUrl = null

  const supabase = await createClient()

  // Upload fabric photo
  if (fabricPhotoFile && fabricPhotoFile.size > 0) {
    const ext = fabricPhotoFile.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(`fabrics/${fileName}`, fabricPhotoFile)
      
    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload fabric photo: ${error.message}. Ensure you have created a public bucket named "uploads" in Supabase Storage.`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`fabrics/${fileName}`)
      
    fabricPhotoUrl = publicUrl
  }

  // Upload item image
  if (itemImageFile && itemImageFile.size > 0) {
    const ext = itemImageFile.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(`fabrics-items/${fileName}`, itemImageFile)
      
    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload item image: ${error.message}.`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`fabrics-items/${fileName}`)
      
    itemImageUrl = publicUrl
  }

  await prisma.fabric.create({
    data: {
      orderItemId,
      brand,
      colorCode,
      supplierId: supplierId || null,
      metersNeeded: parseFloat(metersNeeded) || 0,
      price: parseFloat(price) || 0,
      status: status || 'NOT_ORDERED',
      orderDate: orderDateStr ? new Date(orderDateStr) : null,
      arrivalDate: arrivalDateStr ? new Date(arrivalDateStr) : null,
      fabricPhotoUrl,
      itemImageUrl
    }
  })
  
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/fabrics')
}
