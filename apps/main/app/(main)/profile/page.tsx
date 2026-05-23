'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { Camera, Save, Loader2,TrendingUp,Eye, EyeOff, Lock, Globe, Bell, Shield, User, Mail, MapPin, Link as LinkIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  profile: {
    display_name?: string;
    pen_name?: string;
    company_name?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    website_url?: string;
    location?: string;
    privacy: {
      is_public: boolean;
      show_email: boolean;
      show_reading_stats: boolean;
    };
    notification_preferences: {
      email_notifications: boolean;
      push_notifications: boolean;
      marketing_emails: boolean;
    };
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications'>('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    pen_name: '',
    company_name: '',
    bio: '',
    website_url: '',
    location: '',
    is_public: true,
    show_email: false,
    show_reading_stats: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProfile }>('/api/users/profile');
      const data = response.data;
      setProfile(data);
      
      // Populate form
      const profileData = data.profile;
      setFormData({
        display_name: profileData?.display_name || '',
        pen_name: profileData?.pen_name || '',
        company_name: profileData?.company_name || '',
        bio: profileData?.bio || '',
        website_url: profileData?.website_url || '',
        location: profileData?.location || '',
        is_public: profileData?.privacy?.is_public ?? true,
        show_email: profileData?.privacy?.show_email ?? false,
        show_reading_stats: profileData?.privacy?.show_reading_stats ?? true,
        email_notifications: profileData?.notification_preferences?.email_notifications ?? true,
        push_notifications: profileData?.notification_preferences?.push_notifications ?? true,
        marketing_emails: profileData?.notification_preferences?.marketing_emails ?? false,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await apiClient.post<{ success: boolean; data: { avatar_url: string } }>(
        '/api/users/avatar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      setProfile(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, avatar_url: response.data.avatar_url }
      } : null);
      
      setSuccessMessage('Avatar updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put('/api/users/profile', {
        display_name: formData.display_name,
        pen_name: formData.pen_name,
        company_name: formData.company_name,
        bio: formData.bio,
        website_url: formData.website_url,
        location: formData.location,
        privacy: {
          is_public: formData.is_public,
          show_email: formData.show_email,
          show_reading_stats: formData.show_reading_stats,
        },
        notifications: {
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
          marketing_emails: formData.marketing_emails,
        },
      });
      
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const userRole = user?.role || 'reader';
  const isAuthor = userRole === 'author';
  const isPublisher = userRole === 'publisher';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">Profile Settings</h1>
        <p className="text-[#4A5568] mt-1">Manage your profile information and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profile?.profile?.avatar_url ? (
                <img src={profile.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.display_name?.charAt(0)?.toUpperCase() || 
                formData.pen_name?.charAt(0)?.toUpperCase() || 
                user?.email?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-1.5 bg-[#B85C38] text-white rounded-full hover:bg-[#8E735B] transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-medium text-[#1A2A3A]">Profile Picture</p>
            <p className="text-sm text-[#4A5568]">JPG, PNG or WEBP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8E2D9]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-[#B85C38] border-b-2 border-[#B85C38]'
              : 'text-[#4A5568] hover:text-[#1A2A3A]'
          }`}
        >
          <User size={16} className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'privacy'
              ? 'text-[#B85C38] border-b-2 border-[#B85C38]'
              : 'text-[#4A5568] hover:text-[#1A2A3A]'
          }`}
        >
          <Shield size={16} className="inline mr-2" />
          Privacy
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'text-[#B85C38] border-b-2 border-[#B85C38]'
              : 'text-[#4A5568] hover:text-[#1A2A3A]'
          }`}
        >
          <Bell size={16} className="inline mr-2" />
          Notifications
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Email Address</label>
            <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg text-[#4A5568]">
              <Mail size={16} />
              <span>{profile?.email || user?.email}</span>
            </div>
            <p className="text-xs text-[#4A5568] mt-1">Your email cannot be changed</p>
          </div>

          {/* Role-specific fields */}
          {isAuthor && (
            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Pen Name</label>
              <input
                type="text"
                value={formData.pen_name}
                onChange={(e) => setFormData(prev => ({ ...prev, pen_name: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                placeholder="Your pen name (publicly visible)"
              />
            </div>
          )}

          {isPublisher && (
            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                placeholder="Your publishing company name"
              />
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
              placeholder="How you want to be seen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-[#4A5568] mt-1">{formData.bio.length} characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Website</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Public Profile</p>
                  <p className="text-sm text-[#4A5568]">Allow others to see your profile and activity</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.is_public ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.is_public ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Show Email</p>
                  <p className="text-sm text-[#4A5568]">Display your email on your public profile</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, show_email: !prev.show_email }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.show_email ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.show_email ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Show Reading Stats</p>
                  <p className="text-sm text-[#4A5568]">Display your reading progress and achievements</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, show_reading_stats: !prev.show_reading_stats }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.show_reading_stats ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.show_reading_stats ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Email Notifications</p>
                  <p className="text-sm text-[#4A5568]">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.email_notifications ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.email_notifications ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Push Notifications</p>
                  <p className="text-sm text-[#4A5568]">Receive notifications in your browser</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, push_notifications: !prev.push_notifications }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.push_notifications ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.push_notifications ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#4A5568]" />
                <div>
                  <p className="font-medium text-[#1A2A3A]">Marketing Emails</p>
                  <p className="text-sm text-[#4A5568]">Receive promotions and updates about BookNest</p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.marketing_emails ? 'bg-[#B85C38]' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.marketing_emails ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}