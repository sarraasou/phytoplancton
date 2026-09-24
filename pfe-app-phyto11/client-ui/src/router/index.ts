import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/store/useAuth"
import { admin_router }      from "./admin_router"
import { user_router }       from "./user_router"
import { expert_router }     from "./expert_router"
import { technicien_router } from "./technicien_router"
import { nextTick } from "vue"

// ─── Rôle → route après login ─────────────────────────────────────────────────
// ✅ TOUS les rôles → dashboard
const roleToRoute: Record<string, string> = {
  admin:      "dashboard",
  expert:     "dashboard",
  biologiste: "dashboard",
  biologist:  "dashboard",
  technicien: "dashboard",
  user:       "dashboard",
}

function getUserRole(currentUser: any): string {
  return (
    currentUser?.userRole?.toLowerCase() ||
    currentUser?.role?.toLowerCase()     ||
    "user"
  ).trim()
}

// ─── Routes statiques ─────────────────────────────────────────────────────────
const staticRoutes = [
  // Test
  {
    path: "/test",
    meta: { requiresAuth: false },
    component: () => import("@/components/layouts/mainLayout/Layout.vue"),
    children: [
      {
        name: "test-components",
        path: "components",
        component: () => import("@/views/Test.vue"),
        meta: { requiresAuth: false },
      },
    ],
  },


  // ✅ Dashboard — accessible à tous les rôles connectés
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { requiresAuth: true },
    component: () => import("@/components/layouts/mainLayout/Layout.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/dashboard/PhytoDashboard.vue"),
      },
    ],
  },

  // ✅ Home "/" → redirige vers dashboard si connecté, sinon Landing page
  {
    name: "home",
    path: "",
    meta: { requiresAuth: false },
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const store = useAuthStore()
      if (!store.currentUser) await store.getCurrent()
      if (store.isLoggedIn) {
        next({ name: "dashboard" })
      } else {
        next()
      }
    },
    component: () => import("@/views/Home.vue"),
  },

  // Profil
  {
    path: "/userprofile",
    meta: { requiresAuth: true },
    component: () => import("@/components/layouts/mainLayout/Layout.vue"),
    children: [
      {
        path: "",
        name: "my-profile",
        component: () => import("@/views/main/userProfile/MyProfile.vue"),
      },
    ],
  },

  // Auth
  {
    path: "/auth",
    redirect: "/",
    component: () => import("@/components/layouts/Auth.vue"),
    children: [
      {
        path: "sign-in",
        name: "sign-in",
        meta: { auth: true },
        component: () => import("@/views/auth/SignIn.vue"),
      },
      {
        path: "sign-up",
        name: "sign-up",
        meta: { auth: true },
        component: () => import("@/views/auth/SignUp.vue"),
      },
      {
        path: "password-reset",
        name: "password-reset",
        meta: { auth: true },
        component: () => import("@/views/auth/ResetPassword.vue"),
      },
      {
        path: "email-reset-password",
        name: "email-reset-password",
        meta: { auth: true },
        component: () => import("@/views/auth/EmailResetPassword.vue"),
      },
      {
        path: "msg-reset-password",
        name: "msg-reset-password",
        meta: { auth: true },
        component: () => import("@/views/auth/MsgResetPassword.vue"),
      },
    ],
  },

  // Erreurs
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/errors/Error404.vue"),
  },
  {
    path: "/doc",
    name: "doc",
    component: () => import("@/views/doc/doc.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/callback",
    name: "callback",
    meta: { auth: false },
    component: () => import("@/components/Callback.vue"),
  },
]

// ─── Router ───────────────────────────────────────────────────────────────────
const routes: Array<RouteRecordRaw> = [
  ...staticRoutes,
  admin_router,
  user_router,
  expert_router,
  technicien_router,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ─── Guard global ─────────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const authRoute    = to.matched.some((r) => r.meta.auth)
  const store        = useAuthStore()
  const { currentUser, isLoggedIn } = storeToRefs(store)

  if (!currentUser.value) await store.getCurrent()
await nextTick()
  // 1. Bloquer comptes inactifs
  if (isLoggedIn.value && currentUser.value) {
    const status = currentUser.value?.status
    if (["EN_ATTENTE", "REJETE", "DESACTIVE"].includes(status)) {
      await store.logout()
      next({ name: "sign-in" })
      return
    }
  }

  // 2. Connecté sur page /auth/* → dashboard
  if (
    isLoggedIn.value && authRoute &&
    !to.fullPath.includes("type=recovery") &&
    !to.fullPath.includes("type=invite")
  ) {
    next({ name: "dashboard" })
    return
  }

  // 3. Page protégée sans connexion → sign-in
  if (requiresAuth && !isLoggedIn.value) {
    next({ name: "sign-in" })
    return
  }

  // 4. Protection par rôle (accès aux espaces /admin, /expert, etc.)
// 4. Protection par rôle
if (isLoggedIn.value && currentUser.value) {
  const role = getUserRole(currentUser.value)
  const path = to.path

  // ✅ Routes admin uniquement
  if (path.startsWith("/admin") && role !== "admin") {
    next({ name: "dashboard" })
    return
  }

  // ✅ Bloquer /expert/users pour les non-admins
  if (path.startsWith("/expert/users") && role !== "admin") {
    next({ name: "dashboard" })
    return
  }
  if (path.startsWith("/technicien/users") && role !== "admin") {
    next({ name: "dashboard" })
    return
  }
  if (path.startsWith("/user/users") && role !== "admin") {
    next({ name: "dashboard" })
    return
  }
}
  next()
})

export default router