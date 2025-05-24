import { createClient } from "@supabase/supabase-js"

// 環境変数を取得（フォールバック付き）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tqcifvfnpveicqplfcsq.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxY2lmdmZucHZlaWNxcGxmY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODU1NjgsImV4cCI6MjA2MDM2MTU2OH0.d2G-LtZ7B8d3a1k_7bmFhAWep4Wh6HFjwTOGXHiHDGM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
  },
})

// 環境変数が正しく設定されているかチェック
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}
