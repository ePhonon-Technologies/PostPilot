import { type ReactNode } from 'react';

const Card = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
