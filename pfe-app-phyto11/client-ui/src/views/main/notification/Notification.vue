<template>
  <div>
    <el-tabs v-bind="args" v-model="activeName" @tab-click="handleClick" data-test="notificationMenu">
      
      <!-- Onglet Notifications reçues -->
      <el-tab-pane name="first" data-test="notificationMenuNotifications">
        <template #label>
          <span class="tab-label">
            Notifications
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notif-badge" type="danger"/>
          </span>
        </template>

        <div class="scroll-y mh-325px my-5 px-8">
          <!-- Loading -->
          <div v-if="isLoading" class="d-flex justify-content-center py-5">
            <el-icon class="rotating"><Loading /></el-icon>
          </div>

          <!-- Vide -->
          <div v-else-if="notifications.length === 0" class="text-center py-5 text-muted">
            <el-icon size="32"><Bell /></el-icon>
            <p class="mt-2">Aucune notification</p>
          </div>

          <!-- Liste -->
          <template v-else>
            <div
              v-for="item in notifications"
              :key="item.id"
              class="d-flex flex-stack py-4 notif-item"
              :class="{ 'notif-unread': !item.isRead }"
              @click="markAsRead(item)"
            >
              <div class="d-flex me-2 align-items-start">
                <!-- Icône selon type -->
                <div class="notif-icon me-3">
                  <span v-if="item.type === 'ACTIVATION'"   class="icon-badge bg-warning">👤</span>
                  <span v-else-if="item.type === 'REJECTION'"    class="icon-badge bg-danger">🚫</span>
                  <span v-else-if="item.type === 'CLASSIFICATION'" class="icon-badge bg-info">🔬</span>
                  <span v-else-if="item.type === 'VALIDATION'"   class="icon-badge bg-success">✅</span>
                  <span v-else class="icon-badge bg-secondary">🔔</span>
                </div>

                <div class="notif-info d-flex flex-column">
                  <span class="fw-bold text-gray-800 fs-7">{{ item.message }}</span>
                  <span class="text-muted fs-8 mt-1">
                    {{ formatDate(item.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Indicateur non lu -->
              <div v-if="!item.isRead" class="unread-dot"></div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="py-3 text-center border-top d-flex justify-content-between px-5">
          <el-button text size="small" @click="markAllAsRead" :disabled="unreadCount === 0">
            Tout marquer lu
          </el-button>
          <el-button text size="small" @click="loadNotifications">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </el-tab-pane>

      <!-- Onglet Envoyées (admin uniquement) -->
      <el-tab-pane label="Envoyées" name="second" data-test="NotificationMenuEnvoyer"
        v-if="isAdmin">
        <div class="scroll-y mh-325px my-5 px-5">
          <div v-if="isLoading" class="d-flex justify-content-center py-5">
            <el-icon class="rotating"><Loading /></el-icon>
          </div>

          <div v-else-if="sentNotifications.length === 0" class="text-center py-5 text-muted">
            <p>Aucune notification envoyée</p>
          </div>

          <div
            v-else
            v-for="item in sentNotifications"
            :key="item.id"
            class="d-flex flex-stack justify-content-between py-4 border-bottom"
          >
            <div class="d-flex flex-column align-items-start">
              <span class="fw-bold fs-7">{{ item.message }}</span>
              <span class="text-muted fs-8">{{ formatDate(item.createdAt) }}</span>
              <el-tag
                size="small"
                :type="item.isRead ? 'success' : 'warning'"
                class="mt-1"
              >
                {{ item.isRead ? 'Lu' : 'Non lu' }}
              </el-tag>
            </div>
            <el-button
              text
              type="danger"
              size="small"
              @click="deleteNotif(item.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/useAuth'
import { Components } from '@tekab-dev-team/storybook-devfactory'
import { Bell, Refresh, Delete, Loading } from '@element-plus/icons-vue'
import type { TabsPaneContext } from 'element-plus'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default defineComponent({
  name: 'notifications-menu',
  components: { Bell, Refresh, Delete, Loading },

  setup() {
    const { currentUser } = storeToRefs(useAuthStore())
    const activeName       = ref('first')
    const notifications    = ref<any[]>([])
    const sentNotifications = ref<any[]>([])
    const isLoading        = ref(false)
    let   pollingInterval: any = null

    // ✅ Vérifier si admin
    const isAdmin = computed(() =>
      currentUser.value?.roles?.includes('admin') ?? false
    )

    // ✅ Compter non lus
    const unreadCount = computed(() =>
      notifications.value.filter(n => !n.isRead).length
    )

    // ✅ Charger les notifications depuis l'API
    const loadNotifications = async () => {
      isLoading.value = true
      try {
        const token = localStorage.getItem('access_token')
        const res = await axios.get(`${API_URL}/nest/api/notification/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        notifications.value = res.data ?? []
      } catch (err) {
        console.error('Erreur chargement notifications:', err)
      } finally {
        isLoading.value = false
      }
    }

    // ✅ Charger notifications envoyées (admin)
    const loadSentNotifications = async () => {
      if (!isAdmin.value) return
      try {
        const token = localStorage.getItem('access_token')
        const res = await axios.get(`${API_URL}/nest/api/notification/sent`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        sentNotifications.value = res.data ?? []
      } catch (err) {
        console.error('Erreur chargement envoyées:', err)
      }
    }

    // ✅ Marquer une notification comme lue
    const markAsRead = async (item: any) => {
      if (item.isRead) return
      try {
        const token = localStorage.getItem('access_token')
        await axios.patch(
          `${API_URL}/nest/api/notification/${item.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        item.isRead = true
      } catch (err) {
        console.error('Erreur markAsRead:', err)
      }
    }

    // ✅ Marquer tout comme lu
    const markAllAsRead = async () => {
      const unread = notifications.value.filter(n => !n.isRead)
      await Promise.all(unread.map(n => markAsRead(n)))
      Components.ElMessage.success('Toutes les notifications marquées comme lues')
    }

    // ✅ Supprimer une notification
    const deleteNotif = async (id: string) => {
      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`${API_URL}/nest/api/notification/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        sentNotifications.value = sentNotifications.value.filter(n => n.id !== id)
        Components.ElMessage.success('Notification supprimée')
      } catch (err) {
        Components.ElMessage.error('Erreur lors de la suppression')
      }
    }

    // ✅ Formater la date
    const formatDate = (date: string) => {
      if (!date) return ''
      const d   = new Date(date)
      const now = new Date()
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

      if (diff < 60)     return 'À l\'instant'
      if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`
      if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`
      return d.toLocaleDateString('fr-FR')
    }

    const handleClick = (tab: TabsPaneContext) => {
      if (tab.paneName === 'second') loadSentNotifications()
    }

    const args = {
      editable: false,
      'tab-position': 'top',
      stretch: 'true',
      closable: false,
    }

    // ✅ Polling toutes les 30 secondes
    onMounted(() => {
      loadNotifications()
      pollingInterval = setInterval(loadNotifications, 30000)
    })

    onUnmounted(() => {
      if (pollingInterval) clearInterval(pollingInterval)
    })

    return {
      args,
      activeName,
      notifications,
      sentNotifications,
      isLoading,
      isAdmin,
      unreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotif,
      formatDate,
      handleClick,
    }
  }
})
</script>

<style lang="scss" scoped>
.notif-item {
  cursor: pointer;
  border-radius: 8px;
  padding: 8px 12px;
  transition: background 0.2s;
  border-bottom: 1px solid var(--bs-gray-100);

  &:hover { background: var(--bs-gray-100); }
}

.notif-unread {
  background: rgba(37, 68, 221, 0.04);
  border-left: 3px solid #2544dd;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2544dd;
  flex-shrink: 0;
}

.icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.notif-badge {
  margin-left: 6px;
}

.tab-label {
  display: flex;
  align-items: center;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>