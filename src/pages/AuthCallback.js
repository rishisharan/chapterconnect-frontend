import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login');
        return;
      }

      if (!code) {
        navigate('/login');
        return;
      }

      try {
        // Backend will handle the code exchange
        const response = await fetch(`/api/auth/google/callback?code=${code}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          onLogin(userData);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Callback processing failed:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default AuthCallback;