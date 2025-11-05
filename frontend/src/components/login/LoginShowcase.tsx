import { FaBolt, FaGlobeEurope, FaShieldAlt, FaSmileBeam } from 'react-icons/fa';
import styles from './LoginShowcase.module.css';

const highlights = [
  {
    icon: <FaBolt />,
    title: 'Réservation express',
    description: 'Confirmez un trajet en moins de 60 secondes grâce aux alertes intelligentes.'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Sécurité renforcée',
    description: 'Identité vérifiée, assurance incluse et assistance 24/7 sur chaque voyage.'
  },
  {
    icon: <FaGlobeEurope />,
    title: 'Communauté mondiale',
    description: 'Partagez vos vols avec des voyageurs passionnés dans plus de 30 pays.'
  }
];

const LoginShowcase: React.FC = () => {
  return (
    <aside className={styles.showcase} aria-label="Points forts Birdos">
      <div className={styles.card}>
        <blockquote className={styles.testimonial}>
          « Birdos nous a permis de rentabiliser nos vols privés tout en rencontrant des voyageurs incroyables. »
        </blockquote>
        <div className={styles.author}>
          <FaSmileBeam aria-hidden="true" />
          <div>
            <span className={styles.authorName}>Camille Morel</span>
            <span className={styles.authorRole}>Pilote partenaire depuis 2024</span>
          </div>
        </div>
        <ul className={styles.features}>
          {highlights.map((item) => (
            <li key={item.title} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <span className={styles.featureTitle}>{item.title}</span>
                <p className={styles.featureDescription}>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default LoginShowcase;


