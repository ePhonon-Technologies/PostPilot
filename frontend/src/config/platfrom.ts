// src/config/platform.ts
import {
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaInstagram,
} from 'react-icons/fa6';
import type { SocialPlatform } from '../types/socialAccounts';

export interface PlatformConfig {
  key: SocialPlatform;
  label: string;
  color: string; // Brand color for buttons
  connectPath: string; // OAuth connect route
  // UI Metadata integrated directly here:
  handle: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  maxChars: number;
}

export const PLATFORM_CONFIG: Record<SocialPlatform, PlatformConfig> = {
  LINKEDIN: {
    key: 'LINKEDIN',
    label: 'LinkedIn',
    color: '#0A66C2',
    connectPath: '/auth/linkedin/connect',
    handle: '',
    icon: FaLinkedin,
    textColor: 'text-blue-600',
    maxChars: 3000,
  },
  TWITTER: {
    key: 'TWITTER',
    label: 'X / Twitter',
    color: '#000000',
    connectPath: '/auth/twitter/connect',
    handle: '',
    icon: FaXTwitter,
    textColor: 'text-gray-900',
    maxChars: 280,
  },
  FACEBOOK: {
    key: 'FACEBOOK',
    label: 'Facebook',
    color: '#1877F2',
    connectPath: '/auth/facebook/connect',
    handle: '',
    icon: FaFacebook,
    textColor: 'text-blue-500',
    maxChars: 63206,
  },
  INSTAGRAM: {
    key: 'INSTAGRAM',
    label: 'Instagram',
    color: '#E4405F',
    connectPath: '/auth/instagram/connect',
    handle: '',
    icon: FaInstagram,
    textColor: 'text-pink-600',
    maxChars: 2200,
  },
};

// Enabled platforms list for iteration across components
export const SOCIAL_PLATFORMS = Object.keys(
  PLATFORM_CONFIG,
) as SocialPlatform[];

// Re-export ACCOUNTS array directly for form selectors
export const ACCOUNTS = Object.values(PLATFORM_CONFIG);
