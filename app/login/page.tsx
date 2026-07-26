import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-sm border border-border">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">DC Habitat</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <form action={login} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input id="password" name="password" type="password" required />
          </div>
          
          {resolvedSearchParams?.error && (
            <div className="text-sm text-destructive text-center">
              {resolvedSearchParams.error}
            </div>
          )}

          <Button type="submit" formAction={login} className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
