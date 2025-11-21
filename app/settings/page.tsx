'use client';

import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Bell, Globe, Lock, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-[#151313] mb-8">Settings</h2>

            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#fccc42] flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-[#151313]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#151313]">Account Settings</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#151313] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Kacie Velasquez"
                      className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#fccc42] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#151313] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="kacie@example.com"
                      className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#fccc42] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#151313] mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#be94f5] to-[#ff5734]" />
                      <button className="px-6 py-2 bg-[#fccc42] text-[#151313] font-semibold rounded-full hover:bg-[#f4b91a] transition-colors">
                        Change Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#be94f5] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#151313]">Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#151313] mb-3">
                      Language
                    </label>
                    <select className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#fccc42] font-semibold bg-white">
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
                    <div className="grid grid-cols-3 gap-4">
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <button
                          key={level}
                          className={cn(
                            'px-4 py-3 rounded-full font-semibold transition-all',
                            level === 'Beginner'
                              ? 'bg-[#fccc42] text-[#151313]'
                              : 'bg-gray-100 text-[#151313] hover:bg-gray-200'
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#151313] mb-3">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['Web Dev', 'Design', 'Python', 'Leadership', 'Data Science'].map(
                        (interest) => (
                          <button
                            key={interest}
                            className="px-4 py-2 bg-gray-100 text-[#151313] rounded-full font-semibold hover:bg-[#fccc42] transition-colors"
                          >
                            {interest}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#a8d8ea] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#151313]">Notifications</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Course Updates', enabled: true },
                    { label: 'New Lessons', enabled: true },
                    { label: 'Weekly Summary', enabled: false },
                    { label: 'Community Messages', enabled: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="font-semibold text-[#151313]">{item.label}</span>
                      <button
                        className={cn(
                          'w-12 h-6 rounded-full transition-all',
                          item.enabled ? 'bg-[#fccc42]' : 'bg-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full bg-white transition-transform',
                            item.enabled ? 'translate-x-6' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#be94f5] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#151313]">Privacy & Security</h3>
                </div>

                <div className="space-y-4">
                  <button className="w-full px-6 py-3 bg-gray-100 text-[#151313] font-semibold rounded-full hover:bg-gray-200 transition-colors text-left">
                    Change Password
                  </button>
                  <button className="w-full px-6 py-3 bg-gray-100 text-[#151313] font-semibold rounded-full hover:bg-gray-200 transition-colors text-left">
                    Two-Factor Authentication
                  </button>
                  <button className="w-full px-6 py-3 bg-gray-100 text-[#151313] font-semibold rounded-full hover:bg-gray-200 transition-colors text-left">
                    Manage Connected Apps
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-red-200">
                <h3 className="text-2xl font-bold text-[#151313] mb-6">Danger Zone</h3>

                <div className="space-y-4">
                  <button className="w-full px-6 py-3 bg-gray-100 text-[#151313] font-semibold rounded-full hover:bg-gray-200 transition-colors">
                    Download Your Data
                  </button>
                  <button className="w-full px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-full hover:bg-red-200 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Save and Logout */}
              <div className="flex gap-4 justify-center pt-4">
                <button className="px-8 py-3 bg-[#fccc42] text-[#151313] font-bold rounded-full hover:bg-[#f4b91a] transition-colors text-lg">
                  Save Changes
                </button>
                <button className="px-8 py-3 bg-[#151313] text-white font-bold rounded-full hover:bg-[#2a2828] transition-colors flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
