import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const getHeaders = (): Record<string, string> => {
  for (const key of Object.keys(localStorage)) {
    try {
      const p = JSON.parse(localStorage.getItem(key) || '{}')
      const t = p?.access_token || p?.currentSession?.access_token
      if (t?.startsWith('ey')) return { Authorization: `Bearer ${t}` }
    } catch { continue }
  }
  return {}
}

export function useProjectPermissions(projectId: string) {
  const canView = ref(false)
  const canEdit = ref(false)
  const canAnnotate = ref(false)
  const canValidate = ref(false)
  const canUpload = ref(false)
  const isLoading = ref(true)

  const loadPermissions = async () => {
    isLoading.value = true
    try {
      // ✅ Appel à la nouvelle route sans userId explicite
      const res = await axios.get(
        `${API_URL}/nest/api/project-permission/my-projects/${projectId}`,
        { headers: getHeaders() }
      )
      const perms = res.data
      canView.value     = !!perms.canView
      canUpload.value   = !!perms.canUpload
      canAnnotate.value = !!perms.canAnnotate
      canValidate.value = !!perms.canValidate
      canEdit.value     = !!perms.canEdit
    } catch (err) {
      console.error('useProjectPermissions error:', err)
      canView.value = false
    } finally {
      isLoading.value = false
    }
  }

  return {
    canView,
    canEdit,
    canAnnotate,
    canValidate,
    canUpload,
    isLoading,
    loadPermissions,
  }
}