'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { profileApi } from '@/lib/api/client';
import { authApi } from '@/lib/api/client';
import { subscribeToStreakPush, unsubscribeFromStreakPush } from '@/lib/notifications/subscribePush';
import type { Profile } from '@repo/types';
import { Camera, Save, Loader2, TrendingUp, Globe, Bell, Shield, User, Mail, MapPin, Link as LinkIcon, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BackLink } from '@/features/community/ui';
import { bnInputClass, bnTextareaClass } from '@/components/ui/inputStyles';
import { formatJoinDate } from '@/lib/utils/formatJoinDate';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

export default function ProfilePage() {
  const { t, locale } = useTranslation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const response = await profileApi.getProfile();
      const data = response.data;
      setProfile(data);

      const roleData = data.profile_data as Record<string, string> | null;
      setFormData({
        display_name: roleData?.display_name || data.publicName || '',
        pen_name: roleData?.pen_name || '',
        company_name: roleData?.company_name || '',
        bio: data.bio || '',
        website_url: data.website_url || '',
        location: data.location || '',
        is_public: data.settings?.is_public ?? true,
        show_email: data.settings?.show_email ?? false,
        show_reading_stats: data.settings?.show_reading_stats ?? true,
        email_notifications: data.settings?.email_notifications ?? true,
        push_notifications: data.settings?.push_notifications ?? true,
        marketing_emails: data.settings?.marketing_emails ?? false,
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
      const response = await profileApi.uploadAvatar(file);
      const avatarUrl = response.data.avatar_url;
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      
      setSuccessMessage(t('profile.saved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const role = user?.role || 'reader';
    const name = (
      role === 'author'
        ? formData.pen_name
        : role === 'publisher'
          ? formData.company_name
          : formData.display_name
    ).trim();
    if (!name) {
      errors.display_name = t('profile.validation.displayNameRequired');
    } else if (name.length > 80) {
      errors.display_name = t('profile.validation.displayNameMax');
    }
    if (formData.bio.length > 500) {
      errors.bio = t('profile.validation.bioMax');
    }
    if (formData.location.length > 120) {
      errors.location = t('profile.validation.locationMax');
    }
    if (formData.website_url.trim()) {
      try {
        const url = formData.website_url.startsWith('http')
          ? formData.website_url
          : `https://${formData.website_url}`;
        new URL(url);
      } catch {
        errors.website_url = t('profile.validation.websiteInvalid');
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const profilePayload: Parameters<typeof profileApi.updateProfile>[0] = {
        bio: formData.bio,
        location: formData.location,
      };
      if (isAuthor) {
        profilePayload.pen_name = formData.pen_name;
        profilePayload.website_url = formData.website_url;
      } else if (isPublisher) {
        profilePayload.company_name = formData.company_name;
        profilePayload.website_url = formData.website_url;
      } else {
        profilePayload.display_name = formData.display_name;
      }

      await Promise.all([
        profileApi.updateProfile(profilePayload),
        profileApi.updateSettings({
          is_public: formData.is_public,
          show_email: formData.show_email,
          show_reading_stats: formData.show_reading_stats,
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
          marketing_emails: formData.marketing_emails,
        }),
      ]);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              bio: formData.bio,
              location: formData.location,
              website_url: isAuthor || isPublisher ? formData.website_url : prev.website_url,
              settings: {
                is_public: formData.is_public,
                show_email: formData.show_email,
                show_reading_stats: formData.show_reading_stats,
                email_notifications: formData.email_notifications,
                push_notifications: formData.push_notifications,
                marketing_emails: formData.marketing_emails,
              },
            }
          : prev
      );

      if (formData.push_notifications) {
        void subscribeToStreakPush();
      } else {
        void unsubscribeFromStreakPush();
      }

      setSuccessMessage(t('profile.saved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This cannot be undone. Your profile and login will be removed.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await profileApi.deleteAccount();
      await authApi.logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Could not delete account. Try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const userRole = user?.role || 'reader';
  const isAuthor = userRole === 'author';
  const isPublisher = userRole === 'publisher';
  const isReader = userRole === 'reader';
  const settingsBackHref = isAuthor || isPublisher ? '/studio' : '/community';
  const memberSince = profile?.created_at
    ? formatJoinDate(profile.created_at, locale === 'am' ? 'am-ET' : 'en-US')
    : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <BackLink href={settingsBackHref} label={t('common.back')} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">{t('profile.title')}</h1>
          <p className="text-[#4A5568] mt-1">{t('profile.subtitle')}</p>
        </div>
        {profile?.id && (
          <Link
            href="/@me"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#B85C38] hover:text-[#8E735B]"
          >
            <ExternalLink size={16} />
            {t('profile.viewPublic')}
          </Link>
        )}
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
            <button
              type="button"
              onClick={() => profile?.avatar_url && setAvatarPreviewOpen(true)}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.display_name?.charAt(0)?.toUpperCase() || 
                formData.pen_name?.charAt(0)?.toUpperCase() || 
                user?.email?.charAt(0)?.toUpperCase() || 'U'
              )}
            </button>
            <button
              type="button"
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
          <div className="flex-1 min-w-0 space-y-3">
            <p className="font-medium text-[#1A2A3A]">{t('profile.profilePicture')}</p>
            <p className="text-sm text-[#4A5568]">{t('profile.avatarHint')}</p>
            {memberSince && (
              <p className="text-sm text-[#4A5568]">{t('profile.joinedOn', { date: memberSince })}</p>
            )}
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
          {t('profile.tabProfile')}
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
          {t('profile.tabPrivacy')}
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
          {t('profile.tabNotifications')}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">{t('profile.emailAddress')}</label>
            <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg text-[#4A5568]">
              <Mail size={16} />
              <span>{profile?.email || user?.email}</span>
            </div>
            <p className="text-xs text-[#4A5568] mt-1">{t('profile.emailReadonly')}</p>
          </div>

          {/* Role-specific fields */}
          {isAuthor && (
            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Pen Name</label>
              <input
                type="text"
                value={formData.pen_name}
                onChange={(e) => setFormData(prev => ({ ...prev, pen_name: e.target.value }))}
                className={bnInputClass(Boolean(fieldErrors.pen_name))}
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
                className={bnInputClass(Boolean(fieldErrors.pen_name))}
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
              className={bnInputClass(Boolean(fieldErrors.display_name))}
              placeholder={t('profile.displayNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className={bnTextareaClass(Boolean(fieldErrors.bio))}
              placeholder={t('profile.bioPlaceholder')}
            />
            <p className="text-xs text-[#4A5568] mt-1">
              {t('profile.charCount', { count: formData.bio.length })}
            </p>
            {fieldErrors.bio && <p className="text-xs text-red-600 mt-1">{fieldErrors.bio}</p>}
          </div>

          <div className={isAuthor || isPublisher ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
            <div className={!(isAuthor || isPublisher) ? '' : undefined}>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={`${bnInputClass(Boolean(fieldErrors.location))} pl-10`}
                  placeholder={t('profile.locationPlaceholder')}
                />
              </div>
            </div>

            {(isAuthor || isPublisher) && (
              <div>
                <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Website</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    className={`${bnInputClass(Boolean(fieldErrors.website_url))} pl-10`}
                    placeholder={t('profile.websitePlaceholder')}
                  />
                </div>
              </div>
            )}
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

            {isReader && (
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
            )}
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

      {profile?.avatar_url && (
        <ImageLightbox
          images={[{ id: 'avatar', url: profile.avatar_url, alt: 'Avatar' }]}
          isOpen={avatarPreviewOpen}
          onClose={() => setAvatarPreviewOpen(false)}
        />
      )}

      {/* Save + danger zone */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => void handleDeleteAccount()}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {t('profile.deleteAccount')}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </div>
    </div>
  );
}