'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary">FairGig</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Advocacy Platform</p>
          </Link>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="border-t border-border pt-5 space-y-3">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wide font-semibold">
              Demo Accounts (password: password123)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { email: 'worker@fairgig.com', role: 'Worker', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { email: 'verifier@fairgig.com', role: 'Verifier', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { email: 'advocate@fairgig.com', role: 'Advocate', color: 'bg-green-50 text-green-700 border-green-200' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123') }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${acc.color}`}
                >
                  <span className="font-bold">{acc.role}</span>
                  <span className="ml-2 opacity-75">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
