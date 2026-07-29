'use server'

import { prisma } from '@/lib/prisma'

export async function getRecentActivities() {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
}

export async function getUpcomingDeadlines() {
  const now = new Date()
  const twoWeeksFromNow = new Date()
  twoWeeksFromNow.setDate(now.getDate() + 14)
  
  // 1. Order deadlines
  const orderDeadlines = await prisma.order.findMany({
    where: { 
      deadline: { gte: now, lte: twoWeeksFromNow },
      status: { notIn: ['DELIVERED', 'COMPLETED'] }
    },
    select: { id: true, orderNumber: true, projectName: true, deadline: true }
  })
  
  // 2. Supplier deadlines
  const supplierDeadlines = await prisma.supplierOrder.findMany({
    where: {
      deadline: { gte: now, lte: twoWeeksFromNow },
      status: { notIn: ['ARRIVED'] }
    },
    include: {
      supplier: true,
      orderItem: true
    }
  })

  // Format into a unified list
  const deadlines = [
    ...orderDeadlines.map(o => ({
      id: o.id,
      title: `Order: ${o.projectName} (${o.orderNumber})`,
      date: o.deadline,
      type: 'ORDER',
      link: `/orders/${o.id}`
    })),
    ...supplierDeadlines.map(s => ({
      id: s.id,
      title: `Supplier: ${s.supplier.name} - ${s.orderItem.furnitureName}`,
      date: s.deadline,
      type: 'SUPPLIER',
      link: `/supplier-orders`
    }))
  ]

  // Sort by closest date
  return deadlines.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return a.date.getTime() - b.date.getTime()
  })
}

export async function getReadyToShipCount() {
  return prisma.order.count({
    where: { status: 'READY_TO_SHIP' }
  })
}

export async function getSupplierPaymentPendingCount() {
  return prisma.supplierOrder.count({
    where: { paymentStatus: 'UNPAID', supplierPrice: { not: null } }
  })
}
