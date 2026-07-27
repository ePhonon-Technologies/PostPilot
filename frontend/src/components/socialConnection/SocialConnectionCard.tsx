// src/components/socialConnection/SocialConnectionCard.tsx
import { useEffect, useMemo } from 'react';
import { LuPlus, LuTrash2, LuTriangleAlert } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { PLATFORM_CONFIG } from '../../config/platfrom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import {
  disconnectSocialAccount,
  selectAllSocialAccounts,
} from '../../store/slices/socialAccountSlice';
import type { SocialAccount, SocialPlatform } from '../../types/socialAccounts';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

interface SocialConnectionCardProps {
  platform: SocialPlatform;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SocialConnectionCard({
  platform,
}: SocialConnectionCardProps) {
  const dispatch = useAppDispatch();
  const allAccounts = useAppSelector(selectAllSocialAccounts);
  const loading = useAppSelector((state) => state.socialAccounts.loading);

  const config = PLATFORM_CONFIG[platform];

  const accounts = useMemo(
    () =>
      allAccounts.filter(
        (account: SocialAccount) => account.platform === platform,
      ),
    [allAccounts, platform],
  );

  const isConnected = accounts.length > 0;

  const handleDisconnect = async (id: string) => {
    try {
      await dispatch(disconnectSocialAccount(id)).unwrap();
      toast.success(`${config.label} account disconnected successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to disconnect ${config.label} account`);
    }
  };

  const handleConnect = () => {
    toast.info(`Redirecting to ${config.label}...`);
    setTimeout(() => {
      window.location.href = `${API_URL}${config.connectPath}`;
    }, 400);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providerKey = config.key.toLowerCase();
    const status = params.get(providerKey);

    if (!status) return;

    if (status === 'connected') {
      toast.success(`${config.label} account connected successfully!`);
    } else if (status === 'error' || status === 'failed') {
      toast.error(`Failed to connect ${config.label} account.`);
    }

    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }, [config, config.label]);

  return (
    <div className='flex flex-col gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs h-full justify-between'>
      <div>
        {/* Header Row */}
        <div className='flex items-center justify-between gap-2 mb-2'>
          <h3 className='text-sm font-semibold text-gray-800'>
            {config.label}
          </h3>

          <Button
            type='button'
            onClick={handleConnect}
            Icon={LuPlus}
            iconClassName='w-3.5 h-3.5'
            className='px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 shrink-0'
          >
            {/* FIX 1: Change label dynamically */}
            {isConnected ? 'Add Account' : `Connect ${config.label}`}
          </Button>
        </div>

        {/* Account Items List */}
        <div className='pt-0.5'>
          {loading ? (
            <div className='py-2 flex justify-center'>
              <Spinner />
            </div>
          ) : isConnected ? (
            <ul className='space-y-1.5 pt-1 border-t border-gray-100'>
              {accounts.map((account: SocialAccount) => (
                <li
                  key={account.id}
                  className='flex items-center justify-between p-2 rounded-lg bg-gray-50/80 hover:bg-gray-100/60 transition-colors'
                >
                  <div className='min-w-0 pr-2'>
                    <p className='text-xs font-medium text-gray-800 truncate'>
                      {account.accountName}
                    </p>
                    <div className='flex items-center gap-1 text-[10px] text-gray-400 leading-tight'>
                      {account.isActive ? (
                        <span className='text-emerald-600 font-medium'>
                          Active
                        </span>
                      ) : (
                        <span className='flex items-center gap-0.5 text-amber-600 font-medium'>
                          <LuTriangleAlert className='w-3 h-3' /> Reconnect
                          needed
                        </span>
                      )}

                      {account.expiresAt &&
                        ` — expires ${new Date(
                          account.expiresAt,
                        ).toLocaleDateString()}`}
                    </div>
                  </div>

                  {/* Trash Icon Disconnect Button */}
                  <button
                    type='button'
                    onClick={() => handleDisconnect(account.id)}
                    title={`Disconnect ${account.accountName}`}
                    className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0'
                  >
                    <LuTrash2 className='w-3.5 h-3.5' />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-xs text-gray-400 italic pt-1'>
              No {config.label} account connected yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
