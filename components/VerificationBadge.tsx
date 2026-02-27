"use client"

import { CheckCircle } from "lucide-react"

interface VerificationBadgeProps {
  isVerified: boolean
  className?: string
}

export function VerificationBadge({ isVerified, className = "" }: VerificationBadgeProps) {
  if (!isVerified) return null

  return (
    <div className={`inline-flex items-center gap-1 text-xs text-green-600 ${className}`} title="Verified MOE account">
      <CheckCircle className="w-3 h-3" />
      <span>Verified</span>
    </div>
  )
}