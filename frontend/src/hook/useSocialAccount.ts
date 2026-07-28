// src/hooks/useOAuthStatusMessage.ts
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PLATFORM_CONFIG } from '../config/platfrom';
import type { SocialPlatform } from '../types/socialAccounts';

export function useOAuthStatusMessage(platform: SocialPlatform) {
  const config = PLATFORM_CONFIG[platform];

  // Derive initial OAuth status directly from URL params
  const { status, reason } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const paramKey = platform.toLowerCase();
    return {
      status: params.get(paramKey),
      reason: params.get('reason'),
    };
  }, [platform]);

  const isAuthorized = status === 'authorized' || status === 'connected';

  // Trigger toast notification and clean up URL query params
  useEffect(() => {
    if (!status) return;

    if (isAuthorized) {
      toast.success(`✅ ${config.label} connected successfully.`);
    } else if (status === 'error') {
      toast.error(`❌ ${config.label} connection failed: ${reason ?? 'unknown error'}`);
    }

    const params = new URLSearchParams(window.location.search);
    params.delete(platform.toLowerCase());
    params.delete('reason');
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }, [status, isAuthorized, platform, config.label, reason]);

  return { isAuthorized };
}