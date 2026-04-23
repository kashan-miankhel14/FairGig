'use client'

import { Search, Bell, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

interface NavbarProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  searchPlaceholder?: string
}

export function Navbar({ title, subtitle, showSearch = true, searchPlaceholder = 'Search...' }: NavbarProps) {
  const { user, logout } = useAuth()

  return (
    <div className="h-16 bg-background border-b border-border sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-8 ml-56">
        {/* Left — Title */}
        {title && (
          <div className="flex-1">
            {subtitle && <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{subtitle}</p>}
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        )}

        {/* Right — Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 gap-2 w-64 transition-all hover:shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
          )}

          <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* User avatar + name */}
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 hover:bg-secondary rounded-full px-2 py-1 transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              {user && (
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-foreground leading-none">{user.full_name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              )}
            </Link>
            {user && (
              <button
                onClick={logout}
                title="Logout"
                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
