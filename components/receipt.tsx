"use client"

import Link from "next/link"
import { Linkedin, Github, Globe, ExternalLink } from "lucide-react"

interface ImpactMetric {
  id: string
  label: string
  value: string
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  role: string
  impact_metrics: ImpactMetric[]
  team_count?: number
}

interface Profile {
  username: string
  name: string
  tagline?: string
  avatar_url?: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
  claimed: boolean
}

interface ReceiptProps {
  profile: Profile
  products: Product[]
}

export function Receipt({ profile, products }: ReceiptProps) {
  return (
    <div className="font-mono text-sm max-w-md mx-auto border border-border">
      {/* URL header */}
      <div className="text-center py-3 text-base font-bold tracking-tight border-b border-border">
        us.string.sg/{profile.username}
      </div>

      {/* Profile info */}
      <div className="px-5 py-5 space-y-2">
        <div className="flex gap-4">
          <span className="text-muted-foreground w-20 shrink-0">NAME</span>
          <span className="font-medium">{profile.name}</span>
        </div>
        
        <div className="flex gap-4">
          <span className="text-muted-foreground w-20 shrink-0">STATUS</span>
          <span className="flex items-center gap-2">
            {profile.claimed ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                <span>CLAIMED</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />
                <span>UNCLAIMED</span>
              </>
            )}
          </span>
        </div>

        {profile.tagline && (
          <div className="flex gap-4">
            <span className="text-muted-foreground w-20 shrink-0">TAGLINE</span>
            <span>{profile.tagline}</span>
          </div>
        )}

        {/* Social links */}
        {(profile.linkedin_url || profile.github_url || profile.website_url) && (
          <div className="flex gap-4">
            <span className="text-muted-foreground w-20 shrink-0">LINKS</span>
            <div className="flex gap-3">
              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.github_url && (
                <a 
                  href={profile.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  aria-label="GitHub profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.website_url && (
                <a 
                  href={profile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  aria-label="Personal website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products section */}
      <div className="border-t border-border px-5 py-2.5 text-muted-foreground">PRODUCTS SHIPPED</div>
      <div className="border-t border-border" />

      {/* Product list */}
      <div className="px-5 py-4 space-y-6">
        {products.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No products yet
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product.id} className="space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <Link 
                  href={`/${profile.username}/${product.slug}`}
                  className="font-medium hover:text-accent transition-colors flex items-center gap-1"
                >
                  {product.name}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </Link>
              </div>
              <div className="ml-8 space-y-0.5 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="opacity-50">└─</span>
                  <span>{product.role}</span>
                </div>
                {product.impact_metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center gap-1">
                    <span className="opacity-50">└─</span>
                    <span className="text-foreground">{metric.value}</span>
                    <span>{metric.label}</span>
                  </div>
                ))}
                {product.team_count && product.team_count > 1 && (
                  <div className="flex items-center gap-1">
                    <span className="opacity-50">└─</span>
                    <span>team: +{product.team_count - 1} others</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-2.5 text-muted-foreground">
        TOTAL: {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

// Unclaimed profile variant
export function UnclaimedReceipt({ username }: { username: string }) {
  return (
    <div className="font-mono text-sm max-w-md mx-auto border border-border">
      <div className="text-center py-3 text-base font-bold tracking-tight border-b border-border">
        us.string.sg/{username}
      </div>

      <div className="px-5 py-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">UNCLAIMED</span>
        </div>
        <p className="text-muted-foreground">This handle is available.</p>
        <p className="text-muted-foreground">Is this you?</p>
        <Link 
          href={`/claim?username=${username}`}
          className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          CLAIM /{username}
        </Link>
      </div>
    </div>
  )
}
