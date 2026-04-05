import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const selectRole = r => {
    setRole(r);
    setStep(2);
  };

  const goBack = () => {
    setStep(1);
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
    if (!form.mobile.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(form.mobile)) return 'Mobile must be 10 digits';
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role,
      });
      if (res.data.success) {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409) {
        setError('Email already registered');
      } else if (data?.data && typeof data.data === 'object') {
        const firstField = Object.values(data.data)[0];
        setError(Array.isArray(firstField) ? firstField[0] : firstField);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Registration failed. Please try again.');
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
            Join the<br />
            <em className="not-italic" style={{ color: '#FF6B2B' }}>movement.</em>
          </h1>
          <p className="font-display italic text-[16px] mt-6 max-w-[320px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Apna kaam, apna worker — be part of India&apos;s trusted local labour network.
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
          <div className="lg:hidden mb-10 flex items-center justify-between">
            <p className="font-display text-[22px] font-black text-ink">
              Karigar<span className="text-accent">Now</span>
            </p>
            {step === 2 && (
              <button onClick={goBack} className="text-[13px] flex items-center gap-1" style={{ color: '#6B6560' }}>
                Back
              </button>
            )}
          </div>

          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <>
              <div className="flex border-b-2 border-rule mb-8">
                <Link to="/login" className="pb-3 pr-7 text-[14px] font-bold" style={{ color: '#A89E97' }}>
                  Sign In
                </Link>
                <button className="pb-3 text-[14px] font-bold" style={{ color: '#0E0D0C', borderBottom: '2px solid #0E0D0C', marginBottom: '-2px' }}>
                  Sign Up
                </button>
              </div>

              <h2 className="font-display text-[32px] font-black tracking-[-1px] mb-1" style={{ color: '#0E0D0C' }}>
                Create account
              </h2>
              <p className="text-[14px] mb-8" style={{ color: '#6B6560' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-bold">Sign in</Link>
              </p>

              {/* Role toggle strip */}
              <div className="flex rounded-sm overflow-hidden mb-6" style={{ border: '2px solid #0E0D0C' }}>
                <button
                  onClick={() => selectRole('consumer')}
                  className="flex-1 py-[11px] text-[13.5px] font-bold transition-colors"
                  style={{ background: '#0E0D0C', color: 'white' }}
                >
                  I need a Service
                </button>
                <button
                  onClick={() => selectRole('thekedar')}
                  className="flex-1 py-[11px] text-[13.5px] font-bold transition-colors"
                  style={{ background: 'white', color: '#A89E97', borderLeft: '2px solid #0E0D0C' }}
                >
                  I am a Thekedar
                </button>
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-2 gap-[10px]">
                <button
                  onClick={() => selectRole('consumer')}
                  className="text-left p-4 rounded-sm border-2 transition-all"
                  style={{ borderColor: '#DDD8D2' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E0D0C'; e.currentTarget.style.background = '#F5F1EC'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD8D2'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <p className="font-display text-[16px] font-bold mb-1" style={{ color: '#0E0D0C' }}>
                    I need a Service
                  </p>
                  <p className="text-[12px]" style={{ color: '#6B6560' }}>
                    Book skilled workers for home repair
                  </p>
                </button>
                <button
                  onClick={() => selectRole('thekedar')}
                  className="text-left p-4 rounded-sm border-2 transition-all"
                  style={{ borderColor: '#DDD8D2' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E0D0C'; e.currentTarget.style.background = '#F5F1EC'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD8D2'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <p className="font-display text-[16px] font-bold mb-1" style={{ color: '#0E0D0C' }}>
                    I am a Thekedar
                  </p>
                  <p className="text-[12px]" style={{ color: '#6B6560' }}>
                    Grow my business digitally
                  </p>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: FORM ── */}
          {step === 2 && (
            <>
              <h2 className="font-display text-[32px] font-black tracking-[-1px] mb-1" style={{ color: '#0E0D0C' }}>
                {role === 'consumer' ? 'Consumer' : 'Thekedar'} Registration
              </h2>
              <p className="text-[14px] mb-6" style={{ color: '#6B6560' }}>
                Fill in your details to create your account.
              </p>

              {/* role badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: '#FDF0E8', border: '1px solid #FAE0CC' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#D44B0A' }}>
                  Registering as {role === 'consumer' ? 'Customer' : 'Thekedar'}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                    style={{ borderColor: '#DDD8D2' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                    onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                    placeholder="Rajesh Kumar"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                    style={{ borderColor: '#DDD8D2' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                    onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                    placeholder="you@example.com"
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>Mobile Number</label>
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} required maxLength={10}
                    className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                    style={{ borderColor: '#DDD8D2' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                    onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                    placeholder="9876543210"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8}
                    className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                    style={{ borderColor: '#DDD8D2' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                    onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                    placeholder="Min. 8 characters"
                  />
                </div>

                {/* Confirm */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                    className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors"
                    style={{ borderColor: '#DDD8D2' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
                    onBlur={e => e.currentTarget.style.borderColor = '#DDD8D2'}
                    placeholder="Repeat your password"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-sm text-[13px]" style={{ background: '#FDECEA', border: '1px solid #B93424', color: '#B93424' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="mt-2 w-full py-[14px] rounded-sm text-[15px] font-bold text-white transition-colors"
                  style={{ background: '#0E0D0C' }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = '#D44B0A')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = '#0E0D0C')}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-[12px]" style={{ color: '#A89E97' }}>
                  By registering, you agree to our{' '}
                  <span style={{ color: '#6B6560' }}>Terms of Service</span> and{' '}
                  <span style={{ color: '#6B6560' }}>Privacy Policy</span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
