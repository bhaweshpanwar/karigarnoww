import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'thekedar' ? '/thekedar/dashboard' : '/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess('Account created! Please login.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', form);
      const meRes = await api.get('/auth/me');
      const loggedInUser = meRes.data.data;
      login(loggedInUser);
      setSuccess(`Welcome back, ${loggedInUser.name}!`);
      setTimeout(() => {
        navigate(loggedInUser.role === 'thekedar' ? '/thekedar/dashboard' : '/');
      }, 800);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-56px)]">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ background: '#0E0D0C', padding: '64px 56px' }}
      >
        <div>
          <p className="text-[10px] font-bold tracking-[3px] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            KARIGAR NOW — JOIN THE PLATFORM
          </p>
        </div>

        <div>
          <h1
            className="font-display font-black leading-[0.97] tracking-[-3px] text-white"
            style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}
          >
            Welcome<br />
            <em className="not-italic" style={{ color: '#FF6B2B' }}>back.</em>
          </h1>
          <p className="font-display italic text-[16px] mt-6 max-w-[320px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Apna kaam, apna worker — log in to manage your bookings and connect with karigars.
          </p>
        </div>

        {/* Proof items */}
        <div className="mt-12 flex flex-col gap-4">
          {[
            { n: '2,400+', t: 'Verified thekedars on platform' },
            { n: '18k+', t: 'Jobs completed successfully' },
            { n: '4.8★', t: 'Average customer rating' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-display text-[24px] font-black leading-none flex-shrink-0" style={{ color: '#FF6B2B' }}>
                {item.n}
              </span>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.t}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Decorative */}
        <div
          className="absolute font-display font-black text-white/[0.03] leading-none pointer-events-none select-none"
          style={{ fontSize: '240px', bottom: '-20px', right: '-10px', letterSpacing: '-8px' }}
        >
          K
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex items-start justify-center overflow-y-auto"
        style={{ background: '#FDFCFA', padding: '56px 64px' }}
      >
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <p className="font-display text-[22px] font-black text-ink">
              Karigar<span className="text-accent">Now</span>
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-rule mb-8">
            <button className="pb-3 pr-7 text-[14px] font-bold" style={{ color: '#0E0D0C', borderBottom: '2px solid #0E0D0C', marginBottom: '-2px' }}>
              Sign In
            </button>
            <Link to="/register" className="pb-3 pr-7 text-[14px] font-bold" style={{ color: '#A89E97' }}>
              Sign Up
            </Link>
          </div>

          <h2 className="font-display text-[32px] font-black tracking-[-1px] mb-1" style={{ color: '#0E0D0C' }}>
            Sign in
          </h2>
          <p className="text-[14px] mb-8" style={{ color: '#6B6560' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent font-bold">Create one</Link>
          </p>

          {success && (
            <div
              className="px-4 py-3 rounded-sm mb-5 text-[13px] font-semibold animate-[fadeIn_0.2s_ease-out]"
              style={{ background: '#E8F5EE', border: '1px solid #1A6E42', color: '#1A6E42' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                style={{ borderColor: '#DDD8D2' }}
                onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                  style={{ borderColor: '#DDD8D2' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                  onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] transition-colors"
                  style={{ color: '#A89E97' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#0E0D0C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A89E97'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-sm text-[13px]"
                style={{ background: '#FDECEA', border: '1px solid #B93424', color: '#B93424' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-[14px] rounded-sm text-[15px] font-bold text-white transition-colors"
              style={{ background: '#0E0D0C' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#D44B0A')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#0E0D0C')}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 text-[12px]" style={{ color: '#A89E97' }}>
            <div className="flex-1 h-[1.5px]" style={{ background: '#DDD8D2' }} />
            or continue with
            <div className="flex-1 h-[1.5px]" style={{ background: '#DDD8D2' }} />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-sm border-2 bg-white text-[13px] font-semibold transition-colors"
            style={{ borderColor: '#DDD8D2' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F1EC'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
