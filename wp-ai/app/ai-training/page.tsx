import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'
import { Brain, FileText, Database, Upload, Plus, BookOpen } from 'lucide-react'

export default async function AITrainingPage() {
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Training Center</h1>
          </div>
          <p className="text-[#94A3B8]">
            Teach the AI your pricing strategies, guidelines, and examples for better suggestions
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#6D28D9]/10 border border-[#8B5CF6]/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#8B5CF6]/20 rounded-lg shrink-0">
              <BookOpen className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">How AI Training Works</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                The AI analyzes your guidelines, past examples, and uploaded documents to provide personalized pricing suggestions. The more data you provide, the better the AI understands your business model and pricing strategy.
              </p>
            </div>
          </div>
        </div>

        {/* Training Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Guidelines */}
          <Link
            href="/ai-training/guidelines"
            className="group bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] hover:border-[#8B5CF6] rounded-2xl p-6 transition-all active:scale-98"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#8B5CF6]/10 rounded-xl group-hover:bg-[#8B5CF6]/20 transition-colors">
                <FileText className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Guidelines</h3>
                <p className="text-sm text-[#94A3B8]">Pricing rules & strategies</p>
              </div>
            </div>
            <p className="text-sm text-[#64748B] mb-4">
              Define your pricing philosophy, markup rules, and decision-making criteria
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8B5CF6] font-medium">Manage →</span>
              <Plus className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </Link>

          {/* Examples */}
          <Link
            href="/ai-training/examples"
            className="group bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] hover:border-[#10B981] rounded-2xl p-6 transition-all active:scale-98"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#10B981]/10 rounded-xl group-hover:bg-[#10B981]/20 transition-colors">
                <Database className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Examples</h3>
                <p className="text-sm text-[#94A3B8]">Won/lost proposals</p>
              </div>
            </div>
            <p className="text-sm text-[#64748B] mb-4">
              Add historical proposals with outcomes to help AI learn your sweet spot
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#10B981] font-medium">Manage →</span>
              <Plus className="w-5 h-5 text-[#10B981]" />
            </div>
          </Link>

          {/* Documents */}
          <Link
            href="/ai-training/documents"
            className="group bg-[#1A1F2E]/80 backdrop-blur-sm border-2 border-[#2D3748] hover:border-[#0EA5E9] rounded-2xl p-6 transition-all active:scale-98"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#0EA5E9]/10 rounded-xl group-hover:bg-[#0EA5E9]/20 transition-colors">
                <Upload className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Documents</h3>
                <p className="text-sm text-[#94A3B8]">Reference materials</p>
              </div>
            </div>
            <p className="text-sm text-[#64748B] mb-4">
              Upload industry reports, competitor pricing, and market research
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#0EA5E9] font-medium">Manage →</span>
              <Plus className="w-5 h-5 text-[#0EA5E9]" />
            </div>
          </Link>
        </div>

        {/* Quick Start Tips */}
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Start Tips</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#8B5CF6]">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Add 3-5 Guidelines</p>
                <p className="text-sm text-[#94A3B8]">
                  e.g., "Always maintain 30% minimum margin", "Medical facilities get 20% premium"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#10B981]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#10B981]">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Add Past Proposals</p>
                <p className="text-sm text-[#94A3B8]">
                  Include at least 5 won proposals and 2-3 lost ones for context
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#0EA5E9]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#0EA5E9]">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Upload Industry Data (Optional)</p>
                <p className="text-sm text-[#94A3B8]">
                  Market rates, competitor pricing sheets, or industry benchmarks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance (Future) */}
        <div className="mt-8 bg-[#0A0E1A] border border-[#2D3748] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">AI Performance</h2>
          <p className="text-sm text-[#64748B] mb-4">
            Track how well the AI's suggestions perform over time
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">--</div>
              <div className="text-xs text-[#94A3B8]">Suggestions Made</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-1">--</div>
              <div className="text-xs text-[#94A3B8]">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8B5CF6] mb-1">--</div>
              <div className="text-xs text-[#94A3B8]">Avg Confidence</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
