import type React from "react"
import { AuthProvider } from "../contexts/AuthContext"
import ErrorBoundary from "../components/ErrorBoundary"
import { M_PLUS_Rounded_1c } from "next/font/google"
import "./globals.css"

// M PLUS Rounded 1cフォントの設定
const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-m-plus-rounded-1c",
})

export const metadata = {
  title: "忘れ物管理アプリ",
  description: "忘れ物を簡単に管理するためのアプリケーション",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={mPlusRounded1c.variable}>
      <body className="font-mplus">
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
