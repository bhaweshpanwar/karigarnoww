import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';

const navItems = [
  { label: 'Dashboard', to: '/thekedar/dashboard', icon: 'grid' },
  { label: 'Incoming Jobs', to: '/thekedar/jobs', icon: 'clipboard' },
  { label: 'My Workers', to: '/thekedar/workers', icon: 'users' },
  { label: 'Earnings', to: '/thekedar/earnings', icon: 'dollar' },
  { label: 'My Profile', to: '/thekedar/profile', icon: 'user' },
];

function NavIcon({ name }) {
  const icons = {
    grid: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    clipboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
    ),
    users: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    dollar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    user: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    logout: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function ThekedarLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(user?.is_online ?? false);
  const { showToast } = useContext(ToastContext);

  const handleAvailabilityToggle = async () => {
    const newStatus = !isOnline;
    try {
      const res = await api.put('/thekedars/me/availability', { is_online: newStatus });
      if (res.data.success) {
        setIsOnline(newStatus);
        showToast(newStatus ? 'You are now online!' : 'You are now offline', 'success');
      }
    } catch {
      showToast('Failed to update availability', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F1EC' }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-[240px] flex-shrink-0"
        style={{ background: '#FFFFFF', borderRight: '2px solid #DDD8D2' }}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: '#DDD8D2' }}>
          <p className="font-bold text-base truncate" style={{ color: '#0E0D0C' }}>{user?.name || 'Thekedar'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#FDF0E8', color: '#D44B0A' }}
            >
              Thekedar
            </span>
          </div>
          {/* Online/Offline toggle */}
          <button
            onClick={handleAvailabilityToggle}
            className="flex items-center gap-2 mt-3"
          >
            <div
              className="w-9 h-5 rounded-full relative transition-colors duration-200"
              style={{ background: isOnline ? '#1A6E42' : '#DDD8D2' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: isOnline ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: isOnline ? '#1A6E42' : '#6B6560' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-150 mx-2 rounded-lg"
                style={{
                  color: active ? '#0E0D0C' : '#6B6560',
                  background: active ? '#FDF0E8' : 'transparent',
                  fontWeight: active ? '700' : '600',
                }}
              >
                <span style={{ color: active ? '#D44B0A' : '#6B6560' }}><NavIcon name={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: '#DDD8D2' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: '#B93424' }}
          >
            <NavIcon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ background: '#F5F1EC' }}>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile: Bottom tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 border-t z-50"
        style={{ background: '#FFFFFF', borderColor: '#DDD8D2' }}
      >
        {navItems.map(item => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: active ? '#D44B0A' : '#A89E97' }}
            >
              <NavIcon name={item.icon} />
              <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
