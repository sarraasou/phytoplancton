// src/composables/useBloomAlerts.ts
import { ref, computed, onUnmounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface BloomAlert {
  projectId: string
  projectTitle: string
  speciesName?: 'Karenia' | 'Alexandrium'
  percentage: number
  kareniaCells: number
  alertCells?: number
  totalCells: number
  severity: 'BLOOM_HIGH' | 'BLOOM_CRITICAL'
  detectedAt: string
}

// ── État singleton ────────────────────────────────────────────────────────
const activeAlerts = ref<BloomAlert[]>([])
const isPolling    = ref(false)
let   pollingInterval: number | null = null
let   consumerCount = 0

// ✅ Persistance sessionStorage : dismissed restent ignorées pendant la session
const DISMISSED_KEY = 'bloom_dismissed_v2'

const getDismissed = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]') } catch { return [] }
}
const saveDismissed = (ids: string[]) => {
  try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(ids)) } catch { /* silent */ }
}

// ✅ visibleAlerts = actives ET non dismissées
const visibleAlerts = computed(() => {
  const dismissed = getDismissed()
  return activeAlerts.value.filter(a => !dismissed.includes(a.projectId))
})

// ── Auth ──────────────────────────────────────────────────────────────────
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

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchBloomAlerts = async () => {
  try {
    const res = await axios.get(`${API_URL}/nest/api/notification/bloom-alerts`, { headers: getHeaders() })
    activeAlerts.value = res.data ?? []
  } catch { /* silent */ }
}

// ── Dismiss ───────────────────────────────────────────────────────────────
const dismissAlert = (projectId: string) => {
  const list = getDismissed()
  if (!list.includes(projectId)) saveDismissed([...list, projectId])
  // Backend optionnel
  axios.post(`${API_URL}/nest/api/notification/bloom-alert/read`, { projectId }, { headers: getHeaders() })
    .catch(() => {/* silent */})
}

const dismissAllAlerts = () => {
  const allIds = activeAlerts.value.map(a => a.projectId)
  saveDismissed([...new Set([...getDismissed(), ...allIds])])
}

// ── Polling ───────────────────────────────────────────────────────────────
const startPolling = (ms = 30000) => {
  if (pollingInterval) return
  fetchBloomAlerts()
  pollingInterval = window.setInterval(fetchBloomAlerts, ms)
  isPolling.value = true
}

const stopPolling = () => {
  if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null }
  isPolling.value = false
}

const getAlertColor = (s: string) => s === 'BLOOM_CRITICAL' ? '#ef4444' : '#f59e0b'
const getAlertIcon  = (s: string) => s === 'BLOOM_CRITICAL' ? '🔴' : '🟠'

export function useBloomAlerts() {
  consumerCount++
  onUnmounted(() => { if (--consumerCount <= 0) stopPolling() })
  return { activeAlerts, visibleAlerts, isPolling, fetchBloomAlerts, dismissAlert, dismissAllAlerts, getAlertColor, getAlertIcon, startPolling, stopPolling }
}
