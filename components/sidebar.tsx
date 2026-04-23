'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Clock, Shield, AlertCircle, BookOpen, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string) => pathname.startsWith(href)

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD', icon: LayoutGrid, roles: ['worker', 'verifier', 'advocate'] },
    { href: '/shift-logs', label: 'SHIFT LOGS', icon: Clock, roles: ['worker'] },
    { href: '/verifications', label: 'CERTIFICATES', icon: Shield, roles: ['worker', 'verifier'] },
    { href: '/grievance', label: 'SHIKAYAT BOARD', icon: AlertCircle, roles: ['worker', 'verifier', 'advocate'] },
    { href: '/advocate', label: 'ANALYTICS', icon: BarChart3, roles: ['advocate', 'verifier'] },
    { href: '/resources', label: 'RESOURCES', icon: BookOpen, roles: ['worker', 'verifier', 'advocate'] },
  ]

  const visibleItems = user
    ? navItems.filter(item => item.roles.includes(user.role))
    : navItems

  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col fixed left-0 top-0 pt-6">
      {/* Logo */}
      <Link href="/" className="px-6 pb-8 block">
        <div className="space-y-1">
          <div className="font-bold text-sm text-sidebar-primary">FairGig 🇵🇰</div>
          <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wide">Advocacy Platform</div>
        </div>
      </Link>

      {/* User Info */}
      {user && (
        <div className="px-4 mb-4">
          <div className="bg-sidebar-accent/50 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-sidebar-primary truncate">{user.full_name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role} · {user.city || 'Pakistan'}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative group ${
                active
                  ? 'text-sidebar-primary bg-sidebar-accent shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs uppercase tracking-wide truncate">{item.label}</span>
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* File Grievance Button */}
      <div className="px-3 pb-6">
        <Link href="/grievance">
          <button className="w-full bg-sidebar-primary text-sidebar-primary-foreground py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <AlertCircle className="w-5 h-5" />
            SHIKAYAT KAREIN
          </button>
        </Link>
      </div>
    </div>
  )
}
