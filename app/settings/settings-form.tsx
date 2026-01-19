'use client';

import { useState, useRef } from 'react';
import {
  Globe,
  User as UserIcon,
  LogOut,
  Camera,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  updateProfile,
  deleteAccountAction,
  uploadAvatar,
  removeAvatar,
} from './actions';
import { logout } from '@/app/login/actions';

export function SettingsForm({
  profile,
  email,
}: {
  profile: any;
  email: string | undefined;
}) {
  const [learningLevel, setLearningLevel] = useState(
    profile?.learning_level || 'Beginner'
  );
  const [selectedInterests, setSelectedInterests] =
    useState<string[]>(profile?.interests || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  /**
   * Handles file selection, validates the 2MB size limit,
   * and triggers the upload action.
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Check file size (2MB Limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', {
        description:
          'The selected file is larger than 2MB. Please choose a smaller image.',
      });
      if (fileInputRef.current)
        fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const newUrl = await uploadAvatar(formData);
      setAvatarUrl(newUrl);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Removes the avatar and reverts to the default icon.
   */
  const handleRemoveAvatar = async () => {
    if (
      !confirm(
        'Are you sure you want to remove your profile picture?'
      )
    )
      return;

    setIsUploading(true);
    try {
      await removeAvatar();
      setAvatarUrl(null);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Saves all text-based profile changes.
   */
  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Changes saved successfully!');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      action={handleSave}
      className="max-w-2xl mx-auto space-y-6 pb-20"
    >
      <h2 className="text-4xl font-bold text-[#151313] mb-8">
        Settings
      </h2>

      {/* Account Settings */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#fccc42] flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-[#151313]" />
          </div>
          <h3 className="text-2xl font-bold text-[#151313]">
            Account Settings
          </h3>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-4">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#be94f5] to-[#ff5734] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full disabled:cursor-not-allowed"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="px-6 py-2 bg-[#fccc42] text-[#151313] font-semibold rounded-full hover:bg-[#f4b91a] transition-colors text-sm disabled:opacity-50"
                  >
                    {isUploading
                      ? 'Processing...'
                      : 'Change Photo'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleRemoveAvatar}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG, GIF or WebP. Max size of 2MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-2">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              defaultValue={profile?.full_name}
              className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#fccc42] font-semibold outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-2">
              Email
            </label>
            <input
              type="email"
              disabled
              value={email || ''}
              className="w-full px-6 py-3 rounded-full border-2 border-gray-100 bg-gray-50 text-gray-400 font-semibold cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#be94f5] flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#151313]">
            Preferences
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-3">
              Language
            </label>
            <select
              name="language"
              defaultValue={
                profile?.preferred_language || 'English'
              }
              className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#fccc42] font-semibold bg-white outline-none"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Hindi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-3">
              Learning Level
            </label>
            <input
              type="hidden"
              name="learningLevel"
              value={learningLevel}
            />
            <div className="grid grid-cols-3 gap-4">
              {['Beginner', 'Intermediate', 'Advanced'].map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setLearningLevel(level)}
                    className={cn(
                      'px-4 py-3 rounded-full font-semibold transition-all',
                      learningLevel === level
                        ? 'bg-[#fccc42] text-[#151313]'
                        : 'bg-gray-100 text-[#151313] hover:bg-gray-200'
                    )}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#151313] mb-3">
              Interests
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                'Web Dev',
                'Design',
                'Python',
                'Leadership',
                'Data Science',
              ].map((interest) => (
                <div key={interest}>
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    checked={selectedInterests.includes(
                      interest
                    )}
                    className="hidden"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      'px-4 py-2 rounded-full font-semibold transition-colors',
                      selectedInterests.includes(interest)
                        ? 'bg-[#fccc42] text-[#151313]'
                        : 'bg-gray-100 text-[#151313] hover:bg-[#fccc42]/20'
                    )}
                  >
                    {interest}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-red-200">
        <h3 className="text-2xl font-bold text-[#151313] mb-6">
          Danger Zone
        </h3>
        <div className="space-y-4">
          <button
            type="button"
            onClick={async () => {
              if (
                confirm(
                  'Are you sure you want to delete your account? This cannot be undone.'
                )
              ) {
                await deleteAccountAction();
              }
            }}
            className="w-full px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-full hover:bg-red-200 transition-colors text-center"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Save and Logout */}
      <div className="flex gap-4 justify-center pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            'px-8 py-3 bg-[#fccc42] text-[#151313] font-bold rounded-full transition-all text-lg shadow-lg',
            isSaving
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-[#f4b91a]'
          )}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="px-8 py-3 bg-[#151313] text-white font-bold rounded-full hover:bg-[#2a2828] transition-colors flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </form>
  );
}
