'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    if (profile.role === 'admin') return '/admin/dashboard';
    if (profile.role === 'vendor') return '/vendor/dashboard';
    return '/';
  };

  return (
    <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-lg glossy-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all shine-effect">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-7 h-7 text-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  <path d="M12 2v4"></path>
                  <circle cx="12" cy="8" r="1.5"></circle>
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-700 transition-all">
                MicroStay
              </span>
              <span className="text-[10px] font-medium text-gray-500 -mt-1 tracking-wider">
                HOURLY BOOKINGS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search" className="text-gray-700 hover:text-orange-600 transition-all font-medium hover:scale-105">
              Book Now
            </Link>
            <Link href="/partner" className="text-gray-700 hover:text-orange-600 transition-all font-medium hover:scale-105">
              Partner With Us
            </Link>
            <Link href="/check-booking" className="text-gray-700 hover:text-orange-600 transition-all font-medium hover:scale-105">
              My Bookings
            </Link>

            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all">Dashboard</Button>
                </Link>
                <Button onClick={handleSignOut} variant="ghost" className="hover:text-orange-600 hover:scale-105 transition-all">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all shine-effect">Login</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-orange-600 hover:scale-110 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/search"
              className="block text-gray-700 hover:text-orange-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link
              href="/partner"
              className="block text-gray-700 hover:text-orange-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Partner With Us
            </Link>
            <Link
              href="/check-booking"
              className="block text-gray-700 hover:text-orange-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>

            {user ? (
              <>
                <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="ghost" className="w-full hover:text-orange-600">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
