import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import styles from './LoginFooter.module.css';

const footerLinks = [
  { label: 'À propos', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'Aide', href: '#' },
  { label: "Conditions d'utilisation", href: '#' },
  { label: 'Contact', href: '#' },
];

const languages = ['Français (FR)', 'English (EN)', 'Español (ES)'];

const socials = [
  { label: 'Twitter', icon: <FaTwitter />, href: '#' },
  { label: 'LinkedIn', icon: <FaLinkedin />, href: '#' },
  { label: 'Instagram', icon: <FaInstagram />, href: '#' }
];

const LoginFooter: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.links}>
          {footerLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
          <span className={styles.linkStatic}>© 2026 Birdos</span>
        </div>

        <div className={styles.meta}>
          <div className={styles.language}>
            <label htmlFor="footer-language" className="sr-only">
              Choisir la langue
            </label>
            <select id="footer-language" name="language" className={styles.languageSelect} defaultValue={languages[0]}>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.social}>
            {socials.map((social) => (
              <a key={social.label} href={social.href} className={styles.socialLink} aria-label={social.label}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LoginFooter;




