
import React from 'react';
import { User } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Dream Path</h1>
        </div>
        <div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-indigo-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-300 hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
