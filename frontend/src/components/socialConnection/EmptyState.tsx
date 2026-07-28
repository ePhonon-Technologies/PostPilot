import type { SocialPlatform } from '../../types/socialAccounts';

interface Props {
  platform: SocialPlatform;
}

export default function EmptyState({ platform }: Props) {
  return (
    <div className='py-6 text-center text-sm text-gray-400'>
      {platform === 'FACEBOOK'
        ? 'No Facebook Pages connected.'
        : 'No account connected.'}
    </div>
  );
}
