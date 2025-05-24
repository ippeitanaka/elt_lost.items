"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")

        // 初期セッションの確認
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (isMounted) {
            setError(`認証セッションエラー: ${sessionError.message}`)
            setUser(null)
            setLoading(false)
          }
          return
        }

        console.log("Session data:", sessionData)

        // セッションがある場合のみユーザー情報を取得
        if (sessionData?.session) {
          const { data, error: userError } = await supabase.auth.getUser()

          if (userError) {
            console.error("Error getting current user:", userError)
            if (isMounted) {
              setError(`ユーザー情報エラー: ${userError.message}`)
              setUser(null)
            }
          } else if (isMounted) {
            console.log("User data:", data.user)
            setUser(data.user)
            setError(null)
          }
        } else if (isMounted) {
          console.log("No session found")
          setUser(null)
          setError(null)
        }

        // 認証状態の変更を監視
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session)
          if (isMounted) {
            setUser(session?.user ?? null)
            setLoading(false)
            setError(null)
          }
        })

        return () => {
          if (authListener?.subscription) {
            authListener.subscription.unsubscribe()
          }
        }
      } catch (error) {
        console.error("Unexpected error in auth context:", error)
        if (isMounted) {
          setError(`認証処理エラー: ${error}`)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const cleanup = initializeAuth()

    return () => {
      isMounted = false
      cleanup?.then((cleanupFn) => cleanupFn?.())
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>
}
