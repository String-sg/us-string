"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/claim")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Initialize Google button when component mounts
    initializeGoogleButton()
  }, [])

  const initializeGoogleButton = async () => {
    try {
      // Load Google Identity Services if not already loaded
      if (!(window as any).google) {
        await loadGoogleScript()
      }

      const google = (window as any).google

      // Initialize Google Identity Services
      await google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false
      })

      // Render the actual Google button directly
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '' // Clear existing content

        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320
        })
      }
    } catch (error) {
      console.error('Failed to initialize Google auth:', error)
    }
  }

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google script'))
      document.head.appendChild(script)
    })
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode the JWT token to get user info
      const payload = parseJWT(response.credential)

      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture
      }

      // Save user to database
      try {
        const saveResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: 'google',
          }),
        })

        if (!saveResponse.ok) {
          console.warn('Failed to save user to database:', saveResponse.statusText)
        }
      } catch (dbError) {
        console.warn('Database save error:', dbError)
      }

      // Update local auth state
      localStorage.setItem('string-auth-user', JSON.stringify(user))
      router.push('/claim')
    } catch (error) {
      console.error('Failed to process Google credential:', error)
    }
  }

  const parseJWT = (token: string): any => {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-lg">
            us.string.sg
          </Link>
        </div>
      </header>

      {/* Login form */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="font-mono text-sm">
            {/* Receipt style header */}
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(40)}
            </div>
            <div className="text-center py-3 text-base font-bold">
              LOGIN / SIGNUP
            </div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(40)}
            </div>

            <div className="py-8 space-y-6">
              <p className="text-center text-muted-foreground">
                Sign in to claim your handle and start building your profile.
              </p>

              {/* Real Google Sign-in Button */}
              <div ref={googleButtonRef} className="w-full flex justify-center">
                {/* Fallback button while Google button loads */}
                <div className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-transparent border border-border font-mono text-muted-foreground">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Loading Google Sign-In...</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our terms and privacy policy.
              </p>
            </div>

            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(40)}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
