"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ExternalLink, Trash2 } from "lucide-react"

// Admin email - change this to your email
const ADMIN_EMAIL = "admin@string.sg"

interface Profile {
  id: string
  username: string
  name: string
  tagline?: string
  claimed: boolean
  created_at: string
}

interface ProductMember {
  id: string
  role: string
  created_at: string
  user: { username: string; name: string }
  product: { name: string; slug: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [productMembers, setProductMembers] = useState<ProductMember[]>([])
  const [activeTab, setActiveTab] = useState<"profiles" | "products">("profiles")

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    // Check if user is admin - you can customize this check
    if (user.email !== ADMIN_EMAIL && !user.email?.endsWith("@string.sg")) {
      router.push("/dashboard")
      return
    }

    setIsAdmin(true)
    loadData()
  }

  const loadData = async () => {
    const supabase = createClient()

    // Load all profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    setProfiles(profilesData || [])

    // Load all product members with user and product info
    const { data: membersData } = await supabase
      .from("product_members")
      .select(`
        id,
        role,
        created_at,
        user:profiles!product_members_user_id_fkey(username, name),
        product:products(name, slug)
      `)
      .order("created_at", { ascending: false })

    if (membersData) {
      setProductMembers(membersData.map(m => ({
        ...m,
        user: m.user as unknown as { username: string; name: string },
        product: m.product as unknown as { name: string; slug: string }
      })))
    }

    setIsLoading(false)
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Delete this profile? This will also delete all their products.")) return

    const supabase = createClient()
    await supabase.from("profiles").delete().eq("id", profileId)
    loadData()
  }

  const handleDeleteProductMember = async (memberId: string) => {
    if (!confirm("Remove this product claim?")) return

    const supabase = createClient()
    await supabase.from("impact_metrics").delete().eq("product_member_id", memberId)
    await supabase.from("product_members").delete().eq("id", memberId)
    loadData()
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-lg">
            us.string.sg
          </Link>
          <Link
            href="/dashboard"
            className="font-mono text-sm hover:text-accent transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(60)}
            </div>
            <div className="py-3 font-bold">ADMIN PANEL</div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(60)}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 font-mono text-sm">
            <button
              onClick={() => setActiveTab("profiles")}
              className={`px-4 py-2 border ${
                activeTab === "profiles" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:bg-secondary bg-transparent"
              } transition-colors`}
            >
              Profiles ({profiles.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 border ${
                activeTab === "products" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:bg-secondary bg-transparent"
              } transition-colors`}
            >
              Product Claims ({productMembers.length})
            </button>
          </div>

          {/* Profiles tab */}
          {activeTab === "profiles" && (
            <div className="font-mono text-sm space-y-2">
              {profiles.length === 0 ? (
                <p className="text-muted-foreground py-4">No profiles yet.</p>
              ) : (
                <div className="border border-border divide-y divide-border">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="p-4 flex items-center justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/${profile.username}`}
                            className="font-medium hover:text-accent transition-colors flex items-center gap-1"
                          >
                            /{profile.username}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          {profile.claimed && (
                            <span className="text-xs text-accent">CLAIMED</span>
                          )}
                        </div>
                        <div className="text-muted-foreground truncate">
                          {profile.name} {profile.tagline && `- ${profile.tagline}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:opacity-80 transition-opacity p-2"
                        aria-label="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products tab */}
          {activeTab === "products" && (
            <div className="font-mono text-sm space-y-2">
              {productMembers.length === 0 ? (
                <p className="text-muted-foreground py-4">No product claims yet.</p>
              ) : (
                <div className="border border-border divide-y divide-border">
                  {productMembers.map((pm) => (
                    <div key={pm.id} className="p-4 flex items-center justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pm.product.name}</span>
                          <span className="text-muted-foreground">by</span>
                          <Link 
                            href={`/${pm.user.username}`}
                            className="text-accent hover:underline"
                          >
                            @{pm.user.username}
                          </Link>
                        </div>
                        <div className="text-muted-foreground">
                          Role: {pm.role}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(pm.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProductMember(pm.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:opacity-80 transition-opacity p-2"
                        aria-label="Remove product claim"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(60)}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
