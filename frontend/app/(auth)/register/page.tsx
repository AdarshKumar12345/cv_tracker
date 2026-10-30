'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      error('Please complete all required fields');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register(name.trim(), email.trim(), password, targetRole.trim());
    setLoading(false);

    if (res.success) {
      success('Account created successfully! Welcome to CV Tracker.');
      router.push('/dashboard');
    } else {
      error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              CV Tracker
            </span>
          </Link>
          <h2 className="text-xl font-bold text-zinc-100">Create your workspace</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Free forever. Organize your job search like a senior engineer.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Alex Morgan"
              icon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="alex@company.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Target Role / Headline (optional)"
              placeholder="e.g. Senior Software Engineer"
              icon={<Briefcase className="w-4 h-4" />}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />

            <Input
              label="Password (min 6 chars) *"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
