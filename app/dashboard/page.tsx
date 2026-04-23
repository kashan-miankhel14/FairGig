'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Banknote, Clock, ArrowRight, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const PLATFORM_ICONS: Record<string, string> = {
  'Foodpanda': '🍔',
  'Daraz': '📦',
  'Careem': '🚗',
  'Uber': '🚕',
  'Uber Eats': '🍕',
  'DoorDash': '📫',
  'Instacart': '🛒',
  'JazzCash Rides': '🛵',
  'Upwork': '💻',
  'Fiverr': '⭐',
}

interface Shift {
  id: string
  platform: string
  shift_date: string
  duration_hours: number
  gross_earnings: number
  net_earnings: number
  status: string
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Fetch real data from Supabase
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setDataLoading(true)

        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('worker_id', user.id)
          .order('shift_date', { ascending: false })
          .limit(20)

        if (shiftsError) throw shiftsError
        setShifts(shiftsData || [])

        const { data: flagsData } = await supabase
          .from('anomaly_flags')
          .select('*')
          .eq('worker_id', user.id)
          .eq('status', 'open')
          .limit(3)

        setAnomalies(flagsData || [])

        // Trigger anomaly analysis in background (fire and forget)
        fetch(`http://localhost:8003/analyze/${user.id}`, { method: 'POST' }).catch(() => {})

        setError(null)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data.')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading || !user) return null

  // Compute stats from shifts
  const totalGross = shifts.reduce((s, x) => s + Number(x.gross_earnings), 0)
  const totalNet = shifts.reduce((s, x) => s + Number(x.net_earnings), 0)
  const totalHours = shifts.reduce((s, x) => s + Number(x.duration_hours), 0)
  const avgHourly = totalHours > 0 ? totalNet / totalHours : 0

  // Weekly chart
  const weeklyData = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
    const dayShifts = shifts.filter(s => {
      const d = new Date(s.shift_date)
      return d.getDay() === (i + 1) % 7
    })
    return { day, earnings: dayShifts.reduce((sum, s) => sum + Number(s.net_earnings), 0) }
  })

  const recentActivity = shifts.slice(0, 4).map(shift => ({
    id: shift.id,
    platform: `${shift.platform} Shift`,
    status: shift.status.toUpperCase(),
    location: `${shift.duration_hours}h • ${new Date(shift.shift_date).toLocaleDateString()}`,
    amount: `+PKR ${Number(shift.net_earnings).toLocaleString()}`,
    icon: PLATFORM_ICONS[shift.platform] || '💼',
  }))

  return (
    <AppLayout navbarTitle="Worker Dashboard" navbarSubtitle={`ROLE: ${user.role.toUpperCase()}`} searchPlaceholder="Search earnings...">
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Welcome */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {user.full_name.split(' ')[0]}! 👋</h2>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-semibold text-primary">{user.email}</span> · Role: <span className="font-semibold">{user.role}</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary">{shifts.length} shifts</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Gross</p>
              <p className="text-2xl font-bold text-foreground">PKR {totalGross.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Banknote className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary">After Fees</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Take-Home</p>
              <p className="text-2xl font-bold text-foreground">PKR {totalNet.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-foreground">PKR {avgHourly.toFixed(0)}/hr</p>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Hours</p>
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
            </div>
          </Card>
        </div>

        {/* Chart + Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Weekly Distribution</h2>
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="earnings" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/shift-logs">
                <Button className="w-full justify-between bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Add Shift</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/verifications">
                <Button className="w-full justify-between bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <span className="flex items-center gap-2"><Banknote className="w-4 h-4" />Verify Income</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/verifications">
                <Button className="w-full justify-between bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Get Certificate</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/grievance">
                <Button className="w-full justify-between bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />File Grievance</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Anomaly Flags */}
        {anomalies.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Detected Patterns</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              {anomalies.map(flag => <li key={flag.id}>• {flag.description}</li>)}
            </ul>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
            <a href="/shift-logs" className="text-primary text-sm font-semibold hover:underline">View All</a>
          </div>

          {dataLoading ? (
            <Card className="p-8 text-center text-muted-foreground">Loading your shifts...</Card>
          ) : recentActivity.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No shifts logged yet. Start tracking your earnings!</p>
              <Link href="/shift-logs">
                <Button className="mt-4">Log First Shift</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recentActivity.map(activity => (
                <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{activity.platform}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.location}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                          activity.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          activity.status === 'LOGGED' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{activity.status}</span>
                      </div>
                      <p className="font-bold text-foreground text-sm mt-2">{activity.amount}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
