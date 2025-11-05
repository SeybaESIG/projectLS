import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  style,
  wrapperClassName = '',
  labelClassName = '',
  containerClassName = '',
  ...props
}) => {
  const wrapperClasses = ['input-wrapper', wrapperClassName]
    .filter(Boolean)
    .join(' ');

  const labelClasses = ['input-label', labelClassName]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'input-container',
    leftIcon ? 'input-container--with-left-icon' : '',
    rightIcon ? 'input-container--with-right-icon' : '',
    leftIcon ? 'input-container--with-icon' : '',
    containerClassName
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = ['input-field', error ? 'input-field--error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={props.id} className={labelClasses}>
          {label}
        </label>
      )}
      <div className={containerClasses}>
        {leftIcon && (
          <div className="input-icon input-icon--left">
            {leftIcon}
          </div>
        )}
        <input
          className={inputClasses}
          style={style}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {rightIcon && (
          <div className="input-icon input-icon--right">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <div className="input-error">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div className="input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;

