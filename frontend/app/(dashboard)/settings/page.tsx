'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { User, Lock, Moon, Sun, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.targetRole || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        targetRole: targetRole.trim(),
        bio: bio.trim(),
      });
      if (res.data.success) {
        updateUser(res.data.data);
        success('Profile updated successfully');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardShell
      title="User Profile & Settings"
      subtitle="Manage your personal information, career target headline, password, and UI theme."
    >
      <div className="max-w-4xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
            <CardDescription>
              Your personal details shown on your dashboard and resume links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
              </div>

              <Input
                label="Target Job Role / Headline"
                placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Career Bio & Summary
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Short summary of your career focus and key achievements..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={savingProfile} icon={<Save className="w-4 h-4" />}>
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Appearance</CardTitle>
            <CardDescription>
              Choose your preferred visual theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security / Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
            <CardDescription>
              Update your account password with strong bcrypt hashing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password (min 6 characters)"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button type="submit" isLoading={savingPassword} icon={<Lock className="w-4 h-4" />}>
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
