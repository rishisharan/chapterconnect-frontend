import React, { useState } from 'react';
import { Users, LogIn } from 'lucide-react';

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
     setLoading(true);
    try {
      // Get Google OAuth URL from backend
      const response = await fetch('/api/auth/google/login');
      const data = await response.json();
      if (data.login_url) {
        // Open Google login in a popup window
        const popup = window.open(data.login_url, 'googleLogin', 'width=500,height=600');

        // Listen for message from popup
        window.addEventListener('message', (event) => {
          if (event.data.type === 'auth-success') {
            const { token, user } = event.data;

            // ✅ Save JWT and user info
            localStorage.setItem('jwt', token);
            localStorage.setItem('user', JSON.stringify(user));

            onLogin(user); // update parent state
            popup.close();
            setLoading(false);

            // ✅ Redirect to dashboard
            window.location.href = '/dashboard';
          }
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChapterConnect</h1>
          <p className="text-gray-600">Professional meeting management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome</h2>
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-3"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;