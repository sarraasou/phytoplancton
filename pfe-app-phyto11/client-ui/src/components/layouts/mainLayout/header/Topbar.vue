<template>
  <div class="d-flex align-items-stretch flex-shrink-0">

    <!-- Notifications -->
    <div class="d-flex align-items-center ms-1 ms-lg-3">
      <div
        class="btn btn-icon btn-active-light-primary position-relative w-30px h-30px w-md-40px h-md-40px"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
          width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="#5e6278" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span
          v-if="unreadCount > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style="font-size:9px; padding:2px 5px; min-width:16px;"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
      <KTNotificationsMenu />
    </div>

    <!-- Avatar -->
    <div class="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">
      <div
        class="cursor-pointer symbol symbol-30px symbol-md-40px"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
      >
        <Avatar
          v-if="firstName || lastName"
          :first-name="firstName"
          :last-name="lastName"
          :size="40"
          src=""
          background-color="#0077b6"
          text-color="#ffffff"
          shape="square"
        />
        <div
          v-else
          style="width:40px;height:40px;background:#0077b6;color:white;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:14px;font-weight:600;"
        >
          {{ userInitials }}
        </div>
      </div>
      <KTUserMenu />
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import KTNotificationsMenu from '@/components/layouts/mainLayout/header/partials/NotificationsMenu.vue'
import KTUserMenu          from '@/components/layouts/mainLayout/header/partials/UserMenu.vue'
import { DfAvatar }        from '@tekab-dev-team/storybook-devfactory'
import { storeToRefs }     from 'pinia'
import { useAuthStore }    from '@/store/useAuth'
import axios               from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL as string

export default defineComponent({
  name: 'topbar',
  components: { KTNotificationsMenu, KTUserMenu, Avatar: DfAvatar },
  setup() {
    const authStore       = useAuthStore()
    const { currentUser } = storeToRefs(authStore)
    const unreadCount     = ref(0)
    let   pollingInterval: any = null

    const firstName = computed(() =>
      currentUser.value?.firstName
      ?? currentUser.value?.user_metadata?.firstName
      ?? ''
    )
    const lastName = computed(() =>
      currentUser.value?.lastName
      ?? currentUser.value?.user_metadata?.lastName
      ?? ''
    )
    const userInitials = computed(() => {
      if (firstName.value) return firstName.value[0].toUpperCase()
      const email = currentUser.value?.email ?? ''
      return email ? email[0].toUpperCase() : 'U'
    })

    // ✅ Lit token depuis localStorage OU store Pinia
    const getToken = (): string => {
      try {
        const raw = localStorage.getItem('supabase.auth.token')
        const t   = JSON.parse(raw || '{}')?.currentSession?.access_token
        if (t?.startsWith('ey')) return t
      } catch { /* silent */ }
      const storeToken = authStore.accessToken
      if (storeToken?.startsWith('ey')) return storeToken
      return ''
    }

    const fetchUnreadCount = async () => {
      try {
        const token = getToken()
        if (!token) return
        const res = await axios.get(
          `${API_URL}/nest/api/notification/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        unreadCount.value = typeof res.data === 'number'
          ? res.data
          : res.data?.count ?? 0
      } catch { /* silencieux */ }
    }

    onMounted(() => {
      fetchUnreadCount()
      pollingInterval = setInterval(fetchUnreadCount, 30_000)
    })
    onUnmounted(() => {
      if (pollingInterval) clearInterval(pollingInterval)
    })

    return { currentUser, unreadCount, firstName, lastName, userInitials }
  },
})
</script>

<style scoped>
.btn-icon svg { transition: stroke 0.2s; }
.btn-icon:hover svg { stroke: #009ef7; }
</style>
