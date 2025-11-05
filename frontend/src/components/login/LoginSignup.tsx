import styles from './LoginSignup.module.css';

const LoginSignup: React.FC = () => {
  return (
    <div className={styles.signup}>
      <p className={styles.text}>
        Pas encore de compte ?{' '}
        <a href="#" className={styles.link}>
          Créer un compte
        </a>
      </p>
    </div>
  );
};

export default LoginSignup;





