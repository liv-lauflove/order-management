import { getFinanceMetrics, getPayments, getInvoicesForDropdown, getSupplierOrdersForDropdown } from './actions'
import { PaymentForm } from './payment-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function FinancePage() {
  const [metrics, customerPayments, supplierPayments, invoices, supplierOrders] = await Promise.all([
    getFinanceMetrics(),
    getPayments('CUSTOMER'),
    getPayments('SUPPLIER'),
    getInvoicesForDropdown(),
    getSupplierOrdersForDropdown()
  ])

  // Serialize Prisma Decimals for client component
  const serializedInvoices = JSON.parse(JSON.stringify(invoices))
  const serializedOrders = JSON.parse(JSON.stringify(supplierOrders))

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Finance</h1>
          <p className="text-muted-foreground mt-1">Manage payments, income, and outstanding balances.</p>
        </div>
        <PaymentForm invoices={serializedInvoices} supplierOrders={serializedOrders} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-success/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-success"></div>
          <h3 className="font-semibold text-sm text-success">Total Income</h3>
          <p className="text-2xl font-bold mt-2 text-heading">Rp {metrics.totalIncome.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-destructive"></div>
          <h3 className="font-semibold text-sm text-destructive">Total Expenses</h3>
          <p className="text-2xl font-bold mt-2 text-heading">Rp {metrics.totalExpense.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>
          <h3 className="font-semibold text-sm text-primary">Net Profit</h3>
          <p className="text-2xl font-bold mt-2 text-heading">Rp {metrics.netProfit.toLocaleString('id-ID')}</p>
        </div>

        <div className="rounded-xl border border-warning/50 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>
          <h3 className="font-semibold text-sm text-warning-foreground">Outstanding (Customer)</h3>
          <p className="text-2xl font-bold mt-2 text-heading">Rp {metrics.customerOutstanding.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="customer" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="customer">Incoming Payments (Customer)</TabsTrigger>
          <TabsTrigger value="supplier">Outgoing Payments (Supplier)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
            <h2 className="font-semibold">Customer Payments</h2>
            <p className="text-sm text-muted-foreground">{customerPayments.length} payments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="font-medium p-4">Date</th>
                  <th className="font-medium p-4">Customer</th>
                  <th className="font-medium p-4">Invoice Ref</th>
                  <th className="font-medium p-4">Method</th>
                  <th className="font-medium p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No customer payments recorded yet.</td>
                  </tr>
                ) : customerPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-muted/30">
                    <td className="p-4 whitespace-nowrap">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</td>
                    <td className="p-4 font-medium">{payment.invoice?.customer.name || '-'}</td>
                    <td className="p-4">
                      {payment.invoice ? (
                        <Link href={`/invoices/${payment.invoice.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                          {payment.invoice.invoiceNumber}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">{payment.method?.replace('_', ' ') || 'Unknown'}</td>
                    <td className="p-4 text-right font-medium text-success">
                      + Rp {Number(payment.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="supplier" className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
            <h2 className="font-semibold">Supplier Payments</h2>
            <p className="text-sm text-muted-foreground">{supplierPayments.length} payments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="font-medium p-4">Date</th>
                  <th className="font-medium p-4">Supplier</th>
                  <th className="font-medium p-4">Item Ref</th>
                  <th className="font-medium p-4">Method</th>
                  <th className="font-medium p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supplierPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No supplier payments recorded yet.</td>
                  </tr>
                ) : supplierPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-muted/30">
                    <td className="p-4 whitespace-nowrap">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</td>
                    <td className="p-4 font-medium">{payment.supplierOrder?.supplier.name || '-'}</td>
                    <td className="p-4">
                      {payment.supplierOrder ? (
                        <Link href={`/orders/${payment.supplierOrder.orderItem.orderId}`} className="hover:underline text-blue-600 dark:text-blue-400">
                          {payment.supplierOrder.orderItem.furnitureName} ({payment.supplierOrder.orderItem.order.orderNumber})
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">{payment.method?.replace('_', ' ') || 'Unknown'}</td>
                    <td className="p-4 text-right font-medium text-destructive">
                      - Rp {Number(payment.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
