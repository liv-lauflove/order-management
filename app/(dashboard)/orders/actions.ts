'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOrders(statusFilter?: string) {
  return prisma.order.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      customer: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getNextOrderNumber() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true }
  })
  
  if (!lastOrder || !lastOrder.orderNumber.startsWith('ORD-')) {
    return 'ORD-0001'
  }
  
  const num = parseInt(lastOrder.orderNumber.replace('ORD-', ''))
  if (isNaN(num)) return 'ORD-0001'
  
  return `ORD-${(num + 1).toString().padStart(4, '0')}`
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true
    }
  })
}

export async function getCustomersForDropdown() {
  return prisma.customer.findMany({
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' }
  })
}

import { OrderStatus } from '@prisma/client'

export type CreateOrderInput = {
  orderNumber: string
  customerId: string
  projectName: string
  orderDate: Date
  deadline?: Date | null
  status?: OrderStatus
  notes?: string
  items: {
    furnitureName: string
    qty: number
    notes?: string
  }[]
}

export async function createOrder(data: CreateOrderInput) {
  const { orderNumber, customerId, projectName, orderDate, deadline, status, notes, items } = data
  
  await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      projectName,
      orderDate,
      deadline,
      status: status || 'WAITING_SUPPLIER',
      notes,
      items: {
        create: items
      }
    }
  })
  
  revalidatePath('/orders')
  revalidatePath('/dashboard')
}

export async function updateOrder(id: string, data: CreateOrderInput) {
  const { orderNumber, customerId, projectName, orderDate, deadline, status, notes, items } = data
  
  // Use transaction to recreate items and update order
  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: id } }),
    prisma.order.update({
      where: { id },
      data: {
        orderNumber,
        customerId,
        projectName,
        orderDate,
        deadline,
        status,
        notes,
        items: {
          create: items
        }
      }
    })
  ])
  
  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  revalidatePath('/dashboard')
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } })
  revalidatePath('/orders')
  revalidatePath('/dashboard')
}
