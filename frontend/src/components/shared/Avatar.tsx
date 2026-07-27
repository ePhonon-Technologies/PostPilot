import { useState } from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  background?: string;
  fontFamily?: string;
  className?: string;
}

const Avatar = ({
  name = '',
  src,
  size = 22,
  background,
  fontFamily = 'Inter, sans-serif',
  className = '',
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const initials = !name.trim()
    ? '?'
    : name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

  if (!src || imageError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: background,
          fontFamily: fontFamily,
        }}
        className={className}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={
        src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL}${src}`
      }
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
