'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SupplierOrderStatus } from '@prisma/client'

export async function getGlobalSupplierOrders(statusFilter?: string) {
  return prisma.supplierOrder.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      supplier: true,
      orderItem: {
        include: {
          order: {
            include: { customer: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateSupplierOrderStatus(id: string, newStatus: SupplierOrderStatus) {
  const so = await prisma.supplierOrder.update({
    where: { id },
    data: { status: newStatus },
    include: { orderItem: true }
  })
  
  if (newStatus === 'ARRIVED') {
    await prisma.order.update({
      where: { id: so.orderItem.orderId },
      data: { status: 'READY_TO_SHIP' }
    })
    revalidatePath(`/orders/${so.orderItem.orderId}`)
    revalidatePath('/orders')
    revalidatePath('/dashboard')
  }
  
  revalidatePath('/supplier-orders')
}
