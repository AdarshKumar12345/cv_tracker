'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  KanbanSquare,
  FileText,
  BarChart3,
  CalendarCheck2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              CV Tracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-400 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            The Operating System for Job Seekers
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Take Full Command of Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              Hiring Pipeline
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Manage multiple resume versions, organize company research, run your interactive Kanban board, track interview rounds, and supercharge your career transitions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-indigo-500/25">
                Start Tracking Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Sign In to Workspace
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <KanbanSquare className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-bold text-sm text-zinc-200">Interactive Kanban</h3>
              <p className="text-xs text-zinc-400 mt-1">Drag and drop applications across 7 hiring stages seamlessly.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <FileText className="w-6 h-6 text-sky-400 mb-2" />
              <h3 className="font-bold text-sm text-zinc-200">Resume Versioning</h3>
              <p className="text-xs text-zinc-400 mt-1">Upload PDF/DOCX resumes, link to jobs, and track iterations.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <CalendarCheck2 className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-bold text-sm text-zinc-200">Interview Tracker</h3>
              <p className="text-xs text-zinc-400 mt-1">Schedule rounds, store questions, meeting URLs, and prep notes.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-sm text-zinc-200">Analytics & Trends</h3>
              <p className="text-xs text-zinc-400 mt-1">Conversion rates, timeline aggregations, and offer metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 CV Tracker Platform. Production-Ready Job Application System.</p>
      </footer>
    </div>
  );
}
