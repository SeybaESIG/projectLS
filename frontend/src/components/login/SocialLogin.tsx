import { FaFacebook } from 'react-icons/fa';
import GoogleLogo from '../../assets/google-logo.svg';
import styles from './SocialLogin.module.css';

interface SocialLoginProps {
  onGoogle?: () => void;
  onFacebook?: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onGoogle, onFacebook }) => {
  return (
    <div className={styles.socialLogin}>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={onGoogle}
          className={`${styles.button} ${styles.google}`}
        >
          <img src={GoogleLogo} alt="Google" className={styles.iconImage} />
          Continuer avec Google
        </button>
        <button
          type="button"
          onClick={onFacebook}
          className={`${styles.button} ${styles.facebook}`}
        >
          <FaFacebook className={styles.icon} />
          Continuer avec Facebook
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;





