// services/permission.service.ts

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// ═══════════════════════════════════════════════════════════════════
// FONCTION POUR RÉCUPÉRER LE TOKEN
// ═══════════════════════════════════════════════════════════════════
const getAuthHeaders = () => {
  try {
    const supabaseToken = localStorage.getItem('supabase.auth.token')
    if (supabaseToken) {
      const parsed = JSON.parse(supabaseToken)
      const token = parsed?.currentSession?.access_token || parsed?.access_token
      if (token && token.startsWith('ey')) {
        return { Authorization: `Bearer ${token}` }
      }
    }
    
    for (const key of Object.keys(localStorage)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}')
        const token = parsed?.access_token || parsed?.currentSession?.access_token
        if (token && token.startsWith('ey')) {
          return { Authorization: `Bearer ${token}` }
        }
      } catch {
        continue
      }
    }
  } catch {
    // Ignorer
  }
  return {}
}

// ═══════════════════════════════════════════════════════════════════
// CRÉATION D'UNE INSTANCE AXIOS AVEC INTERCEPTEUR
// ═══════════════════════════════════════════════════════════════════
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur : ajoute automatiquement le token à chaque requête
apiClient.interceptors.request.use((config) => {
  const headers = getAuthHeaders()
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization
  }
  return config
})

// Intercepteur pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Session expirée, tentative de reconnexion...')
      // Optionnel: rediriger vers login
      // window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  }
)

// ═══════════════════════════════════════════════════════════════════
// SERVICE PERMISSIONS
// ═══════════════════════════════════════════════════════════════════
export const permissionService = {
  async grant(permissions: {
    projectId: string
    userId: string
    canView?: boolean
    canUpload?: boolean
    canAnnotate?: boolean
    canValidate?: boolean
    canEdit?: boolean
    canDelete?: boolean
    expiresAt?: Date
  }) {
    const response = await apiClient.post('/nest/api/project-permission/grant', permissions)
    return response.data
  },

  async getUserPermissions(projectId: string, userId: string) {
    const response = await apiClient.get(`/nest/api/project-permission/${projectId}/${userId}`)
    return response.data
  },

  async revoke(projectId: string, userId: string) {
    const response = await apiClient.delete(`/nest/api/project-permission/${projectId}/${userId}`)
    return response.data
  },

  async listProjectUsers(projectId: string) {
    const response = await apiClient.get(`/nest/api/project-permission/${projectId}/users`)
    return response.data
  },

  async checkPermission(projectId: string, permission: string) {
    const response = await apiClient.get(`/nest/api/project-permission/${projectId}/check/${permission}`)
    return response.data
  },

  async getProject(id: string) {
    const response = await apiClient.get(`/nest/api/projects/${id}`)
    return response.data
  },

  async getAllUsers() {
    const response = await apiClient.get('/nest/api/users')
    return response.data?.paginatedResult || response.data || []
  }
}

// ✅ EXPORTER apiClient
export { apiClient }