import { FaTimes } from 'react-icons/fa';
import styles from './MobileMenu.module.css';

const menuLinks = [
  { label: 'À propos', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'Aide', href: '#' },
  { label: "Conditions d'utilisation", href: '#' },
  { label: 'Contact', href: '#' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  return (
    <div
      id="mobile-login-menu"
      className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation mobile"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.logo}>Birdos</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <FaTimes />
          </button>
        </div>
        <nav className={styles.links}>
          {menuLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <button
        type="button"
        className={styles.backdrop}
        aria-hidden="true"
        onClick={onClose}
      />
    </div>
  );
};

export default MobileMenu;

