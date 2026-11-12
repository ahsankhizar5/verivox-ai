'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { User, Mail, Lock, Trash2, Save, Bell, Shield, Eye, EyeOff, Sliders } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    detectionAlerts: true,
    accountUpdates: true,
    marketingEmails: false,
    weeklyReports: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      toast.success('Your profile has been updated', 'Profile Updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match', 'Validation Error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters', 'Validation Error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Your password has been updated', 'Password Updated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notificationPrefs),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      toast.success('Your notification preferences have been saved', 'Preferences Updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      toast.warning('Account deletion cancelled', 'Cancelled');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('Your account has been deleted', 'Account Deleted');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account', 'Deletion Failed');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Delete Account', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-[#0b0a09]">
      {/* Header */}
      <div className="bg-[#141210] border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            ACCOUNT PREFERENCES
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-stone-300 mt-0.5">
            Manage your profile details, password, email notifications, and account data.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-amber-400 text-amber-400 font-semibold'
                      : 'border-transparent text-stone-400 hover:text-stone-100 hover:border-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-amber-500/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Personal Details</h2>
                <p className="text-xs text-stone-300">
                  Update your name and primary email address.
                </p>
              </div>
              <Badge variant="default" size="sm">PROFILE</Badge>
            </div>
            <div className="p-6 sm:p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    icon={<User className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    icon={<User className="w-4 h-4" />}
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  icon={<Mail className="w-4 h-4" />}
                  helperText="Used for sign-in and report notifications"
                  required
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="primary" size="md" isLoading={loading}>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      if (user) {
                        setProfileData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                        });
                      }
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-amber-500/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Change Password</h2>
                <p className="text-xs text-stone-300">
                  Update your account password.
                </p>
              </div>
              <Badge variant="info" size="sm">ENCRYPTED</Badge>
            </div>
            <div className="p-6 sm:p-8">
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="text-stone-400 hover:text-stone-300 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  icon={<Lock className="w-4 h-4" />}
                  helperText="Minimum 8 characters required"
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="text-stone-400 hover:text-stone-300 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="text-stone-400 hover:text-stone-300 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="primary" size="md" isLoading={loading}>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-amber-500/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Email Notifications</h2>
                <p className="text-xs text-stone-300">
                  Choose which alerts you want to receive.
                </p>
              </div>
              <Badge variant="default" size="sm">ALERTS</Badge>
            </div>
            <div className="p-6 sm:p-8">
              <div className="divide-y divide-white/10">
                <label className="flex items-start gap-4 py-4 first:pt-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.detectionAlerts}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, detectionAlerts: e.target.checked })}
                    className="w-4 h-4 text-amber-400 border-white/15 rounded focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">Scan Completion Alerts</span>
                      <Badge variant="info" size="sm">RECOMMENDED</Badge>
                    </div>
                    <p className="text-xs text-stone-300">
                      Notify when audio verification or visual report generation finishes.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 py-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.accountUpdates}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, accountUpdates: e.target.checked })}
                    className="w-4 h-4 text-amber-400 border-white/15 rounded focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">Security &amp; Account Notices</span>
                      <Badge variant="warning" size="sm">ESSENTIAL</Badge>
                    </div>
                    <p className="text-xs text-stone-300">
                      Important alerts about password changes, API keys, and quota updates.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 py-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.weeklyReports}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, weeklyReports: e.target.checked })}
                    className="w-4 h-4 text-amber-400 border-white/15 rounded focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white block mb-0.5">
                      Weekly Scan Summary
                    </span>
                    <p className="text-xs text-stone-300">
                      A weekly recap of your scanned audio files and results.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 py-4 last:pb-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.marketingEmails}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, marketingEmails: e.target.checked })}
                    className="w-4 h-4 text-amber-400 border-white/15 rounded focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white block mb-0.5">
                      Product Updates
                    </span>
                    <p className="text-xs text-stone-300">
                      Occasional news about new VeriVox features and model improvements.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpdateNotifications}
                  isLoading={loading}
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Account/Danger Tab */}
        {activeTab === 'danger' && (
          <Card variant="default" padding="none" className="overflow-hidden border-rose-500/30">
            <div className="px-6 py-4 border-b border-rose-500/30 bg-rose-500/15 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-rose-200">Delete Account &amp; Data</h2>
                <p className="text-xs text-rose-300">
                  Permanently remove your account, uploaded audio files, and scan history.
                </p>
              </div>
              <Badge variant="danger" size="sm">PERMANENT</Badge>
            </div>
            <div className="p-6 sm:p-8">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">
                      Permanently Delete Account
                    </h3>
                    <p className="text-sm text-stone-300 mb-4">
                      Deleting your account immediately removes all associated records:
                    </p>
                    <ul className="space-y-1.5 text-xs font-mono text-stone-300 mb-6 bg-[#141210] p-4 rounded-lg border border-white/10">
                      <li>• Removes your profile and login credentials</li>
                      <li>• Deletes all audio scan logs and visual reports</li>
                      <li>• Revokes active API keys</li>
                    </ul>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={handleDeleteAccount}
                      isLoading={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account Permanently
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
