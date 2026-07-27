// useOAuthStatusMessage.ts — thin, local-only, NOT in Redux
import { useState, useEffect } from 'react';
import { PLATFORM_CONFIG } from '../config/platfrom';
import type { SocialPlatform } from '../types/socialAccounts';

export function useOAuthStatusMessage(platform: SocialPlatform) {
  const config = PLATFORM_CONFIG[platform];

  const [statusMessage, setStatusMessage] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get(platform.toLowerCase());
    const reason = params.get('reason');
    if (status === 'connected')
      return `✅ ${config.label} connected successfully.`;
    if (status === 'error')
      return `❌ ${config.label} connection failed: ${reason ?? 'unknown error'}`;
    return null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramKey = platform.toLowerCase();
    if (!params.has(paramKey)) return;
    params.delete(paramKey);
    params.delete('reason');
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }, [platform]);

  return { statusMessage, setStatusMessage };
}
