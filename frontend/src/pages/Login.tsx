import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../css/globals.css';
import {
  LoginHeader,
  MobileMenu,
  LoginHero,
  SocialLogin,
  LoginDivider,
  LoginForm,
  LoginSignup,
  LoginFooter,
  LoginCard,
  LoginShowcase,
  LoginDesktopMenu,
} from '../components/login';
import styles from './LoginPage.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: number | undefined;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 30) {
          // Scrolling down - hide header
          setIsHeaderHidden(true);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          setIsHeaderHidden(false);
        }
        
        lastScrollY = currentScrollY;
      }, 50); // Délai de 50ms pour stabiliser
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError('Erreur de connexion');
    }
    
    setLoading(false);
  };

  const passwordInsights = useMemo(() => {
    if (!password) {
      return {
        variant: 'empty' as const,
        helper: 'Utilisez au moins 8 caractères avec des lettres, chiffres et symboles.'
      };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return {
        variant: 'weak' as const,
        helper: 'Ajoutez des majuscules, chiffres et symboles pour renforcer votre mot de passe.'
      };
    }

    if (score === 2 || score === 3) {
      return {
        variant: 'medium' as const,
        helper: 'Encore un petit effort : ajoutez un symbole ou allongez votre mot de passe.'
      };
    }

    return {
      variant: 'strong' as const,
      helper: 'Excellent mot de passe ! Pensez à le garder en lieu sûr.'
    };
  }, [password]);

  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>
        <LoginHeader
          isHidden={isHeaderHidden}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((open) => !open)}
        />

        <LoginDesktopMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className={`${styles.main} ${isHeaderHidden ? styles.mainHeaderHidden : ''}`}>
          <div className={styles.container}>
            <LoginCard>
              <LoginHero
                logoSrc="/img/logo.jpg"
                title="Bienvenue"
                subtitle="Connectez-vous à votre compte Birdos pour continuer"
              />

              <SocialLogin
                onGoogle={() => console.log('Google login')}
                onFacebook={() => console.log('Facebook login')}
              />

              <LoginDivider />

              <LoginForm
                email={email}
                password={password}
                rememberMe={rememberMe}
                error={error}
                loading={loading}
                passwordStrength={passwordInsights.variant}
                passwordHelper={passwordInsights.helper}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onRememberMeChange={setRememberMe}
                onSubmit={handleSubmit}
              />

              <LoginSignup />
            </LoginCard>
          </div>

          <div className={styles.showcase}>
            <LoginShowcase />
          </div>
        </main>

        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;