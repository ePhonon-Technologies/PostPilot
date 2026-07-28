import { LuTrash2 } from 'react-icons/lu';
import type { SocialAccount } from '../../types/socialAccounts';

interface Props {
  account: SocialAccount;
  onDisconnect(id: string): void;
}

export default function DisconnectButton({ account, onDisconnect }: Props) {
  return (
    <button
      onClick={() => {
        if (window.confirm(`Disconnect ${account.accountName}?`)) {
          onDisconnect(account.id);
        }
      }}
      className='rounded p-2 hover:bg-red-50 hover:text-red-600'
    >
      <LuTrash2 />
    </button>
  );
}
