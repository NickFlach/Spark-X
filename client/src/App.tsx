import { Switch, Route, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/home';
import Discover from './pages/discover';
import Leaderboard from './pages/leaderboard';
import Analytics from './pages/analytics';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@shared/schema';

// Loading component to show while checking auth status
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Simple error display component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="p-6 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{message}</p>
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}

// Authentication screen with login/register toggle
function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="text-2xl font-bold text-primary">Spark-X Platform</div>
          </div>

          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                showLogin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                !showLogin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            {showLogin ? <Login /> : <Register />}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User is authenticated:', userData);
          setUser(userData);
        } else {
          console.log('User is not authenticated');
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error if one occurred
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // If authenticated, show the main application
  if (user) {
    return (
      <AppLayout user={user}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    );
  }

  // Otherwise, show the auth screen
  return <AuthScreen />;
}

export default App; 