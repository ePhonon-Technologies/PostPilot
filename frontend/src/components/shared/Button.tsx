import { type ButtonHTMLAttributes, type ComponentType } from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  Icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
  iconPosition?: 'left' | 'right';
}

const Button = ({
  loading,
  Icon,
  iconClassName = 'h-4 w-4 shrink-0',
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  const isButtonDisabled = loading || disabled;

  return (
    <button
      {...props}
      type={type}
      disabled={isButtonDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconClassName} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={iconClassName} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
