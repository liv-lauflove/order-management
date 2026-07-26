import { redirect } from 'next/navigation'

export default function Home() {
  // Secara otomatis arahkan ke dashboard
  redirect('/dashboard')
}
