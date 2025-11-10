import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { Navigation } from './components/Navigation';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export type User = {
  id: string;
  email: string;
  name: string;
};

export type PageView = 'dashboard' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setAccessToken(data.session.access_token);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || 'User'
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setAccessToken(data.session.access_token);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || 'User'
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log in');
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign up');
      }

      // After successful signup, log them in
      await handleLogin(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setCurrentPage('dashboard');
    setShowAuth(false);
  };

  const handleLogoClick = () => {
    if (user) {
      // If user is logged in, just go back to landing without logging out
      setShowAuth(false);
    } else {
      // If not logged in, just go to landing
      setShowAuth(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show landing page when showAuth is false
  if (!showAuth && !user) {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      </>
    );
  }

  // Show auth page when showAuth is true and no user
  if (showAuth && !user) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthPage 
          onLogin={handleLogin} 
          onSignup={handleSignup}
          onBackToHome={() => setShowAuth(false)}
        />
      </>
    );
  }

  // Show landing page with user logged in if showAuth is false
  if (!showAuth && user) {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage 
          onGetStarted={() => setShowAuth(true)} 
          user={user}
          onLogout={handleLogout}
          onDashboard={() => setShowAuth(true)}
        />
      </>
    );
  }

  // Show dashboard/profile when user is logged in and showAuth is true
  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Navigation 
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        onLogoClick={() => setShowAuth(false)}
      />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' ? (
          <Dashboard user={user} accessToken={accessToken!} />
        ) : (
          <ProfilePage user={user} accessToken={accessToken!} />
        )}
      </main>
    </div>
  );
}