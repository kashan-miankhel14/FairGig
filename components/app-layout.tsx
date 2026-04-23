'use client'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'

interface AppLayoutProps {
  children: React.ReactNode
  navbarTitle?: string
  navbarSubtitle?: string
  showSearch?: boolean
  searchPlaceholder?: string
}

export function AppLayout({ children, navbarTitle, navbarSubtitle, showSearch = true, searchPlaceholder }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-56">
        {navbarTitle && <Navbar title={navbarTitle} subtitle={navbarSubtitle} showSearch={showSearch} searchPlaceholder={searchPlaceholder} />}
        <main className="p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
