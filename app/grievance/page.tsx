'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, MessageSquare, ThumbsUp, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

const PLATFORMS = ['Foodpanda', 'Careem', 'Daraz', 'Bykea', 'JazzCash Rides', 'Upwork', 'Fiverr', 'InDrive', 'Other']
const CATEGORIES = ['deactivation', 'payment', 'commission', 'safety', 'vehicle', 'tip_baiting', 'general']
const SEVERITIES = ['low', 'medium', 'high', 'critical']

interface Grievance {
  id: string
  worker_id: string
  platform: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  likes_count: number
  comments_count: number
  created_at: string
  full_name?: string
  city?: string
}

const statusColor = (s: string) => {
  if (s === 'resolved') return 'bg-green-100 text-green-700'
  if (s === 'escalated') return 'bg-red-100 text-red-700'
  if (s === 'in_review') return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    open: 'OPEN', in_review: 'JAARI HAI', resolved: 'RESOLVED',
    escalated: 'ESCALATED', closed: 'CLOSED',
  }
  return map[s] || s.toUpperCase()
}

export default function GrievanceBoard() {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [liking, setLiking] = useState<string | null>(null)
  const [form, setForm] = useState({
    platform: 'Foodpanda',
    title: '',
    description: '',
    category: 'general',
    severity: 'medium',
  })
  const [submitError, setSubmitError] = useState('')

  const fetchGrievances = async () => {
    setLoading(true)
    try {
      // Try grievance service first
      const resp = await fetch('http://localhost:8004/grievances?limit=30')
      if (resp.ok) {
        const data = await resp.json()
        setGrievances(data)
        setLoading(false)
        return
      }
    } catch {}

    // Fallback: Supabase direct
    const { data } = await supabase
      .from('grievances')
      .select('*, users(full_name, city)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) {
      setGrievances(data.map((g: any) => ({
        ...g,
        full_name: g.users?.full_name,
        city: g.users?.city,
      })))
    }
    setLoading(false)
  }

  useEffect(() => { fetchGrievances() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const resp = await fetch('http://localhost:8004/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: user.id, ...form }),
      })
      if (!resp.ok) throw new Error('Service error')
    } catch {
      // Fallback: Supabase direct
      const { error } = await supabase.from('grievances').insert({
        worker_id: user.id,
        platform: form.platform,
        title: form.title,
        description: form.description,
        category: form.category,
        severity: form.severity,
        status: 'open',
        likes_count: 0,
        comments_count: 0,
      })
      if (error) { setSubmitError(error.message); setSubmitting(false); return }
    }

    setSubmitting(false)
    setShowModal(false)
    setForm({ platform: 'Foodpanda', title: '', description: '', category: 'general', severity: 'medium' })
    fetchGrievances()
  }

  const handleLike = async (id: string) => {
    setLiking(id)
    try {
      await fetch(`http://localhost:8004/grievances/${id}/like`, { method: 'POST' })
    } catch {
      await supabase.rpc('increment_likes', { grievance_id: id }).catch(() =>
        supabase.from('grievances').update({ likes_count: (grievances.find(g => g.id === id)?.likes_count || 0) + 1 }).eq('id', id)
      )
    }
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, likes_count: g.likes_count + 1 } : g))
    setLiking(null)
  }

  const filtered = grievances.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'ACTIVE CASES', value: grievances.filter(g => g.status !== 'resolved' && g.status !== 'closed').length.toString() },
    { label: 'RESOLUTION RATE', value: grievances.length > 0 ? `${Math.round(grievances.filter(g => g.status === 'resolved').length / grievances.length * 100)}%` : '0%' },
    { label: 'TOTAL GRIEVANCES', value: grievances.length.toString() },
  ]

  return (
    <AppLayout navbarTitle="Shikayat Board" showSearch={true} searchPlaceholder="Shikayat ya keywords talash karein...">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Shikayat <span className="text-primary">Board</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Pakistani gig workers ka ek muttahida platform — tajarbat share karein, insaaf maangein, aur collective advocacy se mazboot banein.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex items-center bg-secondary rounded-lg px-4 gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Shikayat ya keywords talash karein..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-3"
            />
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => setShowModal(true)}>
            + Nai Shikayat
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {loading ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading grievances...
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Koi shikayat nahi mili. Pehli shikayat darj karein!
              </Card>
            ) : filtered.map((grievance) => (
              <Card key={grievance.id} className="p-6 border-l-4 border-primary">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded text-xs font-bold flex items-center justify-center text-foreground">
                        {grievance.platform[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">{grievance.platform.toUpperCase()}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${statusColor(grievance.status)}`}>
                          {statusLabel(grievance.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(grievance.created_at).toLocaleDateString('en-PK')}
                      </p>
                      {grievance.full_name && (
                        <p className="text-xs text-muted-foreground">{grievance.full_name} · {grievance.city}</p>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{grievance.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{grievance.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <button
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleLike(grievance.id)}
                        disabled={liking === grievance.id}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-semibold">{grievance.likes_count}</span>
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-semibold">{grievance.comments_count} Comments</span>
                      </button>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      grievance.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      grievance.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      grievance.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{grievance.severity.toUpperCase()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Fori Madad</h3>
              <p className="text-sm text-muted-foreground">Legal advocacy ya moderators se rabta karein.</p>
            </div>
            <div className="space-y-3">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Legal Aid Helpline</p>
                    <p className="text-xs text-muted-foreground mt-1">24/7 DASTIYAB</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Moderator Chat</p>
                    <p className="text-xs text-muted-foreground mt-1">WAIT TIME: 5 MINUTE</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Templates & Forms</p>
                    <p className="text-xs text-muted-foreground mt-1">32 DOWNLOAD KE LIYE TAYYAR</p>
                  </div>
                </div>
              </Card>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowModal(true)}>
                Nai Shikayat Darj Karein
              </Button>
            </div>

            <Card className="p-4 bg-secondary">
              <h4 className="font-bold text-foreground text-sm mb-3">TRENDING TAGS</h4>
              <div className="flex gap-2 flex-wrap">
                {['#InsaafKaro', '#Deactivation', '#AppGlitch', '#Workers', '#CommissionHike'].map(tag => (
                  <button
                    key={tag}
                    className="px-2 py-1 bg-background rounded text-xs font-semibold text-primary hover:bg-background/50 transition-colors"
                    onClick={() => setSearchQuery(tag.replace('#', ''))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ============ NEW GRIEVANCE MODAL ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Nai Shikayat Darj Karein</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Shikayat darj karne ke liye login karein.
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{submitError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Masla ka mukhtasar bayan..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Tafseel (Description)</label>
                <textarea
                  rows={4}
                  placeholder="Pura masla bataein — kya hua, kab hua, kya nuqsan hua..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Radd Karein
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={submitting || !user}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Darj Karein'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
