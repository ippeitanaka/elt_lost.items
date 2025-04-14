"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import LostItemForm from "../components/LostItemForm"
import LostItemList from "../components/LostItemList"
import LoginModal from "../components/LoginModal"
import { Button } from "@/components/ui/button"
import { signOut } from "../lib/auth"
import { supabase } from "../lib/supabase"

export default function Home() {
  const { user, loading } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.reload()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>読み込み中...</div>
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  return (
    <main className="container mx-auto p-4 flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-4">忘れ物管理アプリ</h1>

      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-2">忘れ物一覧</h2>
        <LostItemList isAdminMode={!!user} />
      </div>

      {user ? (
        <div className="mt-8">
          <div className="mb-4">
            <span className="mr-2">ログイン中: {user.email}</span>
            <Button onClick={handleSignOut}>ログアウト</Button>
          </div>
          <h2 className="text-xl font-semibold mb-2">忘れ物登録</h2>
          <LostItemForm />
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Button onClick={() => setIsLoginModalOpen(true)}>管理者ログイン</Button>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </main>
  )
}

