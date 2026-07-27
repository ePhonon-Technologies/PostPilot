// src/components/settings/ConnectionsSettings.tsx
import { useEffect } from 'react';
import { LuLayers, LuInfo, LuCircleCheck, LuCirclePlus } from 'react-icons/lu';
import SocialConnectionCard from '../../components/socialConnection/SocialConnectionCard';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import {
  fetchSocialAccounts,
  selectAllSocialAccounts,
} from '../../store/slices/socialAccountSlice';
import type { SocialPlatform } from '../../types/socialAccounts';
import { SOCIAL_PLATFORMS } from '../../config/platfrom';

export default function ConnectionsSettings() {
  const dispatch = useAppDispatch();
  const connectedAccounts = useAppSelector(selectAllSocialAccounts);

  useEffect(() => {
    dispatch(fetchSocialAccounts());
  }, [dispatch]);

  // Derive connected vs available platform types
  const connectedPlatforms = Array.from(
    new Set(connectedAccounts.map((acc) => acc.platform as SocialPlatform)),
  );

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (platform) => !connectedPlatforms.includes(platform),
  );

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='flex items-start justify-between pb-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-blue-50 text-blue-600 rounded-xl'>
            <LuLayers className='w-5 h-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Connect Accounts
            </h2>
            <p className='text-xs text-gray-500'>
              Manage social channels for seamless publishing and scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className='flex items-center gap-2 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-700'>
        <LuInfo className='w-4 h-4 shrink-0 text-blue-500' />
        <span>
          PostPilot requires publish permissions to post on your behalf. You can
          revoke access at any time.
        </span>
      </div>

      {/* SECTION 1: CONNECTED / ACTIVE CHANNELS */}
      {connectedPlatforms.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider'>
            <LuCircleCheck className='w-4 h-4 text-emerald-500' />
            <span>Active Channels ({connectedPlatforms.length})</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {connectedPlatforms.map((platform) => (
              <SocialConnectionCard key={platform} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: AVAILABLE / DISCONNECTED CHANNELS */}
      {availablePlatforms.length > 0 && (
        <div className='space-y-3 pt-2'>
          <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
            <LuCirclePlus className='w-4 h-4 text-gray-400' />
            <span>Available Platforms ({availablePlatforms.length})</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {availablePlatforms.map((platform) => (
              <SocialConnectionCard key={platform} platform={platform} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}