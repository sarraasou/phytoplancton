import { createClient } from "@supabase/supabase-js";
const autoRefreshToken = localStorage.getItem("rememberMe") === "true" ? true : false;

export const supabase = createClient(
  "http://localhost:8015",
  import.meta.env.VITE_ANON_KEY,
  {
    autoRefreshToken: autoRefreshToken,
    detectSessionInUrl: false
  }
);
