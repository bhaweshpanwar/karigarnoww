import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
  ];

  const consumerMenu = [
    { label: 'My Bookings', to: '/bookings', icon: '📋' },
  ];

  const thekedarMenu = [
    { label: 'Dashboard', to: '/thekedar/dashboard', icon: '📊' },
    { label: 'My Workers', to: '/thekedar/workers', icon: '👷' },
    { label: 'Earnings', to: '/thekedar/earnings', icon: '💰' },
  ];

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200"
        style={{ height: '68px' }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT — Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-[#0F0D0A] hover:opacity-80 transition-opacity"
          >
            Karigar<span className="text-[#FF6B00]">Now</span>
          </Link>

          {/* CENTER — Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-base font-medium text-[#0F0D0A] hover:text-[#FF6B00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'consumer' && (
              <Link
                to="/bookings"
                className="text-base font-medium text-[#0F0D0A] hover:text-[#FF6B00] transition-colors"
              >
                My Bookings
              </Link>
            )}
            {user?.role === 'thekedar' && (
              <Link
                to="/thekedar/dashboard"
                className="text-base font-medium text-[#0F0D0A] hover:text-[#FF6B00] transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* RIGHT — Auth buttons or user avatar */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-base font-medium text-[#FF6B00] border border-[#FF6B00] rounded-lg hover:bg-[#FF6B00] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-base font-medium text-[#0F0D0A] bg-[#FF6B00] rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar */}
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="w-10 h-10 rounded-full bg-[#FF6B00] text-[#0F0D0A] font-bold text-base flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  {avatarLetter}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#0F0D0A]">{user.name}</p>
                      <p className="text-xs text-[#6B6560] mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {(user.role === 'consumer' ? consumerMenu : thekedarMenu).map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F0D0A] hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-base">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#B93424] hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-base">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-[#0F0D0A] hover:text-[#FF6B00] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-[68px] flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-lg font-medium text-[#0F0D0A] py-3 border-b border-gray-100 hover:text-[#FF6B00] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'consumer' && (
                <Link
                  to="/bookings"
                  className="text-lg font-medium text-[#0F0D0A] py-3 border-b border-gray-100 hover:text-[#FF6B00] transition-colors"
                >
                  My Bookings
                </Link>
              )}
              {user?.role === 'thekedar' && (
                <>
                  <Link to="/thekedar/dashboard" className="text-lg font-medium text-[#0F0D0A] py-3 border-b border-gray-100 hover:text-[#FF6B00] transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/thekedar/workers" className="text-lg font-medium text-[#0F0D0A] py-3 border-b border-gray-100 hover:text-[#FF6B00] transition-colors">
                    My Workers
                  </Link>
                  <Link to="/thekedar/earnings" className="text-lg font-medium text-[#0F0D0A] py-3 border-b border-gray-100 hover:text-[#FF6B00] transition-colors">
                    Earnings
                  </Link>
                </>
              )}
            </div>

            {!user && (
              <div className="flex flex-col gap-3 mt-6">
                <Link
                  to="/login"
                  className="w-full text-center py-3 text-base font-medium text-[#FF6B00] border border-[#FF6B00] rounded-lg hover:bg-[#FF6B00] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3 text-base font-medium text-[#0F0D0A] bg-[#FF6B00] rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-[#0F0D0A] font-bold text-base flex items-center justify-center">
                    {avatarLetter}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F0D0A]">{user.name}</p>
                    <p className="text-xs text-[#6B6560]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 text-sm text-[#B93424] hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
