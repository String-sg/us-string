import Link from "next/link"

export default function AuthErrorPage() {
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
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(40)}
            </div>
            <div className="py-3 font-bold">ERROR</div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▄".repeat(40)}
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Something went wrong during authentication.
          </p>
          
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground font-mono hover:opacity-90 transition-opacity"
          >
            Try again
          </Link>
        </div>
      </section>
    </main>
  )
}
