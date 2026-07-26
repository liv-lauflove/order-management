'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  await prisma.customer.create({
    data: { name, phone, email, address, notes }
  })
  
  revalidatePath('/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  await prisma.customer.update({
    where: { id },
    data: { name, phone, email, address, notes }
  })
  
  revalidatePath('/customers')
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } })
  revalidatePath('/customers')
}
