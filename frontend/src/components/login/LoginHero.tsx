import styles from './LoginHero.module.css';

interface LoginHeroProps {
  logoSrc: string;
  title: string;
  subtitle: string;
}

const LoginHero: React.FC<LoginHeroProps> = ({ logoSrc, title, subtitle }) => {
  return (
    <div className={styles.hero}>
      <span className={styles.badge}>Découvrez l’app mobile Birdos</span>
      <div className={styles.logoWrapper}>
        <img src={logoSrc} alt="Birdos Logo" className={styles.logo} />
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};

export default LoginHero;




