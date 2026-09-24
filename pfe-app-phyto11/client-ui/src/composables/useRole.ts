// src/composables/useRole.ts
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/useAuth'

const SUPABASE_GENERIC_ROLES = ['user', 'authenticated', 'anon', '']

export function useRole() {
  const { currentUser } = storeToRefs(useAuthStore())

  const userRoles = computed((): string[] => {
    const u = currentUser.value
    if (!u) return []

    const collected: string[] = []

    // Priorité 1 — userRole depuis enrichWithDbRole
    if (u.userRole) collected.push(u.userRole)

    // Priorité 2 — roles[] depuis Prisma
    if (Array.isArray(u.roles)) {
      u.roles.forEach((r: any) => {
        if (typeof r === 'string') collected.push(r)
        else if (r?.name) collected.push(r.name)
      })
    }

    // Priorité 3 — user_metadata
    const metaRole = u.user_metadata?.role || u.user_metadata?.userRole
    if (metaRole) collected.push(metaRole)

    // Priorité 4 — u.role Supabase, seulement si c'est un vrai rôle métier
    if (u.role && !SUPABASE_GENERIC_ROLES.includes(u.role.toLowerCase())) {
      collected.push(u.role)
    }

    return [...new Set(collected)]
      .filter(Boolean)
      .map((r: string) => r.toLowerCase().trim())
  })

  const isAdmin = computed(() => userRoles.value.includes('admin'))

  const isExpert = computed(() =>
    userRoles.value.some(r => ['expert', 'biologiste', 'biologist'].includes(r))
  )

  const isTechnicien = computed(() =>
    userRoles.value.includes('technicien') && !isAdmin.value
  )

  // ✅ FIX : primaryRole exporté (manquant → crash dashboard)
  const primaryRole = computed(() => {
    if (isAdmin.value)      return 'admin'
    if (isExpert.value)     return 'expert'
    if (isTechnicien.value) return 'technicien'
    return userRoles.value[0] ?? 'user'
  })

  const canAnnotate    = computed(() => isExpert.value || isTechnicien.value)
  const canValidate    = computed(() => isExpert.value)
  const canEdit        = computed(() => isExpert.value || isTechnicien.value)
  const canManageUsers = computed(() => isAdmin.value)

  return {
    isAdmin,
    isExpert,
    isTechnicien,
    primaryRole,     // ✅ maintenant exporté
    canAnnotate,
    canValidate,
    canEdit,
    canManageUsers,
    userRoles,
  }
}