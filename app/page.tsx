import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-2xl text-center space-y-6 sm:space-y-8">
          {/* Receipt preview - styled with CSS instead of ASCII box chars */}
          <div
            className="mx-auto max-w-[280px] sm:max-w-[340px] border border-foreground/20 font-mono text-xs sm:text-sm text-muted-foreground select-none"
            aria-hidden="true"
          >
            {/* Header */}
            <div className="border-b border-foreground/20 px-4 sm:px-5 py-2.5 text-center tracking-wide">
              us.string.sg/you
            </div>
            {/* Profile info */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-1">
              <div className="flex">
                <span className="w-20 sm:w-24 shrink-0 text-muted-foreground/50">NAME</span>
                <span className="text-foreground/70">Your Name</span>
              </div>
              <div className="flex">
                <span className="w-20 sm:w-24 shrink-0 text-muted-foreground/50">STATUS</span>
                <span className="text-foreground/70"><span className="text-accent">●</span> CLAIMED</span>
              </div>
              <div className="flex">
                <span className="w-20 sm:w-24 shrink-0 text-muted-foreground/50">TAGLINE</span>
                <span className="text-foreground/70">ships things</span>
              </div>
            </div>
            {/* Divider + Products */}
            <div className="border-t border-foreground/20 px-4 sm:px-5 py-2.5 text-muted-foreground/50 tracking-wide">
              PRODUCTS SHIPPED
            </div>
            <div className="border-t border-foreground/20 px-4 sm:px-5 py-3 sm:py-4 space-y-0.5">
              <div className="text-foreground/70">01. Your Product</div>
              <div className="pl-6 sm:pl-8 text-muted-foreground/50">{'└─'} Your Role</div>
              <div className="pl-6 sm:pl-8 text-muted-foreground/50">{'└─'} Your Impact</div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance">
              Digital name cards for builders
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-lg mx-auto px-2">
              Stop repeating your intro. Claim your profile, showcase what you ship, 
              share one link across Discord, WhatsApp, and events.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground font-mono text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              Claim your handle
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/wei"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 border border-border font-mono text-sm sm:text-base hover:bg-secondary transition-colors bg-transparent"
            >
              See an example
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-sm text-muted-foreground mb-6 sm:mb-8 text-center">
            HOW IT WORKS
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="font-mono text-muted-foreground">01.</div>
              <h3 className="font-bold">Claim your handle</h3>
              <p className="text-muted-foreground text-sm">
                Sign in with Google and claim your unique us.string.sg/username
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-muted-foreground">02.</div>
              <h3 className="font-bold">Add your products</h3>
              <p className="text-muted-foreground text-sm">
                Showcase what you&apos;ve built with your role and impact metrics
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-muted-foreground">03.</div>
              <h3 className="font-bold">Share everywhere</h3>
              <p className="text-muted-foreground text-sm">
                One link for Discord, WhatsApp, LinkedIn, and networking events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-mono">string.sg</span>
          <span>for builders, by builders</span>
        </div>
      </footer>
    </main>
  )
}
