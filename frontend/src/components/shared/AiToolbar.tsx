// src/components/create-post/AiToolbar.tsx
import React from 'react';
import { LuSparkles, LuWand, LuHash } from 'react-icons/lu';
import Button from './Button';

interface AiToolbarProps {
  isAiLoading: boolean;
  onAiAction: (action: string) => void;
}

export const AiToolbar: React.FC<AiToolbarProps> = ({
  isAiLoading,
  onAiAction,
}) => {
  return (
    <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
      <span className='flex items-center gap-1.5 text-xs font-semibold text-blue-600'>
        <LuSparkles className='w-4 h-4' /> PostPilot AI Assistant
      </span>

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          Icon={LuWand}
          iconClassName='w-3.5 h-3.5'
          loading={isAiLoading}
          onClick={() => onAiAction('rephrase')}
          className='text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition'
        >
          Rephrase
        </Button>

        <Button
          type='button'
          Icon={LuHash}
          iconClassName='w-3.5 h-3.5'
          loading={isAiLoading}
          onClick={() => onAiAction('hashtags')}
          className='text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition'
        >
          Hashtags
        </Button>
      </div>
    </div>
  );
};
