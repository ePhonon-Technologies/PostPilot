import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { PLATFORM_CONFIG } from '../../config/platfrom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import {
  disconnectProviderConnection,
  disconnectSocialAccount,
  fetchProviderConnections,
  fetchSocialAccounts,
  selectAllSocialAccounts,
  selectProviderConnections,
} from '../../store/slices/socialAccountSlice';

import FacebookModelPage from '../facebook/facebookModelPage';
import SocialAccountList from './SocialAccountList';
import SocialConnectionHeader from './SocialConnectionHeader';
import EmptyState from './EmptyState';
import type { SocialPlatform } from '../../types/socialAccounts';
import { useOAuthStatusMessage } from '../../hook/useSocialAccount';

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  platform: SocialPlatform;
}

export default function SocialConnectionCard({ platform }: Props) {
  const dispatch = useAppDispatch();
  const config = PLATFORM_CONFIG[platform];

  const allAccounts = useAppSelector(selectAllSocialAccounts);
  const providerConnections = useAppSelector(selectProviderConnections);
  const loading = useAppSelector((state) => state.socialAccounts.loading);
  const { isAuthorized: justAuthorizedFromOAuth } = useOAuthStatusMessage(platform);

  const [pageModalOpen, setPageModalOpen] = useState(false);

  // Fetch accounts & provider connections on component mount
  useEffect(() => {
    dispatch(fetchSocialAccounts());
    dispatch(fetchProviderConnections());
  }, [dispatch]);

  const accounts = useMemo(
    () => allAccounts.filter((a) => a.platform === platform),
    [allAccounts, platform],
  );

  // Check if platform requires a modal step after OAuth
  const requiresPageSelection = platform === 'FACEBOOK';

  // Check if current platform has active OAuth provider connection in database
  const isAuthorizedInDb = providerConnections.some(
    (conn) => conn.platform === platform,
  );

  // Auto-open page selector modal upon OAuth redirect return
  useEffect(() => {
    if (requiresPageSelection && justAuthorizedFromOAuth) {
      queueMicrotask(() => {
        setPageModalOpen(true);
      });
    }
  }, [requiresPageSelection, justAuthorizedFromOAuth]);

  // Primary Action Button (+ Add Page / + Connect Platform)
  const handleConnect = () => {
    if (requiresPageSelection && isAuthorizedInDb) {
      setPageModalOpen(true);
      return;
    }

    toast.info(`Redirecting to ${config.label}...`);
    setTimeout(() => {
      window.location.assign(`${API_URL}${config.connectPath}`);
    }, 500);
  };

  // Re-trigger OAuth flow (Force re-authorization / switch accounts)
  const handleReconnect = () => {
    toast.info(`Reconnecting to ${config.label}...`);
    setTimeout(() => {
      window.location.assign(`${API_URL}${config.connectPath}?reauth=true`);
    }, 500);
  };

  // Delete individual connected account/page
  const handleDisconnect = async (id: string) => {
    try {
      await dispatch(disconnectSocialAccount(id)).unwrap();
      toast.success('Disconnected account');
    } catch {
      toast.error('Failed to disconnect account');
    }
  };

  // Disconnect provider authorization for ANY platform (e.g., LinkedIn, X, Facebook)
  const handleDisconnectProvider = async () => {
    if (!confirm(`Are you sure you want to disconnect ${config.label}?`)) return;

    try {
      await dispatch(disconnectProviderConnection(platform)).unwrap();
      toast.success(`${config.label} disconnected`);
    } catch {
      toast.error(`Failed to disconnect ${config.label}`);
    }
  };

  return (
    <>
      <div className='rounded-xl border bg-white p-4'>
        <SocialConnectionHeader
          platform={platform}
          connected={accounts.length > 0}
          isAuthorized={isAuthorizedInDb}
          onConnect={handleConnect}
          onReconnect={handleReconnect}
          onDisconnectProvider={handleDisconnectProvider}
        />

        {loading ? (
          <div className='py-8 text-center text-gray-500'>Loading...</div>
        ) : accounts.length ? (
          <SocialAccountList
            accounts={accounts}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <EmptyState platform={platform} />
        )}
      </div>

      {platform === 'FACEBOOK' && (
        <FacebookModelPage
          open={pageModalOpen}
          onClose={() => setPageModalOpen(false)}
        />
      )}
    </>
  );
}