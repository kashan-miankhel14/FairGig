'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, MapPin, Calendar, LogOut, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Profile() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const roleColors: Record<string, string> = {
    worker: 'bg-blue-100 text-blue-700',
    verifier: 'bg-purple-100 text-purple-700',
    advocate: 'bg-green-100 text-green-700',
  }

  return (
    <AppLayout navbarTitle="Profile Settings" showSearch={false}>
      <div className="max-w-3xl space-y-8">
        {/* Profile Header */}
        <Card className="p-8 flex items-start gap-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">{user.full_name}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                <p className="font-semibold text-foreground capitalize">{user.status}</p>
              </div>
              {user.city && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="font-semibold text-foreground">{user.city}{user.state ? `, ${user.state}` : ''}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Account Type</p>
                <p className="font-semibold text-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Card>

        {/* Contact Information */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Account Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              </div>
              <p className="font-semibold text-foreground">{user.email}</p>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
              </div>
              <p className="font-semibold text-foreground capitalize">{user.role}</p>
            </Card>
            {user.city && (
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">City</p>
                </div>
                <p className="font-semibold text-foreground">{user.city}</p>
              </Card>
            )}
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Account Status</p>
              </div>
              <p className="font-semibold text-foreground capitalize">{user.status}</p>
            </Card>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Preferences</h2>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-semibold text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get updates about earnings and grievance cases</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border" />
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Platform Analytics Sharing</p>
                <p className="text-sm text-muted-foreground">Help improve FairGig with anonymous usage data</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border" />
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Account</h2>
          <div className="space-y-3">
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start">
              Download My Data
            </Button>
            <Button
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 justify-start"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
