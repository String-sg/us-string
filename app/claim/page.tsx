"use client"

import React from "react"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

// Reserved and inappropriate words
const RESERVED_WORDS = [
  "admin", "api", "auth", "login", "signup", "claim", "dashboard", 
  "settings", "profile", "user", "users", "help", "support", "about",
  "terms", "privacy", "contact", "blog", "docs", "app", "www", "mail",
  "string", "us", "sg"
]

const INAPPROPRIATE_WORDS = [
  "fuck", "shit", "ass", "bitch", "damn", "crap", "dick", "cock", 
  "pussy", "nigger", "faggot", "retard", "slut", "whore"
]

function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" }
  }
  if (username.length > 20) {
    return { valid: false, error: "Username must be 20 characters or less" }
  }
  if (!/^[a-z0-9]+$/.test(username)) {
    return { valid: false, error: "Only lowercase letters and numbers allowed" }
  }
  if (RESERVED_WORDS.includes(username.toLowerCase())) {
    return { valid: false, error: "This username is reserved" }
  }
  const lowerUsername = username.toLowerCase()
  for (const word of INAPPROPRIATE_WORDS) {
    if (lowerUsername.includes(word)) {
      return { valid: false, error: "This username is not allowed" }
    }
  }
  return { valid: true }
}

export default function ClaimPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated || !user) {
        router.push("/login")
        return
      }

      // Check if user already has a username
      const response = await fetch(`/api/profiles?userId=${user.id}`)
      const { profile } = await response.json()

      if (profile?.username) {
        router.push("/dashboard")
        return
      }
    }

    checkAuth()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const checkUsername = async () => {
      if (!username) {
        setIsAvailable(null)
        setError("")
        return
      }

      const validation = isValidUsername(username)
      if (!validation.valid) {
        setError(validation.error || "Invalid username")
        setIsAvailable(false)
        return
      }

      setIsChecking(true)
      setError("")

      const response = await fetch(`/api/profiles?username=${username}`)
      const { profile: data } = await response.json()

      setIsChecking(false)
      setIsAvailable(!data)
      
      if (data) {
        setError("This username is taken")
      }
    }

    const debounce = setTimeout(checkUsername, 300)
    return () => clearTimeout(debounce)
  }, [username])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !isAvailable) return

    setIsSubmitting(true)

    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        username,
      }),
    })

    const result = await response.json()
    const error = result.error

    if (error) {
      setError("Failed to claim username. Please try again.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="font-mono font-bold text-lg">
            us.string.sg
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(40)}
            </div>
            <div className="text-center py-3 text-base font-bold">
              CLAIM YOUR HANDLE
            </div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▄".repeat(40)}
            </div>

            <form onSubmit={handleClaim} className="py-8 space-y-6">
              <div className="space-y-2">
                <label className="text-muted-foreground">USERNAME</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">us.string.sg/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="yourname"
                    className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1 font-mono"
                    autoFocus
                  />
                </div>
                
                <div className="h-5 text-xs">
                  {isChecking && (
                    <span className="text-muted-foreground">Checking...</span>
                  )}
                  {!isChecking && error && (
                    <span className="text-destructive">{error}</span>
                  )}
                  {!isChecking && isAvailable && (
                    <span className="text-accent">Available!</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isAvailable || isSubmitting}
                className="w-full px-4 py-3 bg-primary text-primary-foreground font-mono hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Claiming..." : `Claim /${username || "..."}`}
              </button>
            </form>

            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(40)}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
