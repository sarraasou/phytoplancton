<template>
  <div class="menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px" data-kt-menu="true">
    
    <div class="notif-header d-flex flex-column rounded-top">
      <h3 class="fw-bold px-9 mt-10 mb-6" style="color:#ffffff">
        Notifications
        <el-badge v-if="unreadCount > 0" :value="unreadCount" type="danger" class="ms-2" />
      </h3>
      <ul class="nav nav-line-tabs nav-line-tabs-2x nav-stretch fw-bold px-9">
        <li class="nav-item">
          <a class="nav-link opacity-state-100 pb-4 active"
            data-bs-toggle="tab" href="#notif_recu"
            style="color:rgba(255,255,255,0.85)">Reçues</a>
        </li>
        <li class="nav-item">
          <a class="nav-link opacity-state-100 pb-4"
            data-bs-toggle="tab" href="#notif_envoye"
            style="color:rgba(255,255,255,0.85)"
            @click="loadSentNotifications">Envoyées</a>
        </li>
      </ul>
    </div>

    <div class="tab-content">

      <div class="tab-pane fade show active" id="notif_recu" role="tabpanel">
        <div class="scroll-y mh-325px my-5 px-8">
          <div v-if="isLoading" class="d-flex justify-content-center py-5">
            <span class="spinner-border spinner-border-sm text-primary"></span>
          </div>
          <div v-else-if="notifications.length === 0" class="text-center py-5 text-muted fs-7">
            Aucune notification
          </div>
          <template v-else>
            <div v-for="item in notifications" :key="item.id"
              class="d-flex flex-stack py-4 notif-item"
              :class="{ 'notif-unread': !item.isRead }"
              @click="markAsRead(item)">
              <div class="d-flex me-2 align-items-center">
                <div class="notif__ic w-45px h-35px d-flex align-items-center">
                  <span v-if="item.type === 'ACTIVATION'" class="fs-2">&#128100;</span>
                  <span v-else-if="item.type === 'VALIDATION'" class="fs-2">&#10003;</span>
                  <span v-else-if="item.type === 'REJECTION'" class="fs-2">&#10007;</span>
                  <span v-else class="fs-2 notif-bell">&#128276;</span>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-gray-800 fw-bold fs-7">{{ item.message }}</span>
                  <span class="text-gray-400 fs-8 mt-1">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
              <div v-if="!item.isRead" class="unread-dot ms-2"></div>
            </div>
          </template>
        </div>
        <div class="py-3 border-top d-flex justify-content-between px-5">
          <a href="#" class="btn btn-sm btn-color-gray-600 btn-active-color-primary"
            :class="{ disabled: unreadCount === 0 }"
            @click.prevent="markAllAsRead">Tout marquer lu</a>
          <a href="#" class="btn btn-sm btn-color-gray-600 btn-active-color-primary"
            @click.prevent="loadNotifications">Rafraîchir</a>
        </div>
      </div>

      <div class="tab-pane fade" id="notif_envoye" role="tabpanel">
        <div class="scroll-y mh-325px my-5 px-8">
          <div v-if="isLoading" class="d-flex justify-content-center py-5">
            <span class="spinner-border spinner-border-sm text-primary"></span>
          </div>
          <div v-else-if="sentNotifications.length === 0" class="text-center py-5 text-muted fs-7">
            Aucune notification envoyée
          </div>
          <div v-for="item in sentNotifications" :key="item.id"
            class="d-flex flex-stack justify-content-between py-4 border-bottom">
            <div class="d-flex flex-column">
              <span class="fs-7 fw-bold text-gray-800">{{ item.message }}</span>
              <span class="text-gray-400 fs-8 mt-1">{{ formatDate(item.createdAt) }}</span>
              <span class="badge mt-1 w-70px"
                :class="item.isRead ? 'badge-light-success' : 'badge-light-warning'">
                {{ item.isRead ? 'Lu' : 'Non lu' }}
              </span>
            </div>
            <inline-svg class="cursor-pointer text-danger"
              src="/svg/navbar/dropdown/notifDropdown/delete-notif.svg"
              @click="deleteNotif(item.id)" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Components } from '@tekab-dev-team/storybook-devfactory'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const getHeaders = () => {
  try {
    const raw   = localStorage.getItem('supabase.auth.token')
    const token = JSON.parse(raw || '{}')?.currentSession?.access_token
    return { Authorization: `Bearer ${token || ''}` }
  } catch { return {} }
}

// ✅ Pas de generiques TypeScript — evite l erreur de parsing Vue
const notifications     = ref([])
const sentNotifications = ref([])
const isLoading         = ref(false)
let   pollingInterval   = null

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.isRead).length
)

const loadNotifications = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/nest/api/notification/me`, { headers: getHeaders() })
    notifications.value = res.data ?? []
  } catch (err) {
    console.error('Erreur notifications:', err)
  } finally {
    isLoading.value = false
  }
}

const loadSentNotifications = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/nest/api/notification/sent`, { headers: getHeaders() })
    sentNotifications.value = res.data ?? []
  } catch (err) {
    console.error('Erreur envoyees:', err)
  } finally {
    isLoading.value = false
  }
}

const markAsRead = async (item) => {
  if (item.isRead) return
  try {
    await axios.patch(
      `${API_URL}/nest/api/notification/${item.id}/read`, {},
      { headers: getHeaders() }
    )
    item.isRead = true
  } catch (err) {
    console.error('markAsRead error:', err)
  }
}

const markAllAsRead = async () => {
  if (unreadCount.value === 0) return
  try {
    await axios.patch(`${API_URL}/nest/api/notification/read-all`, {}, { headers: getHeaders() })
    notifications.value.forEach(n => (n.isRead = true))
    Components.ElMessage.success('Toutes les notifications marquees comme lues')
  } catch {
    Components.ElMessage.error('Erreur')
  }
}

const deleteNotif = async (id) => {
  try {
    await axios.delete(`${API_URL}/nest/api/notification/${id}`, { headers: getHeaders() })
    sentNotifications.value = sentNotifications.value.filter(n => n.id !== id)
    Components.ElMessage.success('Notification supprimee')
  } catch {
    Components.ElMessage.error('Erreur suppression')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60)    return "A l'instant"
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(() => {
  loadNotifications()
  pollingInterval = setInterval(loadNotifications, 30_000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style lang="scss" scoped>
.notif-header {
  background: linear-gradient(135deg, #1a3c6e 0%, #0077b6 100%);
  border-radius: 8px 8px 0 0;
  padding-bottom: 4px;

  .nav-link {
    border-bottom: 2px solid transparent;
    &:hover {
      color: #ffffff !important;
      border-bottom-color: rgba(255,255,255,0.5) !important;
    }
    &.active {
      color: #ffffff !important;
      border-bottom-color: #ffffff !important;
    }
  }
}

.notif-bell {
  color: #f59e0b;
}

.notif-item {
  cursor: pointer;
  border-radius: 8px;
  padding: 8px 6px;
  border-bottom: 1px solid #f1f1f4;
  transition: background 0.2s;
  &:hover { background: #f5f8ff; }
}

.notif-unread {
  background: rgba(37, 68, 221, 0.05);
  border-left: 3px solid #2544dd;
  padding-left: 10px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2544dd;
  flex-shrink: 0;
}
</style>