import { defineStore } from "pinia";
import { authService } from "@/core/services/AuthService";
import service from "@/service";
import { Provider } from "@supabase/supabase-js";
import { supabase } from "@/core/services/SupabaseClientService";
import axios from "axios";

const API_URL = (import.meta as any).env.VITE_API_URL as string;

const SUPABASE_GENERIC = ['user', 'authenticated', 'anon', '']

const normalizeRole = (role?: string | null): string =>
  role?.toLowerCase().trim() ?? ''

// ─── enrichWithDbRole ─────────────────────────────────────────────────────────
async function enrichWithDbRole(user: any, token: string): Promise<any> {
  if (!user?.id || !token) return user

  try {
    const res = await axios.get(`${API_URL}/nest/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const dbUser = res.data

    // Extraire le rôle depuis roles[] si userRole absent
    const firstDbRole = Array.isArray(dbUser?.roles) ? dbUser.roles[0] : null
    const normalizedDbRole =
      typeof firstDbRole === 'string' ? firstDbRole : (firstDbRole?.name ?? null)

    const userRole =
      dbUser?.userRole ??
      normalizedDbRole ??
      user?.user_metadata?.role ??
      user?.user_metadata?.userRole ??
      (!SUPABASE_GENERIC.includes(normalizeRole(user?.role))
        ? user?.role
        : null) ??
      'user'

    console.log('enrichWithDbRole — userRole:', userRole)

    return {
      ...user,
      userRole,
      role:      normalizeRole(userRole),
      firstName: dbUser?.firstName || user?.user_metadata?.firstName,
      lastName:  dbUser?.lastName  || user?.user_metadata?.lastName,
      isValid:   dbUser?.isValid,
      status:    dbUser?.status,
    }

  } catch (err: any) {
    console.error('enrichWithDbRole ERREUR:', err?.response?.status)

    // Fallback robuste — cherche le rôle dans tous les endroits possibles
    const fallbackRole =
      user?.userRole ??
      user?.user_metadata?.role ??
      user?.user_metadata?.userRole ??
      (!SUPABASE_GENERIC.includes(normalizeRole(user?.role))
        ? user?.role
        : null) ??
      undefined

    return {
      ...user,
      userRole: fallbackRole,
      role: typeof fallbackRole === 'string'
        ? normalizeRole(fallbackRole)
        : user?.role,
    }
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = defineStore("authStore", {
  state: () => ({
    currentUser:  null as any,
    accessToken:  "" as string | undefined,
    refreshToken: "" as string | undefined,
    isLoggedIn:   null as null | boolean,
     isReady:      false,  // ✅ AJOUTER
  }),

  actions: {

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    async login(email: string, password: string, rememberMe: boolean) {
      try {
        const result = await authService.signInWithEmail(email, password, rememberMe)
        const session = result?.session
        const user    = result?.user

        if (!session?.access_token) {
          throw new Error('Identifiants invalides')
        }

        const enrichedUser = await enrichWithDbRole(user, session.access_token)

        this.isLoggedIn   = true
        this.currentUser  = enrichedUser
        this.accessToken  = session.access_token
        this.refreshToken = session.refresh_token

        localStorage.setItem('rememberMe', rememberMe.toString())
        // Dans l'action login(), après avoir reçu la session
// Remplace le localStorage.setItem conditionnel par :
localStorage.setItem(
  'supabase.auth.token',
  JSON.stringify({
    currentSession: session,
    expiresAt:      session.expires_at,
  })
)

        service.setBaseApiParams({
          headers: { Authorization: 'Bearer ' + session.access_token },
        })
        this.isReady = true 

      } catch (error: any) {
        this.isLoggedIn  = false
        this.currentUser = null
        this.accessToken = ''
        this.isReady = false
        throw error // propagé vers SignIn.vue
        
      }
    },

    // ─── LOGIN PROVIDER ───────────────────────────────────────────────────────
    // CORRIGÉ : ajout try/catch + guard session null
    async loginWithProvider(provider: Provider) {
      try {
        const { result } = await authService.signInWithProvider(provider)

        if (!result.session?.access_token) {
          return { data: null, error: new Error('Session OAuth indisponible') }
        }

        this.isLoggedIn   = true
        this.accessToken  = result.session.access_token
        this.refreshToken = result.session.refresh_token!
        this.currentUser  = await enrichWithDbRole(
          result.session.user,
          result.session.access_token
        )

        service.setBaseApiParams({
          headers: { Authorization: 'Bearer ' + result.session.access_token },
        })

        return { data: result.session, error: null }

      } catch (error: any) {
        return { data: null, error }
      }
    },

    // ─── SIGNUP ───────────────────────────────────────────────────────────────
    // CORRIGÉ : refreshToken initialisé + supabase.auth.update() ajouté
    async signUp(
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: string,
      rememberMe: boolean
    ) {
      try {
        const result: any = await authService.signUp(
          email, password, firstName, lastName, role, rememberMe
        )

        // Compte EN_ATTENTE — pas de connexion automatique
        if (result?.status === 'EN_ATTENTE' || result?.success === true) {
          this.isLoggedIn   = false
          this.currentUser  = null
          this.accessToken  = ''
          this.refreshToken = ''
          return result
        }

        // Connexion directe si compte actif immédiatement
        if (result?.data?.session?.access_token) {
          this.isLoggedIn   = true
          this.accessToken  = result.data.session.access_token
          this.refreshToken = result.data.session.refresh_token
          this.currentUser  = await enrichWithDbRole(
            result.data.session.user,
            result.data.session.access_token
          )

          service.setBaseApiParams({
            headers: { Authorization: 'Bearer ' + result.data.session.access_token },
          })

          // Synchroniser firstName/lastName dans Supabase metadata
          await supabase.auth.update({
            data: { username: email, firstName, lastName },
          })
        }

        return result

      } catch (error: any) {
        throw error
      }
    },

    // ─── RESET ────────────────────────────────────────────────────────────────
    async resetByEmail(email: string) {
      await authService.resetByEmail(email)
    },

    async reset(password: string) {
      await authService.reset(password)
    },

    // ─── LOGOUT ───────────────────────────────────────────────────────────────
    async logout() {
      await authService.signOut()
      this.currentUser  = null
      this.accessToken  = ""
      this.refreshToken = ""
      this.isLoggedIn   = false
      this.isReady = false
    },

    // ─── GET CURRENT ──────────────────────────────────────────────────────────
    async getCurrent() {
      const result = await authService.getCurrent()
      this.isLoggedIn = result.isLoggedIn

      if (result.session) {
        this.accessToken  = result.session.access_token
        this.refreshToken = result.session.refresh_token!
        this.currentUser  = await enrichWithDbRole(
          result.session.user,
          result.session.access_token
        )
        console.log('getCurrent — userRole:', this.currentUser?.userRole)
      } else {
        this.currentUser  = null
        this.accessToken  = ""
        this.refreshToken = ""
      }
      this.isReady = true 
      return result
    },

    // ─── CHANGE EMAIL ─────────────────────────────────────────────────────────
    async changeEmail(payload: { email: string; password: string; userId: string }) {
      try {
        await service.nest.authControllerChangeEmail({
          email:    payload.email,
          password: payload.password,
          userId:   payload.userId,
        })

        const newSession = await supabase.auth.api.refreshAccessToken(
          this.refreshToken as string
        )

        if (newSession.data) {
          localStorage.setItem(
            'supabase.auth.token',
            JSON.stringify({
              currentSession: newSession.data,
              expiresAt:      newSession.data.expires_at,
            })
          )
          this.accessToken  = newSession.data.access_token
          this.refreshToken = newSession.data.refresh_token
          this.currentUser  = await enrichWithDbRole(
            newSession.data.user,
            newSession.data.access_token
          )
          service.setBaseApiParams({
            headers: { Authorization: 'Bearer ' + this.accessToken },
          })
          return true
        } else {
          this.logout()
          return true
        }
      } catch (error: any) {
        console.error('changeEmail error:', error?.message)
        return false
      }
    },
  },
})