import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'
import { FileText, Building2, Plus, Archive } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Templates</h1>
          <p className="text-[#94A3B8]">
            Save time with pre-built templates for proposals and walkthroughs
          </p>
        </div>

        {/* Template Categories */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/templates/proposals"
            className="group p-6 bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] rounded-2xl hover:border-[#D4FF00] transition-all active:scale-98"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#D4FF00]/10 rounded-xl group-hover:bg-[#D4FF00]/20 transition-colors">
                <FileText className="w-6 h-6 text-[#D4FF00]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Proposal Templates
                </h3>
                <p className="text-sm text-[#94A3B8]">
                  Pre-written proposals
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Manage templates</span>
              <span className="text-[#D4FF00]">→</span>
            </div>
          </Link>

          <Link
            href="/templates/walkthroughs"
            className="group p-6 bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] rounded-2xl hover:border-[#0EA5E9] transition-all active:scale-98"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#0EA5E9]/10 rounded-xl group-hover:bg-[#0EA5E9]/20 transition-colors">
                <Building2 className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Facility Templates
                </h3>
                <p className="text-sm text-[#94A3B8]">
                  Pre-configured rooms
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Manage templates</span>
              <span className="text-[#0EA5E9]">→</span>
            </div>
          </Link>

          <Link
            href="/templates/content"
            className="group p-6 bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] rounded-2xl hover:border-[#10B981] transition-all active:scale-98"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#10B981]/10 rounded-xl group-hover:bg-[#10B981]/20 transition-colors">
                <Archive className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Content Blocks
                </h3>
                <p className="text-sm text-[#94A3B8]">
                  Reusable text snippets
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Manage templates</span>
              <span className="text-[#10B981]">→</span>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#1A1F2E] to-[#0A0E1A] border border-[#2D3748] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/templates/proposals/new"
              className="p-4 bg-[#0A0E1A] border-2 border-dashed border-[#2D3748] rounded-xl hover:border-[#D4FF00] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4FF00]/10 rounded-lg flex items-center justify-center group-hover:bg-[#D4FF00]/20 transition-colors">
                  <Plus className="w-5 h-5 text-[#D4FF00]" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Create Proposal Template
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    Save current proposal as template
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/templates/walkthroughs/new"
              className="p-4 bg-[#0A0E1A] border-2 border-dashed border-[#2D3748] rounded-xl hover:border-[#0EA5E9] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0EA5E9]/20 transition-colors">
                  <Plus className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    Create Facility Template
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    Define room layout for reuse
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-[#D4FF00]/5 border border-[#D4FF00]/20 rounded-2xl">
          <h3 className="font-bold text-white mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-[#94A3B8]">
            Templates save you time by pre-filling common information. Create
            templates for different types of facilities (offices, medical,
            retail) and different proposal styles (standard, premium, quick
            quote).
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
