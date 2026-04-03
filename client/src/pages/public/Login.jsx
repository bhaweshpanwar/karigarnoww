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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'thekedar' ? '/thekedar/dashboard' : '/', { replace: true });
    }
  }, [user, navigate]);

  // Show success if redirected from register
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
      // POST login — this sets the JWT cookie server-side
      const loginRes = await api.post('/auth/login', form);

      // GET /auth/me to retrieve full user details including role
      const meRes = await api.get('/auth/me');
      const loggedInUser = meRes.data.data;

      // Update auth context with fresh user data
      login(loggedInUser);

      // Show welcome toast then redirect
      setSuccess(`Welcome back, ${loggedInUser.name}!`);

      setTimeout(() => {
        if (loggedInUser.role === 'thekedar') {
          navigate('/thekedar/dashboard');
        } else {
          navigate('/');
        }
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
    <div className="min-h-screen bg-[#0E0D0C] flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0E0D0C] flex-col justify-between p-14 relative overflow-hidden">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] uppercase text-white/30">
            KarigarNow
          </p>
        </div>
        <div>
          <h1
            className="font-['Fraunces',serif] font-black leading-[0.97] tracking-[-3px] text-white"
            style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}
          >
            Welcome<br />
            <em className="not-italic text-[#FF6B2B]">back.</em>
          </h1>
          <p className="font-['Fraunces',serif] italic text-[16px] text-white/40 mt-6 max-w-[320px] leading-relaxed">
            Apna kaam, apna worker — log in to manage your bookings and connect with karigars.
          </p>
        </div>
        <div
          className="absolute bottom-[-20px] right-[-10px] font-['Fraunces',serif] text-[240px] font-black text-white/[0.03] leading-none pointer-events-none select-none"
          style={{ letterSpacing: '-8px' }}
        >
          01
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-[#FDFCFA] flex items-start justify-center px-6 py-16 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <p className="font-['Fraunces',serif] text-[22px] font-black text-[#0E0D0C]">
              Karigar<span className="text-[#D44B0A]">Now</span>
            </p>
          </div>

          <h2 className="font-['Fraunces',serif] text-[32px] font-black tracking-[-1px] text-[#0E0D0C] mb-1">
            Sign in
          </h2>
          <p className="text-[14px] text-[#6B6560] mb-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#D44B0A] font-bold">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Success toast */}
            {success && (
              <div className="px-4 py-3 rounded-lg bg-[#E8F5EE] border border-[#1A6E42] text-[#1A6E42] text-[13px] animate-[fadeIn_0.2s_ease-out]">
                {success}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#A89E97] hover:text-[#0E0D0C] transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-[#FDECEA] border border-[#B93424] text-[#B93424] text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-lg bg-[#0E0D0C] text-white text-[15px] font-bold hover:bg-[#D44B0A] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 text-[#A89E97] text-[12px]">
            <div className="flex-1 h-[1.5px] bg-[#DDD8D2]" />
            or continue with
            <div className="flex-1 h-[1.5px] bg-[#DDD8D2]" />
          </div>

          {/* Google buttons (UI only) */}
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[13px] font-semibold hover:bg-[#F5F1EC] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google as Customer
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[13px] font-semibold hover:bg-[#F5F1EC] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google as Thekedar
            </button>
          </div>
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
