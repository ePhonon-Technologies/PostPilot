import React, { useState } from 'react';

// 1. UI Icons from Lucide (via react-icons/lu)
import {
  LuCalendar,
  LuSend,
  LuEye,
  LuTrendingUp,
  LuPlus,
  LuSparkles,
  LuMoveVertical,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuArrowUpRight,
  LuChevronDown,
  LuBell,
} from 'react-icons/lu';

// 2. Social Brand Logos (via react-icons/fa6)
import { FaLinkedin, FaXTwitter, FaInstagram } from 'react-icons/fa6';
import type { AccountHealthItemProps, MetricCardProps, ScheduledPost } from '../types/socialAccounts';

// Types for scheduled posts

const UPCOMING_POSTS: ScheduledPost[] = [
  {
    id: '1',
    platforms: ['TWITTER', 'LINKEDIN'],
    content:
      '🚀 Excited to announce our new PostPilot feature update! Seamless cross-posting across 5+ social platforms in seconds.',
    scheduledTime: 'Today at 5:30 PM',
    status: 'schedule',
  },
  {
    id: '2',
    platforms: ['INSTAGRAM'],
    content:
      '5 key metrics every social media manager should track in 2026 📈 #SocialMediaTips #Growth',
    scheduledTime: 'Tomorrow at 9:00 AM',
    status: 'schedule',
  },
  {
    id: '3',
    platforms: ['TWITTER'],
    content:
      'What is your favorite productivity hack when creating weekly content? Drop your thoughts below 👇',
    scheduledTime: 'Jul 24 at 2:15 PM',
    status: 'draft',
  },
];

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [workspace] = useState('Acme Marketing Agency');

  const handleAiDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    alert(`Generating post ideas for: "${prompt}"`);
    setPrompt('');
  };

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 space-y-8'>
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <header className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 px-3.5 py-2 rounded-xl hover:bg-gray-200 transition'>
            <span>{workspace}</span>
            <LuChevronDown className='w-4 h-4 text-gray-500' />
          </button>
          <span className='hidden sm:inline text-sm text-gray-400'>|</span>
          <p className='text-sm text-gray-500 hidden lg:block'>
            Welcome back! Here is your social performance overview.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button className='p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 relative transition'>
            <LuBell className='w-5 h-5 text-gray-600' />
            <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full'></span>
          </button>

          <button className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition'>
            <LuPlus className='w-5 h-5' />
            <span>Create Post</span>
          </button>
        </div>
      </header>

      {/* 2. KPI METRICS CARDS */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        <MetricCard
          title='Queued Posts'
          value='12'
          change='3 going out today'
          icon={LuCalendar}
          iconBg='bg-blue-100 text-blue-600'
        />
        <MetricCard
          title='Published (30d)'
          value='48'
          change='+15% vs last month'
          icon={LuSend}
          iconBg='bg-emerald-100 text-emerald-600'
        />
        <MetricCard
          title='Total Reach'
          value='24.5K'
          change='+8.2% impressions'
          icon={LuEye}
          iconBg='bg-purple-100 text-purple-600'
        />
        <MetricCard
          title='Avg. Engagement'
          value='4.2%'
          change='+0.6% standard rate'
          icon={LuTrendingUp}
          iconBg='bg-amber-100 text-amber-600'
        />
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* LEFT COLUMN: UPCOMING QUEUE & ANALYTICS */}
        <div className='lg:col-span-2 space-y-8'>
          {/* UPCOMING POSTS QUEUE */}
          <section className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-bold text-gray-900'>
                  Upcoming Queue
                </h3>
                <p className='text-sm text-gray-500'>
                  Scheduled content ready for deployment
                </p>
              </div>
              <button className='text-sm font-medium text-blue-600 hover:underline flex items-center gap-1'>
                View Calendar <LuArrowUpRight className='w-4 h-4' />
              </button>
            </div>

            <div className='space-y-4'>
              {UPCOMING_POSTS.map((post) => (
                <div
                  key={post.id}
                  className='flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition gap-4'
                >
                  <div className='flex items-start gap-3.5'>
                    <div className='flex gap-1.5 pt-1'>
                      {post.platforms.includes('LINKEDIN') && (
                        <div className='p-1.5 bg-blue-100 text-blue-700 rounded-lg'>
                          <FaLinkedin className='w-4 h-4' />
                        </div>
                      )}
                      {post.platforms.includes('TWITTER') && (
                        <div className='p-1.5 bg-gray-100 text-gray-900 rounded-lg'>
                          <FaXTwitter className='w-4 h-4' />
                        </div>
                      )}
                      {post.platforms.includes('INSTAGRAM') && (
                        <div className='p-1.5 bg-pink-100 text-pink-600 rounded-lg'>
                          <FaInstagram className='w-4 h-4' />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className='text-sm text-gray-800 line-clamp-2 font-medium'>
                        "{post.content}"
                      </p>
                      <div className='flex items-center gap-2 mt-2 text-xs text-gray-500'>
                        <LuClock className='w-3.5 h-3.5' />
                        <span>{post.scheduledTime}</span>
                        <span>•</span>
                        <span className='capitalize font-medium text-blue-600'>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-end gap-2 shrink-0'>
                    <button className='px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition'>
                      Edit
                    </button>
                    <button className='p-1.5 text-gray-400 hover:text-gray-600'>
                      <LuMoveVertical className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ANALYTICS SNAPSHOT PLACEHOLDER */}
          <section className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Engagement Growth
              </h3>
              <span className='text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full'>
                +18.4% this week
              </span>
            </div>

            <div className='h-48 w-full bg-gradient-to-t from-blue-50/50 to-transparent rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm'>
              📈 [Recharts or Chart.js line graph renders here]
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ACCOUNTS & QUICK AI CREATOR */}
        <div className='space-y-8'>
          {/* SOCIAL ACCOUNTS HEALTH */}
          <section className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>
              Account Health
            </h3>

            <div className='space-y-3'>
              <AccountHealthItem
                name='Acme LinkedIn'
                handle='company/acme'
                status='healthy'
                icon={FaLinkedin}
                iconColor='text-blue-600'
              />
              <AccountHealthItem
                name='Acme Twitter / X'
                handle='@acmeco'
                status='healthy'
                icon={FaXTwitter}
                iconColor='text-gray-900'
              />
              <AccountHealthItem
                name='Acme Instagram'
                handle='@acme_official'
                status='expired'
                icon={FaInstagram}
                iconColor='text-pink-600'
              />
            </div>
          </section>

          {/* AI QUICK DRAFT WIDGET */}
          <section className='bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/10'>
            <div className='flex items-center gap-2 mb-2'>
              <LuSparkles className='w-5 h-5 text-amber-300' />
              <h3 className='text-lg font-bold'>PostPilot AI Generator</h3>
            </div>
            <p className='text-xs text-blue-100 mb-4'>
              Draft engaging captions instantly with AI tailored for your brand
              persona.
            </p>

            <form onSubmit={handleAiDraft} className='space-y-3'>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. Write a catchy tweet about launching our new SaaS integration...'
                rows={3}
                className='w-full text-sm bg-white/10 placeholder-blue-200 border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-white/50 text-white resize-none'
              />
              <button
                type='submit'
                className='w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2'
              >
                <LuSparkles className='w-4 h-4 text-blue-600' />
                Generate Post Draft
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Metric Card
function MetricCard({ title, value, change, icon: Icon, iconBg }: MetricCardProps) {
  return (
    <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
      <div>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
          {title}
        </p>
        <p className='text-2xl font-bold text-gray-900 mt-1'>
          {value}
        </p>
        <p className='text-xs text-emerald-600 font-medium mt-1'>
          {change}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${iconBg}`}>
        <Icon className='w-6 h-6' />
      </div>
    </div>
  );
}

// Subcomponent: Account Health Row Item
function AccountHealthItem({
  name,
  handle,
  status,
  icon: Icon,
  iconColor,
}: AccountHealthItemProps) {
  return (
    <div className='flex items-center justify-between p-3 rounded-xl border border-gray-100'>
      <div className='flex items-center gap-3'>
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <div>
          <p className='text-sm font-semibold text-gray-800'>
            {name}
          </p>
          <p className='text-xs text-gray-400'>{handle}</p>
        </div>
      </div>

      {status === 'healthy' ? (
        <span className='flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full'>
          <LuCircleCheck className='w-3.5 h-3.5' /> Active
        </span>
      ) : (
        <button className='flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition'>
          <LuCircleAlert className='w-3.5 h-3.5' /> Re-auth
        </button>
      )}
    </div>
  );
}