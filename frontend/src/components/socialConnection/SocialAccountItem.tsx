import { LuTriangleAlert, LuRefreshCw } from 'react-icons/lu';
import type { SocialAccount } from '../../types/socialAccounts';
import DisconnectButton from './DisconnectButton';

interface Props {
  account: SocialAccount;
  onDisconnect(id: string): void;
  onReconnect?(account: SocialAccount): void; // Callback to trigger re-authorization/reconnect
}

export default function SocialAccountItem({
  account,
  onDisconnect,
  onReconnect,
}: Props) {
  return (
    <li className='flex item s-center justify-between rounded-lg bg-blue-50 p-3'>
      <div >
        <p className='font-medium text-gray-900'>
          {account.accountName.length > 15
            ? `${account.accountName.slice(0, 15)}...`
            : account.accountName}
        </p>
        {account.isActive ? (
          <span className='text-xs text-green-600'>Active</span>
        ) : (
          <div className='flex items-center gap-2 mt-1'>
            <span className='flex items-center gap-1 text-xs text-amber-600 font-medium'>
              <LuTriangleAlert className='h-3.5 w-3.5' />
              Reconnect Needed
            </span>

            {onReconnect && (
              <button
                type='button'
                onClick={() => onReconnect(account)}
                className='flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition-colors'
              >
                <LuRefreshCw className='h-3 w-3' />
                <span>Fix connection</span>
              </button>
            )}
          </div>
        )}
      </div>

      <DisconnectButton account={account} onDisconnect={onDisconnect} />
    </li>
  );
}