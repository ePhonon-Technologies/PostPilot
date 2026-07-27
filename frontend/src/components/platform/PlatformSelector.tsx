// src/components/create-post/PlatformSelector.tsx
import React from 'react';
import { ACCOUNTS, type PlatformConfig } from '../../config/platfrom';
import Button from '../shared/Button';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onTogglePlatform: (id: string) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onTogglePlatform,
}) => {
  return (
    <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3'>
      <label className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
        Select Target Platforms
      </label>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {ACCOUNTS.map((acc: PlatformConfig) => {
          const isSelected = selectedPlatforms.includes(acc.key);
          return (
            <Button
              type='button'
              key={acc.key}
              Icon={acc.icon}
              iconClassName={`w-6 h-6 ${acc.textColor}`}
              onClick={() => onTogglePlatform(acc.key)}
              className={`flex-col p-3 rounded-xl border transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <span className='text-xs font-semibold'>{acc.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
