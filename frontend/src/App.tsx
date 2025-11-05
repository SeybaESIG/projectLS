import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Chargement...
      </div>
    );
  }

  return user ? <Home /> : <Login />;
}

export default App;
