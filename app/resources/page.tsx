'use client'

import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Shield, Calendar, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const chartData = [
  { week: 'Week 1', commission: 18.2, industry: 15.8 },
  { week: 'Week 2', commission: 19.1, industry: 16.2 },
  { week: 'Week 3', commission: 20.5, industry: 16.8 },
  { week: 'Week 4', commission: 21.2, industry: 17.1 },
]

const platformData = [
  {
    name: 'DashSwift',
    category: 'Logistics & Delivery',
    sentiment: 5,
    hourly: '$22.40',
    transparency: '88%',
    fairnessGrade: 'A-',
  },
  {
    name: 'HomeHelper',
    category: 'Domestic Services',
    sentiment: 5,
    hourly: '$16.80',
    transparency: '42%',
    fairnessGrade: 'D+',
  },
  {
    name: 'QuickMovers',
    category: 'Heavy Labor',
    sentiment: 5,
    hourly: '$31.50',
    transparency: '65%',
    fairnessGrade: 'B',
  },
]

const issues = [
  { name: 'Underpayment', percentage: 42, color: 'bg-blue-600' },
  { name: 'Wrongful Lockout', percentage: 28, color: 'bg-purple-600' },
  { name: 'Tip Theft', percentage: 15, color: 'bg-gray-600' },
]

const activeCases = [
  { number: '12', description: 'Active Cases', details: 'Pending legal advocacy review' },
]

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30days')

  return (
    <AppLayout navbarTitle="Advocate Analytics" searchPlaceholder="Search platforms...">
      <div className="space-y-8">
        {/* Header with Date Filter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Comprehensive oversight of gig platform transparency, income equity, and systemic issue resolution
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Last 30 Days: Jan 15 – Feb 14</span>
          </button>
        </div>

        {/* Platform Integrity Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wide">Live Audit</h2>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Platform Integrity Metrics</h3>
            <p className="text-sm text-muted-foreground mt-1">Commission trends vs. industry standards</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="col-span-2 p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="commission" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="industry"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Critical Issue Distribution */}
            <Card className="p-6 border-2 border-primary/20">
              <h4 className="font-bold text-foreground mb-4">Critical Issue Distribution</h4>
              <div className="space-y-3">
                {issues.map((issue, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-foreground">{issue.name}</span>
                      <span className="text-sm font-bold text-primary">{issue.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className={`${issue.color} h-2 rounded-full`} style={{ width: `${issue.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Cases */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="bg-primary text-primary-foreground rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{activeCases[0].number}</span>
                  </div>
                  <p className="font-semibold text-sm">{activeCases[0].description}</p>
                  <p className="text-xs opacity-90">{activeCases[0].details}</p>
                  <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-3 text-sm">
                    VIEW DOCKET
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Income Distribution Heatmap */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Income Distribution Heatmap</h3>

          <Card className="p-6 bg-gray-700 h-80 rounded-lg flex items-center justify-center text-white/50">
            <div className="text-center">
              <p className="text-sm">Geographic heatmap visualization</p>
              <p className="text-xs opacity-75 mt-2">Chicago Metro region highlighted</p>
            </div>
          </Card>

          {/* Map Legend */}
          <Card className="p-4 absolute bottom-20 left-64">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">ACTIVE REGION</p>
            <h4 className="text-lg font-bold text-foreground">Chicago Metro</h4>
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <p className="text-sm text-foreground">High Earnings ($28+/hr)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <p className="text-sm text-foreground">Standard ($18-24/hr)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <p className="text-sm text-foreground">Critical Equity Gap (&lt;$15/hr)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Performance Audit */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Platform Performance Audit</h3>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Platform Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Worker Sentiment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Avg. Hourly (Net)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Transparency Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Fairness Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {platformData.map((platform, idx) => (
                    <tr key={idx} className="hover:bg-secondary transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-bold">
                              {platform.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{platform.name}</p>
                              <p className="text-xs text-muted-foreground">{platform.category}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-blue-400">
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{platform.hourly}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${parseInt(platform.transparency)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-foreground">{platform.transparency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold px-3 py-1 rounded ${
                            platform.fairnessGrade === 'A-'
                              ? 'bg-green-100 text-green-700'
                              : platform.fairnessGrade === 'B'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {platform.fairnessGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
