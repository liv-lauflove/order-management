'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PaymentType } from '@prisma/client'

export async function getFinanceMetrics() {
  // 1. Total Income (Paid & Partial Invoices)
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['PAID', 'PARTIAL'] } },
    select: { subtotal: true, discount: true, dp: true, total: true }
  })
  
  const customerPayments = await prisma.payment.aggregate({
    where: { type: 'CUSTOMER' },
    _sum: { amount: true }
  })
  
  const supplierPayments = await prisma.payment.aggregate({
    where: { type: 'SUPPLIER' },
    _sum: { amount: true }
  })
  
  const totalIncome = customerPayments._sum.amount || 0
  const totalExpense = supplierPayments._sum.amount || 0
  const netProfit = Number(totalIncome) - Number(totalExpense)

  // 2. Outstanding Balances (Customer)
  const outstandingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['SENT', 'PARTIAL'] } },
    select: { remainingBalance: true }
  })
  const customerOutstanding = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.remainingBalance), 0)

  // 3. Outstanding Balances (Supplier)
  const unpaidSupplierOrders = await prisma.supplierOrder.findMany({
    where: { paymentStatus: 'UNPAID', supplierPrice: { not: null } },
    select: { supplierPrice: true }
  })
  const supplierOutstanding = unpaidSupplierOrders.reduce((sum, order) => sum + Number(order.supplierPrice), 0)

  // For chart (Last 6 months income)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  
  const recentPayments = await prisma.payment.findMany({
    where: { 
      type: 'CUSTOMER',
      paymentDate: { gte: sixMonthsAgo }
    },
    select: { amount: true, paymentDate: true }
  })

  // Group by month
  const monthlyData: Record<string, number> = {}
  recentPayments.forEach(p => {
    const monthYear = p.paymentDate.toLocaleString('default', { month: 'short', year: 'numeric' })
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(p.amount)
  })

  const chartData = Object.entries(monthlyData).map(([name, total]) => ({ name, total }))

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    netProfit,
    customerOutstanding,
    supplierOutstanding,
    chartData
  }
}

export async function getPayments(type?: PaymentType) {
  return prisma.payment.findMany({
    where: type ? { type } : undefined,
    include: {
      invoice: {
        include: { customer: true }
      },
      supplierOrder: {
        include: { supplier: true, orderItem: { include: { order: true } } }
      }
    },
    orderBy: { paymentDate: 'desc' }
  })
}

export async function getInvoicesForDropdown() {
  return prisma.invoice.findMany({
    where: { status: { notIn: ['PAID', 'CANCELLED'] } },
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getSupplierOrdersForDropdown() {
  return prisma.supplierOrder.findMany({
    where: { paymentStatus: 'UNPAID' },
    include: { supplier: true, orderItem: { include: { order: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export type CreatePaymentInput = {
  type: PaymentType
  invoiceId?: string
  supplierOrderId?: string
  amount: number
  paymentDate: string
  method: string
  notes?: string
}

export async function createPayment(data: CreatePaymentInput) {
  const { type, invoiceId, supplierOrderId, amount, paymentDate, method, notes } = data
  
  const payment = await prisma.payment.create({
    data: {
      type,
      invoiceId: invoiceId || null,
      supplierOrderId: supplierOrderId || null,
      amount,
      paymentDate: new Date(paymentDate),
      method,
      notes
    }
  })
  
  // Log activity
  let description = `Payment of Rp ${amount.toLocaleString('id-ID')} received`
  if (type === 'SUPPLIER') {
    description = `Payment of Rp ${amount.toLocaleString('id-ID')} made to supplier`
  }
  
  await prisma.activityLog.create({
    data: {
      type: type === 'CUSTOMER' ? 'PAYMENT_RECEIVED' : 'SUPPLIER_PAID',
      description,
      refId: payment.id
    }
  })

  // Update related invoice status if necessary
  if (type === 'CUSTOMER' && invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (invoice) {
      const remaining = Number(invoice.remainingBalance) - amount
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          remainingBalance: remaining < 0 ? 0 : remaining,
          status: remaining <= 0 ? 'PAID' : 'PARTIAL'
        }
      })
    }
  }

  // Update related supplier order status if necessary
  if (type === 'SUPPLIER' && supplierOrderId) {
    const sOrder = await prisma.supplierOrder.findUnique({ where: { id: supplierOrderId } })
    if (sOrder && sOrder.supplierPrice) {
      await prisma.supplierOrder.update({
        where: { id: supplierOrderId },
        data: { paymentStatus: 'PAID' }
      })
    }
  }

  revalidatePath('/finance')
  revalidatePath('/dashboard')
  revalidatePath('/invoices')
  revalidatePath('/supplier-orders')
  return payment.id
}
