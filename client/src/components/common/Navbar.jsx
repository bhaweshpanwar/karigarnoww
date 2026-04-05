import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    setDropdownOpen(false);
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
    { label: 'My Bookings', to: '/bookings' },
  ];

  const thekedarMenu = [
    { label: 'Dashboard', to: '/thekedar/dashboard' },
    { label: 'My Workers', to: '/thekedar/workers' },
    { label: 'Earnings', to: '/thekedar/earnings' },
  ];

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <>
      <nav className="sticky top-0 z-[300] h-14 bg-white border-b-2 border-ink flex items-center" style={{ padding: '0 48px' }}>
        {/* Logo */}
        <Link to="/" className="font-display text-[19px] font-black tracking-[-0.5px] text-ink flex-shrink-0">
          Karigar<span className="text-accent">Now</span>
        </Link>

        {/* Center nav links */}
        <div className="flex items-center h-14 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="h-14 px-[18px] text-[13px] font-semibold text-muted border-l border-rule border-r hover:text-ink hover:bg-bg2 transition-colors flex items-center"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'consumer' && (
            <Link
              to="/bookings"
              className="h-14 px-[18px] text-[13px] font-semibold text-muted border-r border-rule hover:text-ink hover:bg-bg2 transition-colors flex items-center"
            >
              My Bookings
            </Link>
          )}
          {user?.role === 'thekedar' && (
            <Link
              to="/thekedar/dashboard"
              className="h-14 px-[18px] text-[13px] font-semibold text-muted border-r border-rule hover:text-ink hover:bg-bg2 transition-colors flex items-center"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-[7px] rounded-sm text-[13px] font-semibold border border-rule bg-white text-ink hover:border-ink transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-[7px] rounded-sm text-[13px] font-bold bg-ink text-white border-none hover:bg-accent transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="w-8 h-8 rounded-full bg-ink text-white font-display text-[13px] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {avatarLetter}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-rule rounded-md shadow-lg min-w-[200px] animate-[fadeSlideDown_0.15s_ease-out]">
                  <div className="px-4 py-3 border-b border-rule">
                    <p className="text-[13px] font-semibold text-ink">{user.name}</p>
                    <p className="text-[12px] text-muted mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {(user.role === 'consumer' ? consumerMenu : thekedarMenu).map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-[13px] text-ink hover:bg-bg2 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-rule py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-[12.5px] text-muted hover:text-red transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
