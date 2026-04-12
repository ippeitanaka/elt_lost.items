import type React from "react"
import Script from "next/script"
import { AuthProvider } from "../contexts/AuthContext"
import ErrorBoundary from "../components/ErrorBoundary"
import "@fontsource/biz-udgothic/japanese-400.css"
import "@fontsource/biz-udgothic/japanese-700.css"
import "./globals.css"

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
    <html lang="ja">
      <body className="font-biz">
        {/* Google Analytics (GA4) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JPXBRWRFWR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JPXBRWRFWR');
          `}
        </Script>
        
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
