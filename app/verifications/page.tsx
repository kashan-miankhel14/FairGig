'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle, QrCode, FileText, Printer, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Certificate {
  id: string
  certificate_number: string
  period_start: string
  period_end: string
  total_gross_earnings: number
  total_platform_fees: number
  total_net_earnings: number
  status: string
  created_at: string
}

interface ShiftBreakdown {
  platform: string
  shift_count: number
  gross: number
  fees: number
  net: number
}

export default function Verifications() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('certificate')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [breakdown, setBreakdown] = useState<ShiftBreakdown[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setDataLoading(true)

      // Fetch certificates
      const { data: certs } = await supabase
        .from('income_certificates')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
      setCertificates(certs || [])

      // Fetch shift breakdown by platform
      const { data: shifts } = await supabase
        .from('shifts')
        .select('platform, gross_earnings, platform_fees, net_earnings')
        .eq('worker_id', user.id)
        .neq('status', 'flagged')

      if (shifts) {
        const grouped: Record<string, ShiftBreakdown> = {}
        shifts.forEach((s: any) => {
          if (!grouped[s.platform]) {
            grouped[s.platform] = { platform: s.platform, shift_count: 0, gross: 0, fees: 0, net: 0 }
          }
          grouped[s.platform].shift_count++
          grouped[s.platform].gross += Number(s.gross_earnings)
          grouped[s.platform].fees += Number(s.platform_fees)
          grouped[s.platform].net += Number(s.net_earnings)
        })
        setBreakdown(Object.values(grouped))
      }

      setDataLoading(false)
    }
    fetchData()
  }, [user])

  if (loading || !user) return null

  const latestCert = certificates[0]
  const totalGross = breakdown.reduce((s, b) => s + b.gross, 0)
  const totalFees = breakdown.reduce((s, b) => s + b.fees, 0)
  const totalNet = breakdown.reduce((s, b) => s + b.net, 0)

  const handlePrint = () => window.print()

  const handleGenerateCertificate = async () => {
    setGenerating(true)
    try {
      const resp = await fetch('http://localhost:8006/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: user.id,
          worker_name: user.full_name,
          total_income: totalNet,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          platforms: breakdown.map(b => ({
            platform: b.platform,
            shift_count: b.shift_count,
            gross: b.gross,
            fees: b.fees,
            net: b.net,
          })),
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        // Open certificate in new tab
        const win = window.open('', '_blank')
        if (win) { win.document.write(data.html_template); win.document.close() }
      }
    } catch {
      // Fallback: just print current page
      window.print()
    }
    setGenerating(false)
  }

  const formatPKR = (n: number) => `PKR ${Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`

  const issueDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)
  const periodEnd = new Date()
  const periodStr = `${periodStart.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })} — ${periodEnd.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`

  return (
    <AppLayout navbarTitle="Income Certificate" navbarSubtitle="INCOME VERIFICATION" searchPlaceholder="Certificates talash karein...">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-border no-print">
          {[
            { id: 'certificate', label: 'Income Certificate' },
            { id: 'history', label: 'Itihaas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`pb-3 px-1 font-semibold text-sm ${
                selectedTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {selectedTab === 'certificate' && (
          <>
            {/* Actions */}
            <div className="flex items-center justify-between no-print">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Certified Income Statement</h1>
                <p className="text-sm text-muted-foreground">{issueDate} ko generate kiya gaya — platform activities ke liye</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePrint} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Karein
                </Button>
                <Button onClick={handleGenerateCertificate} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  PDF Export
                </Button>
              </div>
            </div>

            {dataLoading ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading certificate data...
              </Card>
            ) : (
              /* ============ PRINTABLE CERTIFICATE ============ */
              <div id="income-certificate" className="bg-white rounded-lg p-12 space-y-8 max-w-4xl mx-auto border border-border shadow-sm">
                {/* Official Badge */}
                <div className="flex items-center justify-center gap-2 pb-6 border-b-2 border-primary">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">FairGig — Officially Certified</span>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-2">🇵🇰</div>
                  <h2 className="text-4xl font-bold text-foreground">
                    Income <span className="text-primary">Certificate</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ref No: {latestCert?.certificate_number || `FG-${Date.now()}-DRAFT`} • Issue Date: {issueDate}
                  </p>
                </div>

                {/* Worker Details */}
                <div className="grid grid-cols-2 gap-8 py-8 border-t border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Statement Issued To</p>
                    <p className="text-xl font-bold text-foreground">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.city ? `${user.city}, Pakistan` : 'Pakistan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Statement Period</p>
                    <p className="text-xl font-bold text-foreground">{periodStr}</p>
                    <p className="text-sm text-muted-foreground mt-2">Platform: Multi-Platform Worker</p>
                  </div>
                </div>

                {/* Income Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 space-y-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Net Certified Income</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-green-700">{formatPKR(totalNet)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-green-200">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gross Earnings</p>
                      <p className="text-2xl font-bold text-foreground">{formatPKR(totalGross)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Platform Fees</p>
                      <p className="text-2xl font-bold text-red-600">-{formatPKR(totalFees)}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                {breakdown.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Activity Breakdown</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border">
                        {['Platform', 'Shifts', 'Gross', 'Fees', 'Net Income'].map(h => (
                          <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
                        ))}
                      </div>
                      {breakdown.map((b, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-4 py-3 items-center border-b border-border/50">
                          <p className="font-semibold text-foreground text-sm">{b.platform}</p>
                          <p className="font-semibold text-foreground">{b.shift_count}</p>
                          <p className="text-sm text-foreground">{formatPKR(b.gross)}</p>
                          <p className="text-sm text-red-600">-{formatPKR(b.fees)}</p>
                          <p className="font-bold text-green-700">{formatPKR(b.net)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {breakdown.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">Koi verified shifts nahi hain. Pehle shifts log karein aur verify karwayein.</p>
                  </div>
                )}

                {/* Declaration */}
                <div className="space-y-4 pt-8 border-t border-border bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <p className="text-sm font-bold text-primary uppercase tracking-wide">Statement Declaration</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    FairGig certifies that the above figures represent the actual verified income disbursed to the individual
                    named herein. All figures are in Pakistani Rupees (PKR). This document is cryptographically secured and
                    verifiable against the FairGig Public Ledger. Ye certificate makan maalik, banks, aur loan applications ke liye qabil-e-qabool hai.
                  </p>
                </div>

                {/* Signature */}
                <div className="flex items-end justify-between pt-8">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">FairGig Platform</p>
                    <p className="text-xs text-muted-foreground">Pakistan Labour Advocacy Network</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-3xl font-bold text-primary italic">Amina</div>
                    <p className="text-sm font-semibold text-foreground">Amina Siddiqui</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Chief Verification Officer</p>
                  </div>
                </div>
              </div>
            )}

            {/* QR + Physical Copy */}
            <div className="grid grid-cols-2 gap-6 no-print">
              <Card className="p-6 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">SCAN TO VERIFY</p>
                  <p className="text-xs text-muted-foreground">QR code se authenticity verify karein</p>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-3">Physical Copy Chahiye?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aapke registered address par notarized hardcopy 5 business days mein pahunch sakti hai.
                </p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Notarized Copy Ka Request Karein
                </Button>
              </Card>
            </div>
          </>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Certificate History</h2>
            {dataLoading ? (
              <Card className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>
            ) : certificates.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Koi certificate nahi mila. Pehle shifts log karein.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      {['Certificate #', 'Period', 'Net Income', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {certificates.map(cert => (
                      <tr key={cert.id} className="hover:bg-secondary transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-foreground">{cert.certificate_number}</td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(cert.period_start).toLocaleDateString('en-PK')} — {new Date(cert.period_end).toLocaleDateString('en-PK')}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPKR(cert.total_net_earnings)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            cert.status === 'verified' ? 'bg-green-100 text-green-700' :
                            cert.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{cert.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(cert.created_at).toLocaleDateString('en-PK')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
