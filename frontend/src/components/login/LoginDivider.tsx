import styles from './LoginDivider.module.css';

const LoginDivider: React.FC = () => {
  return (
    <div className={styles.divider}>
      <div className={styles.line} />
      <span className={styles.text}>ou</span>
      <div className={styles.line} />
    </div>
  );
};

export default LoginDivider;





