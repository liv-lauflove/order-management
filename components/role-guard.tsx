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
  
  if (!user || !user.email) {
    redirect('/login')
  }

  // KHUSUS: Hanya izinkan email admin utama
  const allowedAdminEmail = 'olyviaudydj@gmail.com'
  
  if (user.email !== allowedAdminEmail) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only authorized administrator can access this system.</p>
      </div>
    )
  }

  // Sinkronisasi: Jika user login via Supabase Auth tapi belum ada di tabel 'users' (Prisma/Public), buat otomatis
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.user_metadata?.full_name || 'Administrator',
        provider: 'supabase',
        role: 'ADMIN'
      }
    })
  }

  if (!hasPermission(dbUser.role, requiredRole)) {
    // Jika tidak punya akses role
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this section.</p>
      </div>
    )
  }

  return <>{children}</>
}
