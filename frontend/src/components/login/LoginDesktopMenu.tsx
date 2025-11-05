import { FaApple, FaGooglePlay, FaTimes } from 'react-icons/fa';
import styles from './LoginDesktopMenu.module.css';

interface LoginDesktopMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuLinks = [
  { label: 'À propos', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'Aide', href: '#' },
  { label: "Conditions d'utilisation", href: '#' },
  { label: 'Contact', href: '#' }
];

const LoginDesktopMenu: React.FC<LoginDesktopMenuProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`${styles.desktopMenu} ${isOpen ? styles.open : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={styles.overlay}
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.menuTitle}>Menu Birdos</span>
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
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.ctaSection}>
          <div className={styles.ctaText}>
            <h3>Envoyez vos colis avec Birdos</h3>
            <p>Mettez-vous en relation avec des voyageurs pour faire transporter vos colis facilement et en toute confiance, directement depuis l’app mobile.</p>
          </div>
          <div className={styles.storeButtons}>
            <a href="#" className={styles.storeButton} aria-label="Télécharger sur l’App Store">
              <FaApple />
              App Store
            </a>
            <a href="#" className={styles.storeButton} aria-label="Télécharger sur Google Play">
              <FaGooglePlay />
              Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDesktopMenu;
