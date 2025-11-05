import React from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Input from './Input';
import './PasswordInput.css';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showPasswordToggle ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
            className="password-toggle-button"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <FaEyeSlash className="password-toggle-icon" />
            ) : (
              <FaEye className="password-toggle-icon" />
            )}
          </button>
        ) : undefined
      }
    />
  );
};

export default PasswordInput;

