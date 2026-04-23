'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Upload, Plus, Zap, MapPin, Clock, Banknote, Camera, AlertTriangle, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

const PLATFORMS = ['Foodpanda', 'Careem', 'Daraz', 'Bykea', 'JazzCash Rides', 'Upwork', 'Fiverr', 'InDrive']

const PLATFORM_ICONS: Record<string, string> = {
  Foodpanda: '🍔', Careem: '🚗', Daraz: '📦', Bykea: '🛵',
  'JazzCash Rides': '💳', Upwork: '💻', Fiverr: '⭐', InDrive: '🚕',
}

interface Shift {
  id: string
  platform: string
  shift_date: string
  duration_hours: number
  gross_earnings: number
  net_earnings: number
  platform_fees: number
  status: string
  city?: string
}

interface LogForm {
  platform: string
  shift_date: string
  start_time: string
  end_time: string
  duration_hours: string
  gross_earnings: string
  platform_fees: string
  city: string
  notes: string
}

const emptyForm: LogForm = {
  platform: 'Foodpanda',
  shift_date: new Date().toISOString().split('T')[0],
  start_time: '09:00',
  end_time: '13:00',
  duration_hours: '4',
  gross_earnings: '',
  platform_fees: '',
  city: '',
  notes: '',
}

export default function ShiftLogs() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<LogForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvResult, setCsvResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchShifts = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('shifts')
      .select('*')
      .eq('worker_id', user.id)
      .order('shift_date', { ascending: false })
      .limit(50)
    setShifts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchShifts() }, [user])

  // Compute stats
  const totalGross = shifts.reduce((s, x) => s + Number(x.gross_earnings), 0)
  const totalHours = shifts.reduce((s, x) => s + Number(x.duration_hours), 0)
  const avgHourly = totalHours > 0 ? shifts.reduce((s, x) => s + Number(x.net_earnings), 0) / totalHours : 0

  // Weekly chart data from real shifts
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const dayShifts = shifts.filter(s => new Date(s.shift_date).getDay() === (i + 1) % 7)
    return { month: day, value: dayShifts.reduce((sum, s) => sum + Number(s.net_earnings), 0) }
  })

  // Monthly chart (last 5 months)
  const monthlyData = Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (4 - i))
    const monthStr = d.toLocaleString('default', { month: 'short' })
    const monthShifts = shifts.filter(s => {
      const sd = new Date(s.shift_date)
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear()
    })
    return { month: monthStr, value: monthShifts.reduce((sum, s) => sum + Number(s.net_earnings), 0) }
  })

  const handleFormChange = (field: keyof LogForm, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-calculate duration from times
      if (field === 'start_time' || field === 'end_time') {
        const [sh, sm] = (field === 'start_time' ? value : prev.start_time).split(':').map(Number)
        const [eh, em] = (field === 'end_time' ? value : prev.end_time).split(':').map(Number)
        const diff = (eh * 60 + em - sh * 60 - sm) / 60
        if (diff > 0) updated.duration_hours = diff.toFixed(2)
      }
      // Auto-calculate fees (10% default)
      if (field === 'gross_earnings' && value) {
        updated.platform_fees = (parseFloat(value) * 0.10).toFixed(0)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setSubmitError('')

    const net = parseFloat(form.gross_earnings) - parseFloat(form.platform_fees || '0')

    // Try earnings microservice first, fall back to Supabase direct
    try {
      const resp = await fetch(`http://localhost:8002/shifts?worker_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: form.platform,
          shift_date: form.shift_date,
          start_time: form.start_time + ':00',
          end_time: form.end_time + ':00',
          duration_hours: parseFloat(form.duration_hours),
          gross_earnings: parseFloat(form.gross_earnings),
          platform_fees: parseFloat(form.platform_fees || '0'),
          net_earnings: net,
          city: form.city || user.city || '',
          notes: form.notes,
        }),
      })
      if (!resp.ok) throw new Error('Service error')
    } catch {
      // Fallback: insert directly via Supabase
      const { error } = await supabase.from('shifts').insert({
        worker_id: user.id,
        platform: form.platform,
        shift_date: form.shift_date,
        start_time: form.start_time + ':00',
        end_time: form.end_time + ':00',
        duration_hours: parseFloat(form.duration_hours),
        gross_earnings: parseFloat(form.gross_earnings),
        platform_fees: parseFloat(form.platform_fees || '0'),
        net_earnings: net,
        city: form.city || user.city || '',
        notes: form.notes,
        status: 'logged',
      })
      if (error) { setSubmitError(error.message); setSubmitting(false); return }
    }

    setSubmitting(false)
    setShowModal(false)
    setForm(emptyForm)
    fetchShifts()
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setCsvUploading(true)
    setCsvResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch(`http://localhost:8002/csv-import?worker_id=${user.id}`, {
        method: 'POST',
        body: formData,
      })
      if (resp.ok) {
        const data = await resp.json()
        setCsvResult(`✅ Imported ${data.successfully_imported} shifts (${data.failed_rows} failed)`)
        fetchShifts()
      } else {
        setCsvResult('❌ Import failed. Check CSV format.')
      }
    } catch {
      setCsvResult('❌ Earnings service not running. Start backend first.')
    }
    setCsvUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <AppLayout navbarTitle="Kamaai Logger" navbarSubtitle="SHIFT LOGS" searchPlaceholder="Logs mein talash karein...">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Apni shifts track karein, puri kamaai paiye, aur digital saboot mehfooz rakhein.
          </p>
          <div className="flex gap-3 mt-4">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={() => fileInputRef.current?.click()}
              disabled={csvUploading}
            >
              {csvUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              CSV Upload
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nai Entry
            </Button>
          </div>
          {csvResult && (
            <p className="text-sm mt-2 font-medium">{csvResult}</p>
          )}
        </div>

        {/* Chart + Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Maahi Kamaai</p>
              <h3 className="text-3xl font-bold text-foreground">Monthly Earnings</h3>
            </div>
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    formatter={(v: any) => [`PKR ${Number(v).toLocaleString()}`, 'Net Kamaai']}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-secondary border-0">
              <div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-primary" /></div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Gross</p>
              <p className="text-2xl font-bold text-foreground">PKR {totalGross.toLocaleString()}</p>
            </Card>
            <Card className="p-4 bg-secondary border-0">
              <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-primary" /></div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Kaam Ke Ghantay</p>
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
            </Card>
            <Card className="p-4 bg-secondary border-0">
              <div className="flex items-center gap-2 mb-2"><Banknote className="w-5 h-5 text-primary" /></div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ghantay Ki Amdani</p>
              <p className="text-2xl font-bold text-foreground">PKR {avgHourly.toFixed(0)}/hr</p>
            </Card>

            <Card className="p-4 bg-primary text-primary-foreground">
              <div className="flex items-center justify-between mb-3"><Zap className="w-6 h-6" /></div>
              <h3 className="font-bold text-lg mb-1">Quick Log</h3>
              <p className="text-sm opacity-90 mb-4">Abhi shift darj karein</p>
              <Button
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => setShowModal(true)}
              >
                Shift Darj Karein
              </Button>
            </Card>
          </div>
        </div>

        {/* Earnings History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Kamaai Ka Itihaas</h2>
            <span className="text-sm text-muted-foreground">{shifts.length} shifts</span>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    {['Platform', 'Taareekh', 'Muddat', 'Gross', 'Net', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading shifts...</td></tr>
                  ) : shifts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Koi shift nahi mili. Pehli shift darj karein!</td></tr>
                  ) : shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{PLATFORM_ICONS[s.platform] || '💼'}</span>
                          <span className="font-medium text-foreground">{s.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{new Date(s.shift_date).toLocaleDateString('en-PK')}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{Number(s.duration_hours).toFixed(1)}h</td>
                      <td className="px-6 py-4 text-sm text-foreground">PKR {Number(s.gross_earnings).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">PKR {Number(s.net_earnings).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          s.status === 'verified' ? 'bg-green-100 text-green-700' :
                          s.status === 'logged' ? 'bg-blue-100 text-blue-700' :
                          s.status === 'flagged' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Platforms */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Pakistani Platforms</h3>
          <div className="grid grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <Card
                key={platform}
                className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer hover:border-primary"
                onClick={() => { setForm(f => ({ ...f, platform })); setShowModal(true) }}
              >
                <p className="text-3xl mb-2">{PLATFORM_ICONS[platform] || '💼'}</p>
                <p className="text-xs font-semibold text-foreground">{platform.toUpperCase()}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ============ LOG SHIFT MODAL ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Nai Shift Darj Karein</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Platform */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={e => handleFormChange('platform', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Taareekh (Date)</label>
                <input
                  type="date"
                  value={form.shift_date}
                  onChange={e => handleFormChange('shift_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Shuru (Start)</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => handleFormChange('start_time', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Khatam (End)</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => handleFormChange('end_time', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Muddat (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={form.duration_hours}
                  onChange={e => handleFormChange('duration_hours', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              {/* Earnings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Gross Kamaai (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3500"
                    value={form.gross_earnings}
                    onChange={e => handleFormChange('gross_earnings', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Platform Fees (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="350"
                    value={form.platform_fees}
                    onChange={e => handleFormChange('platform_fees', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Net preview */}
              {form.gross_earnings && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-semibold">
                    Net Kamaai: PKR {(parseFloat(form.gross_earnings || '0') - parseFloat(form.platform_fees || '0')).toLocaleString()}
                  </p>
                </div>
              )}

              {/* City */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Shehar (City)</label>
                <input
                  type="text"
                  placeholder={user?.city || 'Karachi'}
                  value={form.city}
                  onChange={e => handleFormChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Koi khaas baat..."
                  value={form.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Radd Karein
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Shift Darj Karein'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
