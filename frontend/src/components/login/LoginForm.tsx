import { FormEvent } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Input from '../Input';
import { PasswordInput } from '..';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  error: string;
  loading: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | 'empty';
  passwordHelper: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  rememberMe,
  error,
  loading,
  passwordStrength,
  passwordHelper,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit
}) => {
  const strengthLabelMap: Record<LoginFormProps['passwordStrength'], string> = {
    empty: 'Entrez votre mot de passe',
    weak: 'Sécurité faible',
    medium: 'Sécurité moyenne',
    strong: 'Sécurité élevée'
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="nom@exemple.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
        leftIcon={<FaEnvelope style={{ color: 'var(--password-icon-color)', fill: 'var(--password-icon-color)' }} />}
        wrapperClassName={styles.formGroup}
        labelClassName={styles.label}
        className={styles.input}
      />

      <PasswordInput
        id="password"
        label="Mot de passe"
        placeholder="••••••••"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
        leftIcon={<FaLock style={{ color: 'var(--password-icon-color)', fill: 'var(--password-icon-color)' }} />}
        wrapperClassName={styles.formGroup}
        labelClassName={styles.label}
        containerClassName={styles.passwordInputContainer}
        className={styles.input}
      />

      <div className={styles.helper} role="status" aria-live="polite">
        {passwordHelper}
      </div>
      <div className={`${styles.strength} ${styles[`strength-${passwordStrength}`]}`}>
        <div className={styles.strengthBar} aria-hidden="true" />
        <span className={styles.strengthLabel}>{strengthLabelMap[passwordStrength]}</span>
      </div>

      {error && (
        <div className={styles.error} role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className={styles.options}>
        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => onRememberMeChange(event.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Se souvenir de moi</span>
        </label>
        <a href="#" className={styles.forgotPassword}>
          Mot de passe oublié ?
        </a>
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default LoginForm;

