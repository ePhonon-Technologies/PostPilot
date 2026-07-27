// src/components/create-post/MediaPreview.tsx
import React from 'react';
import { LuX } from 'react-icons/lu';
import Button from './Button';
import type { MediaItem } from '../../types/socialAccounts';

interface MediaPreviewProps {
  media: MediaItem[]; // Ensure this is typed as an array of MediaItem
  onRemoveMedia: (index: number) => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  onRemoveMedia,
}) => {
  if (media.length === 0) return null;

  return (
    <div className='flex items-center gap-3 pt-2'>
      {media.map((item, idx) => {
        // Fallback checks depending on how your MediaItem is structured.
        // Assuming MediaItem is { file: File, previewUrl: string }
        const url = item.previewUrl;

        return (
          <div
            key={idx}
            className='relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200'
          >
            {item.file.type.startsWith('video/') ? (
              <video src={url} className='w-full h-full object-cover' muted />
            ) : (
              <img
                src={url}
                alt='Attached media'
                className='w-full h-full object-cover'
              />
            )}
            <Button
              type='button'
              Icon={LuX}
              onClick={() => onRemoveMedia(idx)}
              className='absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition'
            ></Button>
          </div>
        );
      })}
    </div>
  );
};
