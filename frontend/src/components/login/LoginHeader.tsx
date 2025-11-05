import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from '../ThemeToggle';
import styles from './LoginHeader.module.css';

interface LoginHeaderProps {
  isHidden: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({
  isHidden,
  isMenuOpen,
  onToggleMenu
}) => {
  return (
    <header className={`${styles.header} ${isHidden ? styles.headerHidden : ''}`}>
      <div className={styles.content}>
        <a href="#" className={styles.logo}>
          Birdos
        </a>
        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuToggle}
            onClick={onToggleMenu}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-login-menu"
            aria-haspopup="menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default LoginHeader;




