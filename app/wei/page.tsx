import Link from "next/link"
import { Receipt } from "@/components/receipt"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wei - us.string.sg",
  description: "Wei's builder profile - ships things in sg",
  openGraph: {
    title: "Wei - us.string.sg/wei",
    description: "ships things in sg",
    type: "profile",
  },
}

// Example profile data
const exampleProfile = {
  username: "wei",
  name: "Wei Liang",
  tagline: "ships things in sg",
  avatar_url: null,
  linkedin_url: "https://linkedin.com/in/example",
  github_url: "https://github.com/example",
  website_url: "https://example.com",
  claimed: true,
}

const exampleProducts = [
  {
    id: "1",
    name: "FormSG",
    slug: "formsg",
    description: "Form builder for Singapore government",
    role: "Engineer",
    impact_metrics: [
      { id: "1", label: "public health institutions onboarded", value: "26/26" },
      { id: "2", label: "community hospitals onboarded", value: "4/4" },
    ],
    team_count: 6,
  },
  {
    id: "2",
    name: "ScamShield",
    slug: "scamshield",
    description: "Anti-scam app for Singapore",
    role: "Design",
    impact_metrics: [
      { id: "3", label: "downloads", value: "1.2M" },
    ],
    team_count: 4,
  },
  {
    id: "3",
    name: "string.sg",
    slug: "string-sg",
    description: "Digital name cards for builders",
    role: "Founder",
    impact_metrics: [
      { id: "4", label: "", value: "you're looking at it" },
    ],
    team_count: 1,
  },
]

export default function ExampleProfilePage() {
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

      <div className="bg-accent/10 border-b border-accent/20 py-2 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm font-mono text-accent">
          This is an example profile
        </div>
      </div>

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <Receipt profile={exampleProfile} products={exampleProducts} />
      </section>

      <footer className="border-t border-border py-4 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-muted-foreground font-mono">
          want your own? <Link href="/login" className="underline hover:text-accent transition-colors">claim your handle</Link>
        </div>
      </footer>
    </main>
  )
}
