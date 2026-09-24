import { Components } from "@tekab-dev-team/storybook-devfactory";
import router from "@/router/index";
import { supabase } from "@/core/services/SupabaseClientService";
import { Provider } from "@supabase/supabase-js";

export class AuthService {

  // ─── GET CURRENT ─────────────────────────────────────────────────────────
  async getCurrent() {
    const currentSession: any = await supabase.auth.session();
    if (!currentSession?.access_token) {
      return { session: null, isLoggedIn: false };
    }
    const { error } = await supabase.auth.api.getUser(currentSession.access_token);
    if (error) {
      localStorage.removeItem("supabase.auth.token");
      return { session: null, isLoggedIn: false };
    }
    return { session: currentSession, isLoggedIn: true };
  }

  // ─── SIGN IN WITH EMAIL ───────────────────────────────────────────────────
  // CORRIGÉ : parse JSON protégé avec try/catch
  async signInWithEmail(email: string, password: string, rememberMe: boolean) {
    localStorage.setItem('rememberMe', rememberMe.toString())

    // Étape 1 — vérifier statut via NestJS (bloque EN_ATTENTE / REJETÉ)
    const check = await fetch(
      import.meta.env.VITE_API_URL + '/nest/api/sign_in',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.toLowerCase(), password }),
      }
    )

    // Parse protégé — le serveur peut retourner du HTML en cas d'erreur 502
    let checkResult: any = null
    try {
      checkResult = await check.json()
    } catch {
      checkResult = null
    }

    if (!check.ok) {
      throw new Error(checkResult?.message || 'Accès refusé')
    }

    // Étape 2 — connexion Supabase
    const result = await supabase.auth.signIn({
      email: email.toLowerCase(),
      password,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    // Étape 3 — synchroniser le token dans Supabase
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      const parsedToken = this.tryParseJson(token)
      const accessToken = parsedToken?.currentSession?.access_token
      if (accessToken) {
        supabase.auth.setAuth(accessToken)
      }
    }

    // NE PAS faire router.push ici — c'est useAuth.ts + router/index.ts
    return result // { user, session, error: null }
  }

  // ─── SIGN IN WITH PROVIDER ────────────────────────────────────────────────
  // CORRIGÉ : guard result.error ajouté
  async signInWithProvider(provider: Provider) {
    const result = await supabase.auth.signIn({ provider })
    if (result.error) {
      throw new Error(result.error.message)
    }
    return { result }
  }

  // ─── SIGN UP ──────────────────────────────────────────────────────────────
  // CORRIGÉ : parse JSON protégé avec try/catch
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    rememberMe: boolean
  ): Promise<any> {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/nest/api/sign_up",
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, firstName, lastName, role }),
      }
    )

    // Parse protégé
    let result: any = null
    try {
      result = await response.json()
    } catch {
      result = null
    }

    // Compte EN_ATTENTE — retourner sans connexion automatique
    if (result?.status === "EN_ATTENTE" || result?.success === true) {
      return result
    }

    // Cas legacy — token reçu directement (ne devrait plus arriver)
    if (result?.access_token) {
      try {
        const loginResult = await this.signInWithEmail(email, password, rememberMe)
        return { data: loginResult, error: null }
      } catch (error) {
        Components.ElMessage.error(error)
        return { data: null, error }
      }
    }

    // Erreur backend réelle
    console.error("signUp error:", result)
    throw new Error(
      result?.message || result?.msg || "Erreur lors de l'inscription"
    )
  }

  // ─── SIGN OUT ─────────────────────────────────────────────────────────────
  async signOut() {
    await supabase.auth.signOut()
    router.push({ name: "sign-in" })
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  async resetByEmail(email: string) {
    try {
      const result = await supabase.auth.api.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_SITE_URL + "/auth/password-reset",
      })
      if (result.error) {
        Components.ElMessage.error(result.error)
      } else {
        router.push({ name: "msg-reset-password" })
      }
    } catch (error: any) {
      Components.ElMessage.error(error.message)
    }
  }

  async reset(password: string) {
    try {
      const result = await supabase.auth.api.updateUser(
        this.getAccessToken(),
        { password }
      )
      if (result.data) {
        router.push({ name: "sign-in" })
      }
    } catch (error: any) {
      Components.ElMessage.error(error.message)
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  tryParseJson = (jsonString: any) => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return undefined
    }
  }

  getParameterByName(name: string, url?: string) {
    if (typeof window === "undefined") return ""
    if (!url) url = window?.location?.href || ""
    name = name.replace(/[\[\]]/g, "\\$&")
    const regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)")
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ""
    return decodeURIComponent(results[2].replace(/\+/g, " "))
  }

  getAccessToken() {
    if (typeof window === "undefined") return ""
    const tokenData = window?.localStorage["supabase.auth.token"]
    if (!tokenData) {
      const access_token = this.getParameterByName("access_token")
      return access_token ?? undefined
    }
    const tokenObj = this.tryParseJson(tokenData)
    if (!tokenObj) return ""
    return tokenObj.currentSession.access_token
  }
}

export const authService = new AuthService()