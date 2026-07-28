import { LuPlus, LuRefreshCw, LuUnlink } from 'react-icons/lu';
import Button from '../shared/Button';
import { PLATFORM_CONFIG } from '../../config/platfrom';
import type { SocialPlatform } from '../../types/socialAccounts';

interface Props {
  platform: SocialPlatform;
  connected: boolean;
  isAuthorized?: boolean;
  onConnect(): void;
  onReconnect?(): void;
  onDisconnectProvider?(): void;
}

export default function SocialConnectionHeader({
  platform,
  connected,
  isAuthorized,
  onConnect,
  onReconnect,
  onDisconnectProvider,
}: Props) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <div className='mb-3 flex items-center justify-between gap-2'>
      <h3 className='font-semibold text-gray-900'>{config.label}</h3>

      <div className='flex items-center gap-1.5'>
        {/* Render Reconnect & Disconnect for ANY authorized platform */}
        {(isAuthorized || connected) && (
          <>
            {onReconnect && (
              <button
                type='button'
                onClick={onReconnect}
                title={`Re-authenticate ${config.label} account`}
                className='flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors'
              >
                <LuRefreshCw className='h-3.5 w-3.5' />
                <span>Reconnect</span>
              </button>
            )}

            {onDisconnectProvider && (
              <button
                type='button'
                onClick={onDisconnectProvider}
                title={`Disconnect ${config.label}`}
                className='flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors'
              >
                <LuUnlink className='h-3.5 w-3.5' />
                <span>Disconnect</span>
              </button>
            )}
          </>
        )}

        <Button
          onClick={onConnect}
          Icon={platform === 'FACEBOOK' ? LuPlus : undefined}
        >
          {platform === 'FACEBOOK'
            ? isAuthorized || connected
              ? 'Add Page'
              : 'Connect Facebook'
            : connected
              ? ''
              : `Connect ${config.label}`}
        </Button>
      </div>
    </div>
  );
}