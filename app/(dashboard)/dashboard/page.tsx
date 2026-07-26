export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to DC Habitat Order Management System.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Income This Month</h3>
          <p className="text-2xl font-bold mt-2">Rp 0</p>
        </div>
        
        <div className="rounded-xl border border-warning/50 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-warning"></div>
          <h3 className="font-semibold text-sm text-warning-foreground">Supplier Payment Pending</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        
        <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-destructive"></div>
          <h3 className="font-semibold text-sm text-destructive">Upcoming Deadlines</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        
        <div className="rounded-xl border border-success/30 bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-success"></div>
          <h3 className="font-semibold text-sm text-success">Ready to Ship</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
      
      {/* Placeholder for Recent Activity */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
        <h3 className="font-semibold text-lg border-b border-border pb-4 mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center mt-12">No recent activity.</p>
      </div>
    </div>
  )
}
