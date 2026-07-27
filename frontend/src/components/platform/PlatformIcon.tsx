const platformColors: Record<string, string> = {
  twitter: 'bg-sky-50 text-sky-600',
  instagram: 'bg-pink-50 text-pink-600',
  linkedin: 'bg-blue-50 text-blue-600',
  facebook: 'bg-indigo-50 text-indigo-600',
  tiktok: 'bg-gray-100 text-gray-900',
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  const colorClass =
    platformColors[platform.toLowerCase()] || 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}
    >
      {platform}
    </span>
  );
};

export default PlatformIcon;
