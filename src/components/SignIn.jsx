import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const SignIn = ({ onSignInSuccess }) => {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('email', user.email);
      onSignInSuccess();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Taskify</h2>
        <p className="text-gray-500">Sign in to start managing your tasks</p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 
                 bg-white border border-gray-300 rounded-lg shadow-sm 
                 hover:bg-gray-50 hover:border-gray-400 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                 transition-all duration-200"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5"
        />
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white/80 text-gray-500">
            By continuing, you agree to our Terms of Service
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignIn;