import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hasPermission, Role } from '@/lib/roles'

export async function RoleGuard({ 
  children, 
  requiredRole = 'ADMIN' 
}: { 
  children: React.ReactNode, 
  requiredRole?: Role 
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  })

  if (!dbUser || !hasPermission(dbUser.role, requiredRole)) {
    // Jika tidak punya akses, kita bisa lempar ke halaman unauthorized atau dashboard utama
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this section.</p>
      </div>
    )
  }

  return <>{children}</>
}
