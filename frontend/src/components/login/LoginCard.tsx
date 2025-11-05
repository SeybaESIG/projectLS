import { PropsWithChildren } from 'react';
import styles from './LoginCard.module.css';

const LoginCard: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.card}>{children}</div>;
};

export default LoginCard;





