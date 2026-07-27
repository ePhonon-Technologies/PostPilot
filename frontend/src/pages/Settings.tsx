// src/pages/Settings.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { LuUser, LuBell, LuShieldCheck, LuSave, LuKey } from 'react-icons/lu';
import { FaUserCog } from 'react-icons/fa';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import ConnectionsSettings from './connection/ConnectionSettings';

// Import your custom Accounts component here
// import AccountsComponent from '../components/settings/AccountsComponent';

// 1. Add 'accounts' to TabType union
type TabType = 'profile' | 'api' | 'notifications' | 'accounts';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    company: 'PostPilot HQ',
    timezone: 'UTC-05:00 (Eastern Time)',
  });

  const [apiKeys, setApiKeys] = useState({
    openaiKey: 'sk-proj-••••••••••••••••••••••••',
    linkedInAppId: '8642910482910',
    twitterApiKey: '••••••••••••••••••••••••',
  });

  const [notifications, setNotifications] = useState({
    emailOnPublishSuccess: true,
    emailOnPublishFailure: true,
    weeklyReport: false,
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='h-auto bg-gray-50 text-gray-900 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Settings</h1>
          <p className='text-sm text-gray-500'>
            Manage your account details, workspace preferences, and platform
            integrations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto'>
          <Button
            type='button'
            onClick={() => setActiveTab('profile')}
            Icon={LuUser}
            iconClassName='w-4 h-4'
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Profile & Workspace
          </Button>

          <Button
            type='button'
            onClick={() => setActiveTab('api')}
            Icon={LuKey}
            iconClassName='w-4 h-4'
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'api'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            API & Keys
          </Button>

          <Button
            type='button'
            onClick={() => setActiveTab('notifications')}
            Icon={LuBell}
            iconClassName='w-4 h-4'
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Notifications
          </Button>

          {/* 2. Fixed onClick target to 'accounts' */}
          <Button
            type='button'
            onClick={() => setActiveTab('accounts')}
            Icon={FaUserCog}
            iconClassName='w-4 h-4'
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'accounts'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Accounts
          </Button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSaveSettings} className='space-y-6'>
          {/* TAB 1: PROFILE & WORKSPACE */}
          {activeTab === 'profile' && (
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5'>
              <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800'>
                <LuUser className='text-blue-500' /> Account Details
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    Full Name
                  </label>
                  <Input
                    type='text'
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    Email Address
                  </label>
                  <Input
                    type='email'
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    Company / Organization
                  </label>
                  <Input
                    type='text'
                    value={profile.company}
                    onChange={(e) =>
                      setProfile({ ...profile, company: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      setProfile({ ...profile, timezone: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white'
                  >
                    <option value='UTC-05:00 (Eastern Time)'>
                      UTC-05:00 (Eastern Time)
                    </option>
                    <option value='UTC+00:00 (London)'>
                      UTC+00:00 (London)
                    </option>
                    <option value='UTC+05:30 (India Standard Time)'>
                      UTC+05:30 (India Standard Time)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API & PLATFORM KEYS */}
          {activeTab === 'api' && (
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5'>
              <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800'>
                <LuShieldCheck className='text-blue-500' /> Platform Integration
                Credentials
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    OpenAI API Key (For AI Toolbar)
                  </label>
                  <Input
                    type='password'
                    value={apiKeys.openaiKey}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, openaiKey: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                    LinkedIn App Client ID
                  </label>
                  <Input
                    type='text'
                    value={apiKeys.linkedInAppId}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, linkedInAppId: e.target.value })
                    }
                    className='w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono'
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5'>
              <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800'>
                <LuBell className='text-blue-500' /> Email Notifications
              </h2>

              <div className='space-y-4'>
                <label className='flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer'>
                  <span className='text-sm font-medium text-gray-700'>
                    Email me when a scheduled post publishes successfully
                  </span>
                  <Input
                    type='checkbox'
                    checked={notifications.emailOnPublishSuccess}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailOnPublishSuccess: e.target.checked,
                      })
                    }
                    className='w-4 h-4 text-blue-600 rounded'
                  />
                </label>

                <label className='flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer'>
                  <span className='text-sm font-medium text-gray-700'>
                    Alert me immediately if a social post fails to publish
                  </span>
                  <Input
                    type='checkbox'
                    checked={notifications.emailOnPublishFailure}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailOnPublishFailure: e.target.checked,
                      })
                    }
                    className='w-4 h-4 text-blue-600 rounded'
                  />
                </label>
              </div>
            </div>
          )}

          {/* 3. TAB 4: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5'>
              <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800'>
                <FaUserCog className='text-blue-500' /> Connected Social
                Accounts
              </h2>

              {/* Replace this div with your custom Accounts component */}
              {/* <AccountsComponent /> */}
              <ConnectionsSettings />
            </div>
          )}

          {/* Hide save bar on accounts tab if you manage connections separately */}
          {activeTab !== 'accounts' && (
            <div className='flex justify-end pt-2'>
              <Button
                type='submit'
                disabled={isSaving}
                loading={isSaving}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl shadow-sm transition disabled:opacity-50'
              >
                <LuSave className='w-4 h-4' />
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
