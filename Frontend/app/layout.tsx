import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { V0Provider } from "@/lib/context"
import dynamic from "next/dynamic"
import { UserProvider } from "@/components/context/UserContext"; // Import UserProvider

const V0Setup = dynamic(() => import("@/components/v0-setup"))
const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export const metadata: Metadata = {
  title: {
    template: "%s | Eunoia",
    default: "Eunoia",
  },
  description:
    "Youth Mental Wellness AI - A responsible, confidential, and empathetic companion for youth that supports through AI chat, wellness games, and community connection.",
    generator: 'v0.app'
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(geistSans.variable, geistMono.variable, instrumentSerif.variable)}>
        <V0Provider isV0={isV0}>
          {/* Wrap children with UserProvider */}
          <UserProvider>
            {children}
          </UserProvider>
          {isV0 && <V0Setup />}
        </V0Provider>
      </body>
    </html>
  )
}