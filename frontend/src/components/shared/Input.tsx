// src/components/shared/Input.tsx
import { type InputHTMLAttributes, type ComponentType } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  Icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
}

const Input = ({
  label,
  id,
  Icon,
  iconClassName = 'w-4 h-4 text-gray-400',
  className = '',
  ...props
}: InputProps) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          {label}
        </label>
      )}
      <div className='relative'>
        {Icon && (
          <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Icon className={iconClassName} />
          </span>
        )}
        <input
          id={id}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
        />
      </div>
    </div>
  );
};

export default Input;
