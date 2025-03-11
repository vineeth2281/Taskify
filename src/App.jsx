import React, { useState, useEffect } from 'react';
import Todo from './components/Todo';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import { auth } from './firebase';
import { ArrowLeft, CheckCircle, LogOut, ChevronDown, Settings, User, Bell } from 'lucide-react';

const TaskifyApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications] = useState(3); // Example notification count

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        setCurrentView('app');
      } else {
        setUser(null);
        if (currentView === 'app') {
          setCurrentView('landing');
        }
      }
    });

    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setCurrentView('app');
    }

    return () => unsubscribe();
  }, [currentView]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('email');
      setCurrentView('landing');
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const UserProfileDropdown = () => (
    <div className="relative profile-dropdown">
      <button
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-medium">
              {user?.displayName?.charAt(0)}
            </div>
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{user?.displayName}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showProfileDropdown && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform opacity-100 scale-100 transition-all duration-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-medium">
                    {user?.displayName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{user?.displayName}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowProfileDropdown(false)}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowProfileDropdown(false)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  // Landing page view
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('signin')} />;
  }

  // Sign in view
  if (currentView === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative">
        <button
          onClick={() => setCurrentView('landing')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center 
                   shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="container mx-auto max-w-md pt-20 px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white">
            <SignIn onSignInSuccess={() => setCurrentView('app')} />
          </div>
        </div>
      </div>
    );
  }

  // Main app view
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">Taskify</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {/* Handle notifications */}}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white 
                                 flex items-center justify-center border-2 border-white">
                    {notifications}
                  </span>
                )}
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Todo user={user}/>
      </main>
    </div>
  );
};

export default TaskifyApp;