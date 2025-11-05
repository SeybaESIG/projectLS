import { useState, useEffect } from 'react';

interface AuthUser {
  uid: string;
  email: string | null;
  role?: string;
}

// Version simplifiée pour développement (sans Firebase pour l'instant)
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulation de connexion pour le développement
    setUser({
      uid: 'dev-user-123',
      email: email,
      role: 'user'
    });
    localStorage.setItem('firebase_token', 'dev-token-123');
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('firebase_token');
    return { success: true };
  };

  const isAdmin = () => user?.role === 'admin';

  return {
    user,
    loading,
    login,
    logout,
    isAdmin
  };
};
