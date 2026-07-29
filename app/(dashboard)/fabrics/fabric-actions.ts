'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { FabricStatus } from '@prisma/client'

export async function getGlobalFabrics(statusFilter?: string) {
  return prisma.fabric.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    include: {
      orderItem: {
        include: {
          order: {
            include: { customer: true }
          }
        }
      },
      supplier: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateFabricStatus(id: string, status: FabricStatus) {
  await prisma.fabric.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/fabrics')
  revalidatePath('/orders') // Revalidate orders just in case
}
