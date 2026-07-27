// src/components/CreatePost.tsx
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { LuImage, LuSmile } from 'react-icons/lu';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import {
  fetchSocialAccounts,
  selectAllSocialAccounts,
} from '../../store/slices/socialAccountSlice';
import { PLATFORM_CONFIG } from '../../config/platfrom';
import { AiToolbar } from '../../components/shared/AiToolbar';

import Button from '../../components/shared/Button';
import type { MediaItem, PublishMode } from '../../types/socialAccounts';
import { PlatformSelector } from '../../components/platform/PlatformSelector';
import { MediaPreview } from '../../components/shared/MediaPreview';
import { PublishingSchedule } from '../../components/post/PublishSchedule';
import { LivePreview } from '../../components/shared/LivePreview';
import apiRequest from '../../api/client';
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';

export default function CreatePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'LINKEDIN',
    'TWITTER',
  ]);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [publishMode, setPublishMode] = useState<PublishMode>('schedule');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<string>('LINKEDIN');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  console.log('media is', media);
  const dispatch = useAppDispatch();
  const allaccounts = useAppSelector(selectAllSocialAccounts);

  useEffect(() => {
    dispatch(fetchSocialAccounts());
  }, [dispatch]);

  // Handle inserting selected emoji into content string
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prevContent) => prevContent + emojiData.emoji);
  };

  // Close picker when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to retrieve database account IDs based on selected platform types
  const getTargetAccountIds = (): string[] => {
    if (!allaccounts || allaccounts.length === 0) return [];

    return allaccounts
      .filter((acc) => selectedPlatforms.includes(acc.platform))
      .map((acc) => acc.id);
  };

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) {
        toast.error('Select at least one platform');
        return;
      }
      const updated = selectedPlatforms.filter((p) => p !== id);
      setSelectedPlatforms(updated);
      if (previewTab === id) {
        setPreviewTab(updated[0]);
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  // Dynamically calculate character limit based on selected platforms
  const currentLimit = Math.min(
    ...selectedPlatforms.map(
      (p) =>
        PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG]?.maxChars ?? 3000,
    ),
  );

  // Unified File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: MediaItem[] = Array.from(files).map((file) => ({
        file, // Stores exact binary File reference
        previewUrl: URL.createObjectURL(file),
      }));

      setMedia((prev) => [...prev, ...newItems]);
      toast.success(`${files.length} file(s) attached!`);

      // Reset value to allow re-uploading the same file if removed
      e.target.value = '';
    }
  };

  const handleAiAction = (action: string) => {
    setIsAiLoading(true);
    setTimeout(() => {
      if (action === 'hashtags') {
        setContent(
          (prev) =>
            `${prev}\n\n#SocialMedia #ContentStrategy #Growth #PostPilot`,
        );
      } else if (action === 'rephrase') {
        setContent(
          '🚀 Launching new ideas has never been easier. Check out our latest post for a breakdown on modern content scheduling!',
        );
      }
      setIsAiLoading(false);
    }, 600);
  };

  const resetFormState = () => {
    setContent('');
    setMedia([]);
    setScheduleDate('');
  };

  // Shared: builds the FormData for any post-creation call
  const buildPostFormData = (extraFields?: Record<string, string>) => {
    const targetAccountIds = getTargetAccountIds();
    const formData = new FormData();

    formData.append('content', content);
    targetAccountIds.forEach((id) => formData.append('targetAccountIds', id));
    media.forEach((item) => {
      if (item.file instanceof File) {
        formData.append('media', item.file);
      }
    });

    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) =>
        formData.append(key, value),
      );
    }

    return { formData, targetAccountIds };
  };

  // Shared: POSTs the FormData to /posts and returns the created post ID
  const createPost = async (extraFields?: Record<string, string>) => {
    const { formData, targetAccountIds } = buildPostFormData(extraFields);

    const createRes = await apiRequest.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const postId = createRes.data?.post?.id || createRes.data?.id;
    if (!postId) {
      throw new Error('Failed to retrieve post ID after creation');
    }

    return { postId, targetAccountIds };
  };

  const handlePublishImmediately = async () => {
    if (!content.trim() && media.length === 0) {
      return toast.error('Please add some text or media to your post.');
    }
    if (getTargetAccountIds().length === 0) {
      return toast.error('No connected account found for selected platforms.');
    }

    setSubmittingPost(true);
    try {
      const { postId, targetAccountIds } = await createPost();

      const publishRes = await apiRequest.post(`/posts/${postId}/publish`, {
        targetAccountIds,
      });

      const overallStatus = publishRes.data?.overallStatus;
      if (overallStatus === 'FAILED') {
        toast.error('Publishing failed.');
      } else if (overallStatus === 'PARTIALLY_PUBLISHED') {
        toast.warning('Published to some accounts, but failed on others.');
      } else {
        toast.success('Post published successfully!');
      }

      resetFormState();
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err?.response?.data?.message || 'Failed to publish post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!content.trim() && media.length === 0) {
      return toast.error('Please add some text or media to your post.');
    }
    if (getTargetAccountIds().length === 0) {
      return toast.error('No connected account found for selected platforms.');
    }
    if (!scheduleDate) {
      return toast.error('Please select a date and time for scheduling.');
    }
    const targetTime = new Date(scheduleDate).getTime();
    if (isNaN(targetTime) || targetTime <= Date.now()) {
      return toast.error('Schedule time must be in the future.');
    }

    setSubmittingPost(true);
    try {
      await createPost({ scheduledAt: new Date(scheduleDate).toISOString() });
      toast.success('Post successfully scheduled!');
      resetFormState();
    } catch (error: any) {
      console.error('[Schedule Error]:', error);
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && media.length === 0) {
      return toast.error('Please add some text or media to save as a draft.');
    }

    setSubmittingPost(true);
    try {
      await createPost({ status: 'DRAFT' });
      toast.success('Draft saved successfully!');
      resetFormState();
    } catch (error: any) {
      console.error('[Save Draft Error]:', error);
      toast.error(error.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      toast.error('Please write some content or add media before submitting');
      return;
    }

    if (publishMode === 'now') {
      handlePublishImmediately();
    } else if (publishMode === 'schedule') {
      handleSchedulePost();
    } else {
      handleSaveDraft();
      toast.success('Draft saved successfully');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Create Post</h1>
          <p className='text-sm text-gray-500'>
            Draft, enhance with AI, and schedule across your social profiles.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-1 lg:grid-cols-12 gap-8'
        >
          <div className='lg:col-span-7 space-y-6'>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={togglePlatform}
            />

            <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
              <AiToolbar
                isAiLoading={isAiLoading}
                onAiAction={handleAiAction}
              />

              <div className='relative'>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='What do you want to share today? Type caption or let AI draft it...'
                  rows={6}
                  className='w-full text-sm bg-transparent focus:outline-none resize-none text-gray-800 placeholder-gray-400'
                />

                <div className='flex justify-end pt-2 text-xs text-gray-400'>
                  <span
                    className={
                      content.length > currentLimit
                        ? 'text-red-500 font-bold'
                        : ''
                    }
                  >
                    {content.length} / {currentLimit} max chars
                  </span>
                </div>
              </div>

              <MediaPreview
                media={media}
                onRemoveMedia={(idx) =>
                  setMedia(media.filter((_, i) => i !== idx))
                }
              />

              <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                <div className='flex items-center gap-1'>
                  {/* Unified File Upload Button */}
                  <div className='relative'>
                    <Button
                      type='button'
                      Icon={LuImage}
                      iconClassName='w-5 h-5 text-gray-500'
                      className='p-2 hover:bg-gray-100 rounded-lg transition'
                    />
                    <input
                      type='file'
                      accept='image/*,video/*'
                      multiple
                      onChange={handleFileUpload}
                      className='absolute inset-0 opacity-0 cursor-pointer w-full h-full'
                    />
                  </div>

                  {/* Emoji Selector Button */}
                  {/* Shared Button for Emoji selector */}
                  <div className='relative' ref={emojiPickerRef}>
                    <Button
                      type='button'
                      Icon={LuSmile}
                      iconClassName='w-5 h-5 text-gray-500'
                      className='p-2 hover:bg-gray-100 rounded-lg transition'
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    />

                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div className='absolute bottom-12 left-0 z-50 shadow-xl rounded-2xl'>
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          autoFocusSearch={false}
                          width={320}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <PublishingSchedule
              isSubmitting={submittingPost}
              publishMode={publishMode}
              scheduleDate={scheduleDate}
              onModeChange={setPublishMode}
              onDateChange={setScheduleDate}
            />
          </div>

          <LivePreview
            selectedPlatforms={selectedPlatforms}
            previewTab={previewTab}
            content={content}
            media={media}
            onTabChange={setPreviewTab}
          />
        </form>
      </div>
    </div>
  );
}
