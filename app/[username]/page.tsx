// Server component for profile pages
import { notFound } from "next/navigation"
import { Receipt, UnclaimedReceipt } from "@/components/receipt"
import Link from "next/link"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params

  // Fetch profile data from API
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/profile/${username}`)
  const { profile } = await response.json()

  if (!profile) {
    return {
      title: `${username} - us.string.sg`,
      description: `Claim the handle /${username} on us.string.sg`,
    }
  }

  return {
    title: `${profile.name} - us.string.sg`,
    description: profile.tagline || `${profile.name}'s builder profile on us.string.sg`,
    openGraph: {
      title: `${profile.name} - us.string.sg/${username}`,
      description: profile.tagline || `${profile.name}'s builder profile`,
      type: "profile",
    },
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params

  // Check for reserved words
  const RESERVED_ROUTES = [
    "login", "claim", "dashboard", "admin", "auth", "api"
  ]

  if (RESERVED_ROUTES.includes(username)) {
    notFound()
  }

  // Fetch profile data
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/profile/${username}`)
  const { profile, products } = await response.json()

  // Show unclaimed receipt if no profile
  if (!profile) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-mono font-bold text-lg">
              us.string.sg
            </Link>
          </div>
        </header>

        <section className="flex-1 flex items-center justify-center px-4 py-16">
          <UnclaimedReceipt username={username} />
        </section>
      </main>
    )
  }

  // Products are already fetched from the API

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-lg">
            us.string.sg
          </Link>
          <Link 
            href="/login"
            className="font-mono text-sm hover:text-accent transition-colors"
          >
            login
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <Receipt profile={profile} products={products} />
      </section>

      <footer className="border-t border-border py-4 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-muted-foreground font-mono">
          want your own? <Link href="/login" className="underline hover:text-accent transition-colors">claim your handle</Link>
        </div>
      </footer>
    </main>
  )
}
