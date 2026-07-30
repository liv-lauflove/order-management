export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  WAREHOUSE: 'WAREHOUSE',
} as const

export type Role = keyof typeof ROLES

export function hasPermission(userRole: string, requiredRole: Role): boolean {
  // Sementara ini, admin bisa akses semuanya
  if (userRole === ROLES.ADMIN) return true
  
  // Nanti logika tambahan bisa ditambahkan di sini saat multi-role sudah diimplementasi
  return userRole === requiredRole
}
