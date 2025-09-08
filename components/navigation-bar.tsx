'use client';

import {
  useUser,
  useIsAuthenticated,
  useAuthStore,
} from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, Trophy, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function NavigationBar() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null;
  }

  // Don't show navbar if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatsClick = () => {
    router.push('/game/stats');
  };

  const handleLeaderboardClick = () => {
    router.push('/leaderboard');
  };

  const handleProfileClick = () => {
    router.push('/game/stats'); // You can create a dedicated profile page later
  };

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo on the left */}
        <Link href="/game">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WordGame</span>
          </div>
        </Link>

        {/* Navigation buttons on the right */}
        <div className="flex items-center space-x-3">
          {/* Stats Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStatsClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </Button>

          {/* Leaderboard Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaderboardClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getInitials(user.name)}
                </span>
              </div>
              <span className="hidden sm:inline">{user.name}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
