import { getFinanceMetrics } from '../finance/actions'
import { getRecentActivities, getUpcomingDeadlines, getReadyToShipCount, getSupplierPaymentPendingCount } from './actions'
import { IncomeChart } from './income-chart'
import { format } from 'date-fns'
import Link from 'next/link'
import { Clock, CheckCircle, AlertTriangle, FileText, ShoppingCart, Truck, CreditCard, Activity } from 'lucide-react'

function getActivityIcon(type: string) {
  switch(type) {
    case 'INVOICE_CREATED':
    case 'INVOICE_UPDATED': return <FileText className="h-4 w-4 text-blue-500" />
    case 'ORDER_CREATED':
    case 'ORDER_STATUS_CHANGED': return <ShoppingCart className="h-4 w-4 text-purple-500" />
    case 'SUPPLIER_ADDED':
    case 'SUPPLIER_PAID':
    case 'SUPPLIER_COMPLETED': return <Truck className="h-4 w-4 text-orange-500" />
    case 'PAYMENT_RECEIVED': return <CreditCard className="h-4 w-4 text-success" />
    default: return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

export default async function DashboardPage() {
  const [metrics, activities, deadlines, readyToShipCount, pendingSupplierPaymentCount] = await Promise.all([
    getFinanceMetrics(),
    getRecentActivities(),
    getUpcomingDeadlines(),
    getReadyToShipCount(),
    getSupplierPaymentPendingCount()
  ])

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to DC Habitat Order Management System.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-success/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-success"></div>
          <h3 className="font-semibold text-sm text-success">Income This Month</h3>
          <p className="text-2xl font-bold mt-2 text-heading">
            Rp {metrics.chartData.length > 0 ? metrics.chartData[metrics.chartData.length - 1].total.toLocaleString('id-ID') : 0}
          </p>
        </div>
        
        <div className="rounded-xl border border-warning/50 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>
          <h3 className="font-semibold text-sm text-warning-foreground">Supplier Payment Pending</h3>
          <p className="text-2xl font-bold mt-2 text-heading">{pendingSupplierPaymentCount}</p>
        </div>
        
        <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-destructive"></div>
          <h3 className="font-semibold text-sm text-destructive">Upcoming Deadlines (14 Days)</h3>
          <p className="text-2xl font-bold mt-2 text-heading">{deadlines.length}</p>
        </div>
        
        <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>
          <h3 className="font-semibold text-sm text-primary">Ready to Ship</h3>
          <p className="text-2xl font-bold mt-2 text-heading">{readyToShipCount}</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Income Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-lg">Income Overview (Last 6 Months)</h3>
          </div>
          <div className="p-6 flex-1 min-h-[350px]">
            <IncomeChart data={metrics.chartData} />
          </div>
        </div>

        {/* Deadlines Widget */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-destructive/10">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Deadlines
            </h3>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[350px]">
            {deadlines.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[250px]">
                <CheckCircle className="h-8 w-8 mb-2 text-success/50" />
                <p>No immediate deadlines!</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {deadlines.map((d) => (
                  <li key={d.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <Link href={d.link} className="block">
                      <p className="font-medium text-sm text-heading mb-1 truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {d.date ? format(d.date, 'dd MMM yyyy') : 'No Date'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-lg">Recent Activity</h3>
        </div>
        <div className="p-0">
          {activities.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No recent activity recorded yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activities.map((activity) => (
                <li key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="mt-0.5 p-2 bg-muted rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-heading">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.createdAt), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
