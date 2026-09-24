// src/composables/useMyProjects.ts
// ✅ Singleton — état partagé entre MyProjectsWidget et KareniaStatsChart
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/useAuth'
import { storeToRefs } from 'pinia'

const API_URL = import.meta.env.VITE_API_URL

export interface MyProject {
  id: string
  title: string
  description: string
  tool: string
  createdAt: string
  updatedAt: string
  imagesCount: number
  analyzedImagesCount: number
  kareniaPercentage: number | null
  alexandriumPercentage: number | null
  bloomStatus: 'normal' | 'warning' | 'critical' | 'pending'
  lastActivity: string
  permissions: {
    canView: boolean
    canEdit: boolean
    canAnnotate: boolean
    canValidate: boolean
  }
}

// ── État singleton ────────────────────────────────────────────────────────
const projects    = ref<MyProject[]>([])
const isLoading   = ref(false)
const error       = ref<string | null>(null)
let   fetchedOnce = false

const getHeaders = (): Record<string, string> => {
  for (const k of Object.keys(localStorage)) {
    try {
      const p = JSON.parse(localStorage.getItem(k) || '{}')
      const t = p?.access_token || p?.currentSession?.access_token
      if (t?.startsWith('ey')) return { Authorization: `Bearer ${t}` }
    } catch { continue }
  }
  return {}
}

export function useMyProjects() {
  const { currentUser } = storeToRefs(useAuthStore())

  // ── Computed ────────────────────────────────────────────────────────────
  const recentProjects = computed(() =>
    [...projects.value]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  )

  const alertProjects = computed(() =>
    projects.value.filter(p => p.bloomStatus === 'critical' || p.bloomStatus === 'warning')
  )

  const pendingProjects = computed(() =>
    projects.value.filter(p => p.analyzedImagesCount === 0 && p.imagesCount > 0)
  )

  const totalImagesToAnalyze = computed(() =>
    projects.value.reduce((s, p) => s + Math.max(0, p.imagesCount - p.analyzedImagesCount), 0)
  )

  // ── Helpers bloom ───────────────────────────────────────────────────────
  const getBloomColor = (status: string) =>
    ({ critical: '#ef4444', warning: '#f59e0b', normal: '#10b981' }[status] ?? '#9ca3af')

  const getBloomIcon = (status: string) =>
    ({ critical: '🔴', warning: '🟠', normal: '🟢' }[status] ?? '⏳')

  const getBloomText = (status: string) =>
    ({ critical: 'Alerte critique', warning: 'Surveillance', normal: 'Normal' }[status] ?? 'En attente')

  // ✅ Chemin de navigation correct selon le rôle
  const getProjectRoute = (projectId: string): string => {
    const role = (currentUser.value?.userRole || 'user').toLowerCase()
    const prefix = { admin: 'admin', expert: 'expert', biologiste: 'expert', technicien: 'technicien' }[role] ?? 'user'
    return `/${prefix}/projects/${projectId}`
  }

  // ── Fetch ───────────────────────────────────────────────────────────────
const fetchMyProjects = async (force = false) => {
  if (!currentUser.value) return
  if (fetchedOnce && !force) return

  isLoading.value = true
  error.value = null
  try {
    // ✅ Utilisation de la route sans paramètre (authentification via token)
    const res = await axios.get(
      `${API_URL}/nest/api/project-permission/my-projects`,
      { headers: getHeaders() }
    )

    const raw = res.data ?? []
    let projectsArray: any[] = []

    if (Array.isArray(raw) && raw.length > 0 && raw[0]?.project) {
      // Format backend standard : [{ project, canView, ... }]
      projectsArray = raw.map(item => item.project)
    } else if (Array.isArray(raw)) {
      // Fallback : tableau de projets bruts
      projectsArray = raw
    } else {
      console.error('Format de réponse inattendu :', raw)
      projectsArray = []
    }

    projects.value = projectsArray.map((p: any): MyProject => ({
      id:                  p.id,
      title:               p.title || 'Sans titre',
      description:         p.description || '',
      tool:                p.tool || '',
      createdAt:           p.createdAt,
      updatedAt:           p.updatedAt,
      imagesCount:         p.images?.length ?? 0,
      analyzedImagesCount: 0,
      kareniaPercentage:   null,
      alexandriumPercentage: null,
      bloomStatus:         'pending',
      lastActivity:        p.updatedAt,
      permissions: {
        canView:     true,
        canEdit:     false,
        canAnnotate: true,
        canValidate: true,
      },
    }))

    fetchedOnce = true
  } catch (err: any) {
    console.error('useMyProjects fetch error:', err)
    error.value = err.message || 'Erreur de chargement'
  } finally {
    isLoading.value = false
  }
}
  const refreshProject = async (projectId: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/nest/api/projects/${projectId}/karenia-stats`,
        { headers: getHeaders() }
      )
      const p = projects.value.find(p => p.id === projectId)
      if (!p) return
      p.kareniaPercentage   = res.data?.kareniaPercentage ?? res.data?.percentage ?? null
      p.alexandriumPercentage = res.data?.alexandriumPercentage ?? null
      p.analyzedImagesCount = res.data?.analyzedCount ?? 0
      const pct = Math.max(p.kareniaPercentage ?? 0, p.alexandriumPercentage ?? 0)
      p.bloomStatus = p.analyzedImagesCount === 0 ? 'pending'
        : pct >= 60 ? 'critical' : pct >= 30 ? 'warning' : 'normal'
    } catch { /* silent */ }
  }

  const resetCache = () => { fetchedOnce = false }

  return {
    projects,
    recentProjects,
    alertProjects,
    pendingProjects,
    totalImagesToAnalyze,
    isLoading,
    error,
    fetchMyProjects,
    refreshProject,
    resetCache,
    getBloomColor,
    getBloomIcon,
    getBloomText,
    getProjectRoute,
  }
}


