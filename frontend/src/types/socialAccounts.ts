export type SocialPlatform = 'LINKEDIN' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM';
import type { IconType } from 'react-icons';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  externalId: string;
  isActive: boolean;
  expiresAt: string | null;
}

export interface UseSocialAccountResult {
  accounts: SocialAccount[];
  loading: boolean;
  statusMessage: string | null;
  connect: () => void;
  disconnect: (accountId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface MediaItem {
  file: File;
  previewUrl: string;
}

export type PublishMode = 'now' | 'schedule' | 'draft';


export interface ScheduledPost {
  id: string;
  platforms: SocialPlatform[];
  content: string;
  scheduledTime: string;
  status: PublishMode;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: IconType;
  iconBg: string;
}


export interface AccountHealthItemProps {
  name: string;
  handle: string;
  status: 'healthy' | 'expired' | string;
  icon: IconType;
  iconColor: string;
}
