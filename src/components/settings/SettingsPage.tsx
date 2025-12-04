'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
  User,
  Mail,
  Phone,
  Camera,
  Key,
  Bell,
  Shield,
  Globe,
  Save,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { notificationService } from '@/services/notification.service';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatar: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await axiosInstance.get('api/users/profile');
      return response.data.data as UserProfile;
    },
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; avatar?: File }) => {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await axiosInstance.put('api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success('Profile updated successfully');
      setUser(data.data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosInstance.post('api/users/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const [notificationsPage, setNotificationsPage] = useState(1);
  const notificationsLimit = 20;

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['all-notifications', notificationsPage],
    queryFn: () => notificationService.getNotifications(notificationsPage, notificationsLimit),
    enabled: selectedTab === 'notifications',
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      // Reset to page 1 if current page becomes empty
      if (notificationsData && notificationsData.notifications.length === 1 && notificationsPage > 1) {
        setNotificationsPage(1);
      }
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    updateProfileMutation.mutate({
      firstName: firstName || profile?.firstName || '',
      lastName: lastName || profile?.lastName || '',
      avatar: file,
    });
    setUploadingAvatar(false);
  };

  const handleSaveProfile = () => {
    if (!firstName || !lastName) {
      toast.error('First name and last name are required');
      return;
    }

    updateProfileMutation.mutate({
      firstName,
      lastName,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="my-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTab(tab.id as any);
                if (tab.id === 'notifications') {
                  setNotificationsPage(1);
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {selectedTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex flex-col flex items-center justify-center h-full gap-3">
                <div className="relative">
                  {profile?.avatar ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image src={profile.avatar} alt="Avatar" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-fit">
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <div className="relative w-full">
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
                      {profile?.emailVerified ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-600 text-xs">
                          <XCircle className="w-4 h-4" />
                          Unverified
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <div className="relative w-full">
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
                      {profile?.phoneVerified ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-600 text-xs">
                          <XCircle className="w-4 h-4" />
                          Unverified
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {selectedTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {selectedTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Notifications
                {notificationsData && notificationsData.unreadCount > 0 && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    {notificationsData.unreadCount} unread
                  </span>
                )}
              </h2>
              {notificationsData && notificationsData.notifications.length > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>

            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notificationsData && notificationsData.notifications.length > 0 ? (
              <>
                <div className="space-y-2">
                  {notificationsData.notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        !notification.isRead
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-white border-gray-200'
                      } hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                className="text-primary hover:underline"
                              >
                                View details →
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {notificationsData.pagination && notificationsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {(notificationsPage - 1) * notificationsLimit + 1} to{' '}
                      {Math.min(notificationsPage * notificationsLimit, notificationsData.pagination.total)} of{' '}
                      {notificationsData.pagination.total} notifications
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setNotificationsPage((prev) => Math.max(1, prev - 1))}
                        disabled={notificationsPage === 1 || notificationsLoading}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {notificationsPage} of {notificationsData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setNotificationsPage((prev) => prev + 1)}
                        disabled={notificationsPage >= notificationsData.pagination.totalPages || notificationsLoading}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  You'll be notified about important updates here
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'preferences' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Preferences
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Coming soon - Configure your app preferences
          </p>
        </div>
      )}
    </div>
  );
}

