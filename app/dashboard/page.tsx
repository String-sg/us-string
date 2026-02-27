"use client"

import React from "react"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Plus, ExternalLink, Trash2, LogOut } from "lucide-react"

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
}

interface ProductMember {
  id: string
  role: string
  product: Product
  impact_metrics: ImpactMetric[]
}

interface Profile {
  id: string
  username: string
  name: string
  tagline?: string
  avatar_url?: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [productMembers, setProductMembers] = useState<ProductMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", slug: "", description: "", role: "" })
  const [newMetrics, setNewMetrics] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    const profileResponse = await fetch(`/api/profiles?userId=${user.id}`)
    const { profile: profileData } = await profileResponse.json()

    if (!profileData?.username) {
      router.push("/claim")
      return
    }

    setProfile(profileData)

    const membersResponse = await fetch(`/api/product-members?userId=${user.id}`)
    const { productMembers: memberData } = await membersResponse.json()

    if (memberData) {
      setProductMembers(memberData)
    }

    setIsLoading(false)
  }

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    if (!profile) return

    setIsSaving(true)

    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.id,
        ...updates,
      }),
    })

    const result = await response.json()
    if (!result.error) {
      setProfile({ ...profile, ...updates })
    }
    setIsSaving(false)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newProduct.name || !newProduct.role) return

    setIsSaving(true)

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProduct.name,
        description: newProduct.description,
        role: newProduct.role,
        userId: user.id,
        metrics: newMetrics,
      }),
    })

    const result = await response.json()
    if (result.error) {
      console.error('Failed to add product:', result.error)
    }

    // Reset form and reload
    setNewProduct({ name: "", slug: "", description: "", role: "" })
    setNewMetrics([])
    setShowAddProduct(false)
    setIsSaving(false)
    loadData()
  }

  const handleDeleteProduct = async (memberId: string) => {
    if (!confirm("Remove this product from your profile?")) return

    await fetch(`/api/products?memberId=${memberId}`, {
      method: 'DELETE',
    })

    loadData()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono font-bold text-lg">
            us.string.sg
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/${profile.username}`}
              className="font-mono text-sm hover:text-accent transition-colors flex items-center gap-1"
            >
              View profile
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleSignOut}
              className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile section */}
          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(50)}
            </div>
            <div className="py-3 font-bold">EDIT PROFILE</div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(50)}
            </div>

            <div className="py-6 space-y-4">
              <div className="flex gap-4 items-center">
                <span className="text-muted-foreground w-24 shrink-0">URL</span>
                <span className="text-accent">us.string.sg/{profile.username}</span>
              </div>

              <div className="flex gap-4 items-center">
                <label className="text-muted-foreground w-24 shrink-0">NAME</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  onBlur={() => handleProfileUpdate({ name: profile.name })}
                  className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="text-muted-foreground w-24 shrink-0">TAGLINE</label>
                <input
                  type="text"
                  value={profile.tagline || ""}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  onBlur={() => handleProfileUpdate({ tagline: profile.tagline })}
                  placeholder="ships things in sg"
                  className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="text-muted-foreground w-24 shrink-0">LINKEDIN</label>
                <input
                  type="url"
                  value={profile.linkedin_url || ""}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  onBlur={() => handleProfileUpdate({ linkedin_url: profile.linkedin_url })}
                  placeholder="https://linkedin.com/in/..."
                  className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="text-muted-foreground w-24 shrink-0">GITHUB</label>
                <input
                  type="url"
                  value={profile.github_url || ""}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  onBlur={() => handleProfileUpdate({ github_url: profile.github_url })}
                  placeholder="https://github.com/..."
                  className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="text-muted-foreground w-24 shrink-0">WEBSITE</label>
                <input
                  type="url"
                  value={profile.website_url || ""}
                  onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                  onBlur={() => handleProfileUpdate({ website_url: profile.website_url })}
                  placeholder="https://..."
                  className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                />
              </div>

              {isSaving && (
                <div className="text-xs text-muted-foreground">Saving...</div>
              )}
            </div>
          </div>

          {/* Products section */}
          <div className="font-mono text-sm">
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(50)}
            </div>
            <div className="py-3 font-bold flex items-center justify-between">
              <span>PRODUCTS SHIPPED</span>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1 text-accent hover:opacity-80 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"─".repeat(50)}
            </div>

            <div className="py-6 space-y-4">
              {productMembers.length === 0 && !showAddProduct && (
                <p className="text-muted-foreground text-center py-4">
                  No products yet. Add your first one!
                </p>
              )}

              {productMembers.map((pm, index) => (
                <div key={pm.id} className="group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <span className="font-medium">{pm.product.name}</span>
                      </div>
                      <div className="ml-8 space-y-0.5 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="opacity-50">└─</span>
                          <span>{pm.role}</span>
                        </div>
                        {pm.impact_metrics.map((metric) => (
                          <div key={metric.id} className="flex items-center gap-1">
                            <span className="opacity-50">└─</span>
                            <span className="text-foreground">{metric.value}</span>
                            <span>{metric.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(pm.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:opacity-80 transition-opacity p-1"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add product form */}
              {showAddProduct && (
                <form onSubmit={handleAddProduct} className="border border-border p-4 space-y-4">
                  <div className="font-bold">Add Product</div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-4 items-center">
                      <label className="text-muted-foreground w-20 shrink-0">NAME</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="FormSG"
                        className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                        required
                      />
                    </div>

                    <div className="flex gap-4 items-center">
                      <label className="text-muted-foreground w-20 shrink-0">ROLE</label>
                      <input
                        type="text"
                        value={newProduct.role}
                        onChange={(e) => setNewProduct({ ...newProduct, role: e.target.value })}
                        placeholder="Engineer"
                        className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                        required
                      />
                    </div>

                    <div className="flex gap-4 items-center">
                      <label className="text-muted-foreground w-20 shrink-0">DESC</label>
                      <input
                        type="text"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Form builder for government"
                        className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">IMPACT METRICS</span>
                        <button
                          type="button"
                          onClick={() => setNewMetrics([...newMetrics, { label: "", value: "" }])}
                          className="text-accent text-xs"
                        >
                          + Add metric
                        </button>
                      </div>
                      {newMetrics.map((metric, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={metric.value}
                            onChange={(e) => {
                              const updated = [...newMetrics]
                              updated[i].value = e.target.value
                              setNewMetrics(updated)
                            }}
                            placeholder="26/26"
                            className="w-20 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                          />
                          <input
                            type="text"
                            value={metric.label}
                            onChange={(e) => {
                              const updated = [...newMetrics]
                              updated[i].label = e.target.value
                              setNewMetrics(updated)
                            }}
                            placeholder="public health orgs"
                            className="flex-1 bg-transparent border-b border-border focus:border-foreground outline-none py-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSaving ? "Adding..." : "Add Product"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false)
                        setNewProduct({ name: "", slug: "", description: "", role: "" })
                        setNewMetrics([])
                      }}
                      className="px-4 py-2 border border-border hover:bg-secondary transition-colors bg-transparent"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="text-muted-foreground select-none" aria-hidden="true">
              {"▀".repeat(50)}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
