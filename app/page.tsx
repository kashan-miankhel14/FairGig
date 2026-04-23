'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, BarChart3, Shield, Users, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LandingPage() {
  const { user } = useAuth()
  const ctaHref = user ? '/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">FairGig</div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground">Features</a>
            <a href="#why" className="text-foreground/70 hover:text-foreground">Why FairGig</a>
            {user && <Link href="/dashboard" className="text-foreground/70 hover:text-foreground">Dashboard</Link>}
          </div>
          <Link href={ctaHref}>
            <Button className="rounded-full">{user ? 'Go to Dashboard' : 'Get Started'}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-primary font-semibold text-sm mb-2">EMPOWERING GIG WORKERS</p>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Your earnings,<br />verified and protected
                </h1>
                <p className="text-xl text-foreground/70 mt-6 leading-relaxed">
                  FairGig gives gig workers across Pakistan a unified platform to log, verify, and understand their earnings across all platforms. Know your true income. Track platform fairness. Build collective power.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={ctaHref}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Logging Earnings <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                <div>
                  <p className="text-2xl font-bold text-primary">8,000+</p>
                  <p className="text-xs text-foreground/60 mt-1">Gig Workers Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">Rs 200M+</p>
                  <p className="text-xs text-foreground/60 mt-1">Earnings Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">150+</p>
                  <p className="text-xs text-foreground/60 mt-1">Grievances Resolved</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/fairgig-hero.jpg"
                alt="Diverse gig workers in Pakistan"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-secondary/50 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Real Problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-semibold text-foreground mb-2">No Unified Record</p>
              <p className="text-foreground/70">Riders earn from Foodpanda, Daraz, Careem, Uber - but have no single proof of income for landlords or banks.</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-semibold text-foreground mb-2">Invisible Exploitation</p>
              <p className="text-foreground/70">When Foodpanda raises commissions from 15% to 25% overnight, workers don&apos;t know if it&apos;s company-wide unfairness or account-specific.</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <p className="font-semibold text-foreground mb-2">No Community Voice</p>
              <p className="text-foreground/70">Account deactivations, tip theft, and wage theft happen in isolation. No platform to surface patterns or collectively advocate.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How FairGig Works</h2>
            <p className="text-xl text-foreground/70">Built for gig workers, by gig worker advocates</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Log Every Shift</h3>
                </div>
                <p className="text-foreground/70 text-lg">
                  Record platform, date, hours worked, gross earnings, and deductions. Supports bulk CSV import for multiple shifts at once. Your data, your record.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Works with Foodpanda, Daraz, Careem, Uber, freelance platforms, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">CSV import for quick bulk entry</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Automatic calculation of net earnings and effective hourly rate</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/earnings-logger-illustration.jpg"
                alt="FairGig Earnings Logger"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative rounded-xl overflow-hidden shadow-xl order-2 md:order-1">
              <Image
                src="/verification-illustration.jpg"
                alt="FairGig Verification"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Verified Income</h3>
                </div>
                <p className="text-foreground/70 text-lg">
                  Upload platform earnings screenshots. Our verifiers check them against your claims. Verified earnings get a badge for landlords and banks.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Quick verification by trained advocates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Transparent flagging if discrepancies are found</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Privacy-protected - screenshots never shared publicly</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Community Voice</h3>
                </div>
                <p className="text-foreground/70 text-lg">
                  Post complaints anonymously. See what&apos;s happening across your platform, city, and category. When patterns emerge, labour advocates act.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Anonymous bulletin board for workers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Advocates tag, cluster, and escalate systemic issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/70">Resolution tracking - see when grievances are resolved</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/community-grievance-illustration.jpg"
                alt="FairGig Grievance Board"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="why" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Real Earnings. Real Patterns.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4">
              <BarChart3 className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">City-Wide Insights</h3>
              <p className="text-foreground/70">
                See the real median hourly rate for Foodpanda riders in Lahore. Know if you&apos;re below, at, or above the city average. Data from verified shifts.
              </p>
            </Card>
            <Card className="p-8 space-y-4">
              <TrendingUp className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Anomaly Detection</h3>
              <p className="text-foreground/70">
                Sudden income drop? Unusual commission spike? Our system flags statistical outliers and explains what might be happening.
              </p>
            </Card>
            <Card className="p-8 space-y-4">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Print-Ready Certificates</h3>
              <p className="text-foreground/70">
                Generate professional income certificates for banks, landlords, loan applications. Verified earnings only. No speculation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            You deserve transparency.<br />Not algorithms that hide.
          </h2>
          <p className="text-xl text-foreground/70">
            FairGig is built by labour advocates, engineers, and economists who believe gig workers have the right to know their own earnings and organize together.
          </p>
          <Link href={ctaHref}>
            <Button size="lg">
              {user ? 'Go to Dashboard' : 'Start Free Today'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-foreground mb-4">FairGig</p>
              <p className="text-foreground/70 text-sm">Empowering gig workers across Pakistan</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-4">Platform</p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/shift-logs" className="hover:text-foreground">Earnings Logger</Link></li>
                <li><Link href="/grievance" className="hover:text-foreground">Grievance Board</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-4">Account</p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
                <li><Link href="/profile" className="hover:text-foreground">Profile</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2024 FairGig. Empowering gig workers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
