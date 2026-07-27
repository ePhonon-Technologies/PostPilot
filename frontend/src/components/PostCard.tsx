import PlatformIcon from './platform/PlatformIcon';

interface PostCardProps {
  content: string;
  status: string;
  scheduledFor?: string | null;
  platforms: string[];
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-amber-50 text-amber-700',
  PUBLISHED: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
};

const PostCard = ({
  content,
  status,
  scheduledFor,
  platforms,
  onDelete,
}: PostCardProps) => {
  return (
    <div className='bg-white border border-gray-200 rounded-xl p-4'>
      <div className='flex items-center justify-between mb-2'>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}
        >
          {status}
        </span>
        {onDelete && (
          <button
            onClick={onDelete}
            className='text-xs text-red-500 hover:underline'
          >
            Delete
          </button>
        )}
      </div>
      <p className='text-sm text-gray-800 mb-3'>{content}</p>
      <div className='flex items-center gap-2 flex-wrap'>
        {platforms.map((p) => (
          <PlatformIcon key={p} platform={p} />
        ))}
      </div>
      {scheduledFor && (
        <p className='text-xs text-gray-400 mt-2'>
          Scheduled for {new Date(scheduledFor).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default PostCard;
