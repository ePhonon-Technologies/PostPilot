// src/components/create-post/PublishingSchedule.tsx
import React from 'react';
import { LuSend, LuClock, LuSave, LuCalendar } from 'react-icons/lu';
import type { PublishMode } from '../../types/socialAccounts';
import Button from '../shared/Button';

interface PublishingScheduleProps {
  isSubmitting: boolean;
  publishMode: PublishMode;
  scheduleDate: string;
  onModeChange: (mode: PublishMode) => void;
  onDateChange: (date: string) => void;
}

export const PublishingSchedule: React.FC<PublishingScheduleProps> = ({
  isSubmitting,
  publishMode,
  scheduleDate,
  onModeChange,
  onDateChange,
}) => {
  return (
    <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
      <label className='text-xs font-semibold uppercase tracking-wider text-gray-500'>
        Publishing Schedule
      </label>

      <div className='grid grid-cols-3 gap-3'>
        <Button
          type='button'
          Icon={LuSend}
          onClick={() => onModeChange('now')}
          className={`p-3 rounded-xl border text-sm font-semibold transition ${
            publishMode === 'now'
              ? 'border-blue-600 bg-blue-50/50 text-blue-600'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          Post Now
        </Button>

        <Button
          type='button'
          Icon={LuClock}
          onClick={() => onModeChange('schedule')}
          className={`p-3 rounded-xl border text-sm font-semibold transition ${
            publishMode === 'schedule'
              ? 'border-blue-600 bg-blue-50/50 text-blue-600'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          Schedule
        </Button>

        <Button
          type='button'
          Icon={LuSave}
          onClick={() => onModeChange('draft')}
          className={`p-3 rounded-xl border text-sm font-semibold transition ${
            publishMode === 'draft'
              ? 'border-blue-600 bg-blue-50/50 text-blue-600'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          Save Draft
        </Button>
      </div>

      {publishMode === 'schedule' && (
        <div className='flex gap-3 pt-2'>
          <input
            type='datetime-local'
            value={scheduleDate}
            onChange={(e) => onDateChange(e.target.value)}
            className='w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none text-gray-800'
          />
        </div>
      )}

      {/* Main Action Button */}
      <Button
        type='submit'
        loading={isSubmitting}
        Icon={
          publishMode === 'now'
            ? LuSend
            : publishMode === 'schedule'
              ? LuCalendar
              : LuSave
        }
        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-500/20 transition'
      >
        {publishMode === 'now' && 'Publish Now'}
        {publishMode === 'schedule' && 'Schedule Post'}
        {publishMode === 'draft' && 'Save to Drafts'}
      </Button>
    </div>
  );
};
