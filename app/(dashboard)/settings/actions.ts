'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  let settings = await prisma.settings.findFirst()
  
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        companyName: 'DC Habitat',
        invoicePrefix: 'INV'
      }
    })
  }
  
  return settings
}

export async function updateSettings(id: string, formData: FormData) {
  const companyName = formData.get('companyName') as string
  const companyLogoUrl = formData.get('companyLogoUrl') as string
  const address = formData.get('address') as string
  const whatsappNumber = formData.get('whatsappNumber') as string
  const bankAccount = formData.get('bankAccount') as string
  const invoicePrefix = formData.get('invoicePrefix') as string

  await prisma.settings.update({
    where: { id },
    data: { 
      companyName, 
      companyLogoUrl, 
      address, 
      whatsappNumber, 
      bankAccount, 
      invoicePrefix 
    }
  })
  
  revalidatePath('/settings')
}
