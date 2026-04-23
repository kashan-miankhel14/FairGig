'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { AlertTriangle, TrendingDown, Users, Shield, MapPin, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

// Fallback static data
const FALLBACK_COMMISSION = [
  { month: 'May', foodpanda: 15, careem: 20, daraz: 12 },
  { month: 'Jun', foodpanda: 17, careem: 20, daraz: 14 },
  { month: 'Jul', foodpanda: 18, careem: 22, daraz: 14 },
  { month: 'Aug', foodpanda: 20, careem: 22, daraz: 16 },
  { month: 'Sep', foodpanda: 23, careem: 25, daraz: 18 },
  { month: 'Oct', foodpanda: 25, careem: 25, daraz: 18 },
]

const FALLBACK_CITY = [
  { city: 'Karachi', median: 42000, avg: 38500 },
  { city: 'Lahore', median: 38000, avg: 35200 },
  { city: 'Islamabad', median: 45000, avg: 41000 },
  { city: 'Rawalpindi', median: 32000, avg: 29800 },
  { city: 'Faisalabad', median: 28000, avg: 26400 },
  { city: 'Peshawar', median: 25000, avg: 23100 },
]

const GRIEVANCE_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280']

export default function AdvocatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [kpis, setKpis] = useState<any>(null)
  const [cityData, setCityData] = useState<any[]>(FALLBACK_CITY)
  const [commissionData, setCommissionData] = useState<any[]>(FALLBACK_COMMISSION)
  const [grievanceStats, setGrievanceStats] = useState<any[]>([])
  const [vulnerableWorkers, setVulnerableWorkers] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (user && user.role !== 'advocate' && user.role !== 'verifier') {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchAll = async () => {
      setDataLoading(true)

      // Try analytics service
      try {
        const [kpiResp, cityResp, commResp, grievResp, vulnResp] = await Promise.allSettled([
          fetch('http://localhost:8005/analytics/kpis').then(r => r.json()),
          fetch('http://localhost:8005/analytics/city-medians').then(r => r.json()),
          fetch('http://localhost:8005/analytics/commission-trends').then(r => r.json()),
          fetch('http://localhost:8005/analytics/grievance-stats').then(r => r.json()),
          fetch('http://localhost:8005/analytics/vulnerable-workers').then(r => r.json()),
        ])

        if (kpiResp.status === 'fulfilled') setKpis(kpiResp.value)
        if (cityResp.status === 'fulfilled' && cityResp.value?.length) setCityData(cityResp.value)
        if (commResp.status === 'fulfilled' && commResp.value?.length) setCommissionData(commResp.value)
        if (grievResp.status === 'fulfilled') setGrievanceStats(grievResp.value)
        if (vulnResp.status === 'fulfilled') setVulnerableWorkers(vulnResp.value)
      } catch {}

      // Always fetch live counts from Supabase as fallback
      const [{ count: grievCount }, { count: workerCount }, { count: flagCount }] = await Promise.all([
        supabase.from('grievances').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'worker'),
        supabase.from('anomaly_flags').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ])

      if (!kpis) {
        setKpis({
          worker_count: workerCount || 0,
          open_grievances: grievCount || 0,
          vulnerability_flags: flagCount || 0,
          resolution_rate: 78,
        })
      }

      // Fetch vulnerable workers from Supabase if service didn't return any
      if (vulnerableWorkers.length === 0) {
        const { data: flags } = await supabase
          .from('anomaly_flags')
          .select('*, users(full_name, city, email)')
          .eq('status', 'open')
          .in('severity', ['high', 'critical'])
          .limit(10)
        if (flags) setVulnerableWorkers(flags.map((f: any) => ({ ...f, full_name: f.users?.full_name, city: f.users?.city })))
      }

      // Build grievance category pie from Supabase
      if (grievanceStats.length === 0) {
        const { data: grievances } = await supabase
          .from('grievances')
          .select('category, severity, status')
        if (grievances) {
          const catMap: Record<string, number> = {}
          grievances.forEach((g: any) => {
            const cat = g.category || 'general'
            catMap[cat] = (catMap[cat] || 0) + 1
          })
          const total = Object.values(catMap).reduce((a, b) => a + b, 0)
          setGrievanceStats(
            Object.entries(catMap).map(([name, count], i) => ({
              name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
              value: total > 0 ? Math.round(count / total * 100) : 0,
              color: GRIEVANCE_COLORS[i % GRIEVANCE_COLORS.length],
            }))
          )
        }
      }

      setDataLoading(false)
    }
    fetchAll()
  }, [user])

  if (loading || !user) return null

  const workerCount = kpis?.worker_count || 0
  const openGrievances = kpis?.open_grievances || 0
  const vulnFlags = kpis?.vulnerability_flags || vulnerableWorkers.length
  const resolutionRate = kpis?.resolution_rate || 78

  return (
    <AppLayout navbarTitle="Advocate Analytics" navbarSubtitle="AGGREGATED INSIGHTS" searchPlaceholder="Workers ya platforms talash karein...">
      <div className="space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-green-600">Active</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Workers</p>
              <p className="text-3xl font-bold text-foreground">{dataLoading ? '...' : workerCount}</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-xs font-semibold text-red-600">Urgent</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Open Grievances</p>
              <p className="text-3xl font-bold text-foreground">{dataLoading ? '...' : openGrievances}</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <TrendingDown className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600">⚠️ Flag</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Vulnerability Flags</p>
              <p className="text-3xl font-bold text-foreground">{dataLoading ? '...' : vulnFlags}</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Resolution Rate</p>
              <p className="text-3xl font-bold text-foreground">{dataLoading ? '...' : `${resolutionRate}%`}</p>
            </div>
          </Card>
        </div>

        {/* Commission Rate Trends */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">📈 Platform Commission Trends</h2>
            <p className="text-sm text-muted-foreground">Maahi commission rates across major Pakistani platforms (%)</p>
          </div>
          <Card className="p-6">
            {dataLoading ? (
              <div className="h-[300px] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={commissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    formatter={(v: any) => [`${v}%`]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="foodpanda" name="Foodpanda" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="careem" name="Careem" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="daraz" name="Daraz" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* City Income + Grievance Categories */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">🏙️ Shahar Waari Income Distribution</h2>
              <p className="text-sm text-muted-foreground">Monthly median income by city zone (PKR)</p>
            </div>
            <Card className="p-6">
              {dataLoading ? (
                <div className="h-[280px] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={cityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="city" type="category" stroke="var(--color-muted-foreground)" width={70} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      formatter={(v: any) => [`PKR ${Number(v).toLocaleString()}`]}
                    />
                    <Legend />
                    <Bar dataKey="median" name="Median" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avg" name="Average" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">📊 Top Complaint Categories</h2>
              <p className="text-sm text-muted-foreground">Is hafte ki top grievance categories</p>
            </div>
            <Card className="p-6">
              {dataLoading || grievanceStats.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  {dataLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Koi grievance data nahi'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={grievanceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {grievanceStats.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color || GRIEVANCE_COLORS[index % GRIEVANCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </div>

        {/* Vulnerability Flag Table */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Vulnerability Flags — High Severity
            </h2>
            <p className="text-sm text-muted-foreground">Yeh workers anomaly detection mein flag hue hain — fori attention chahiye</p>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    {['Worker', 'Shehar', 'Flag Type', 'Severity', 'Description', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dataLoading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : vulnerableWorkers.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Koi vulnerability flags nahi hain.</td></tr>
                  ) : vulnerableWorkers.map((worker: any, idx: number) => (
                    <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {(worker.full_name || 'W').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium text-sm text-foreground">{worker.full_name || 'Worker'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" />{worker.city || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{(worker.flag_type || '').replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          worker.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          worker.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{(worker.severity || '').toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{worker.description}</td>
                      <td className="px-4 py-3">
                        <button className="text-xs font-semibold text-primary hover:underline">Review Karein</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Platform Rate Intelligence */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">⚡ Rate Intelligence — This Week</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { platform: 'Foodpanda', icon: '🍔', change: '+3%', color: 'text-red-600', bg: 'bg-red-50 border-red-200', detail: 'Lahore zone mein commission 22% se 25% ho gayi' },
              { platform: 'Careem', icon: '🚗', change: '0%', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', detail: 'Koi tabdili nahi — stable' },
              { platform: 'Daraz', icon: '📦', change: '+2%', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', detail: 'Karachi South zone mein hike — riders preshaan' },
            ].map((item) => (
              <Card key={item.platform} className={`p-4 border ${item.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-foreground">{item.platform}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>{item.change}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
