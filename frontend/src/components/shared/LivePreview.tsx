// src/components/create-post/LivePreview.tsx
import React from 'react';
import { LuGlobe } from 'react-icons/lu';
import { PLATFORM_CONFIG } from '../../config/platfrom';
import { useAppSelector } from '../../store/hook';
import { selectAllSocialAccounts } from '../../store/slices/socialAccountSlice';
import type { MediaItem, SocialPlatform } from '../../types/socialAccounts';
import Avatar from './Avatar';
import Button from './Button';

interface LivePreviewProps {
  selectedPlatforms: string[];
  previewTab: string;
  content: string;
  media: MediaItem[];
  onTabChange: (tab: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  selectedPlatforms,
  previewTab,
  content,
  media,
  onTabChange,
}) => {
  const currentPlatform = PLATFORM_CONFIG[previewTab as SocialPlatform];

  // Fetch connected accounts from Redux store
  const allAccounts = useAppSelector(selectAllSocialAccounts);

  // Find the connected account corresponding to the active preview tab
  const activeAccount = allAccounts.find(
    (account) => account.platform === previewTab,
  );

  // Fallback name and avatar if no account is connected yet
  const accountName = activeAccount?.accountName || `${currentPlatform?.label || 'Social'} User`;
  const avatarUrl = activeAccount?.avatarUrl;

  return (
    <div className='lg:col-span-5 space-y-4'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
          Live Post Preview
        </span>

        <div className='flex gap-1 bg-gray-200 p-1 rounded-xl'>
          {selectedPlatforms.map((p) => {
            const config = PLATFORM_CONFIG[p as SocialPlatform];
            if (!config) return null;
            return (
              <Button
                type='button'
                key={p}
                Icon={config.icon}
                iconClassName={`w-4 h-4 shrink-0 ${config.textColor}`}
                onClick={() => onTabChange(p)}
                className={`p-2 rounded-lg transition ${
                  previewTab === p
                    ? 'bg-white shadow-sm'
                    : 'opacity-50 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className='bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4'>
        {/* Author Header */}
        <div className='flex items-center gap-3'>
          <Avatar name={accountName} src={avatarUrl} background='bg-blue-700'/>
          <div>
            <h4 className='text-sm font-bold text-gray-900'>{accountName}</h4>
            {currentPlatform?.handle  && <div className='flex items-center gap-1 text-xs text-gray-400'>
              <span>{currentPlatform?.handle}</span>
              <span>•</span>
              <LuGlobe className='w-3 h-3' />
            </div>}
          </div>
        </div>

        {/* Post Text Content */}
        <p className='text-sm text-gray-800 whitespace-pre-wrap min-h-[80px]'>
          {content || (
            <span className='text-gray-400 italic'>
              Your post preview will show up here...
            </span>
          )}
        </p>

        {/* Scrollable Media Container */}
        {media.length > 0 && (
          <div className='relative'>
            <div className='flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
              {media.map((m, i) => (
                <div
                  key={i}
                  className={`snap-center shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 ${
                    media.length === 1 ? 'w-full' : 'w-64'
                  }`}
                >
                  <img
                    src={m.previewUrl}
                    alt={`Attachment preview ${i + 1}`}
                    className='w-full h-48 object-cover'
                  />
                </div>
              ))}
            </div>

            {/* Subtle item counter badge for multiple items */}
            {media.length > 1 && (
              <span className='absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none'>
                {media.length} items
              </span>
            )}
          </div>
        )}

        {/* Platform Footer */}
        <div className='pt-3 border-t border-gray-100 text-center text-xs text-gray-400'>
          Rendering live {currentPlatform?.label} layout
        </div>
      </div>
    </div>
  );
};