import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/app-layout'
import { SettingsForm } from '@/components/settings/settings-form'
import { LogOut } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      company: true,
      phone: true,
      hourlyWage: true,
      targetMargin: true,
    },
  })

  if (!userData) {
    redirect('/login')
  }

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account and preferences</p>
        </div>

        {/* User Info */}
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-muted mb-1">Name</p>
              <p className="font-medium">{userData.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            {userData.company && (
              <div>
                <p className="text-sm text-text-muted mb-1">Company</p>
                <p className="font-medium">{userData.company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Settings */}
        <SettingsForm
          userId={user.id}
          hourlyWage={userData.hourlyWage}
          targetMargin={userData.targetMargin}
        />

        {/* Logout */}
        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="w-full bg-accent-orange text-white font-semibold py-3 rounded-lg hover:bg-accent-orange/90 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
