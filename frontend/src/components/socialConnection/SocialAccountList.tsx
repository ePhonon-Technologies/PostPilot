import SocialAccountItem from './SocialAccountItem';
import type { SocialAccount } from '../../types/socialAccounts';

interface Props {
  accounts: SocialAccount[];
  onDisconnect(id: string): void;
  onReconnect?(account: SocialAccount): void;
}

export default function SocialAccountList({
  accounts,
  onDisconnect,
  onReconnect,
}: Props) {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {accounts.map((account, index) => {
        const isLastOdd =
          accounts.length % 2 === 1 &&
          index === accounts.length - 1;

        return (
          <li
            key={account.id}
            className={isLastOdd ? 'col-span-2' : ''}
          >
            <SocialAccountItem
              account={account}
              onDisconnect={onDisconnect}
              onReconnect={onReconnect}
            />
          </li>
        );
      })}
    </ul>
  );
}