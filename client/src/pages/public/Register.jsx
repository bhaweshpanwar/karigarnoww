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
    if (validationError) {
      setError(validationError);
      return;
    }
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
            {step === 1 ? (
              <>Join the<br /><em className="not-italic text-[#FF6B2B]">platform.</em></>
            ) : (
              <>Almost<br />there,<br /><em className="not-italic text-[#FF6B2B]">one step</em><br />away.</>
            )}
          </h1>
          <p className="font-['Fraunces',serif] italic text-[16px] text-white/40 mt-6 max-w-[320px] leading-relaxed">
            Apna kaam, apna worker — be part of India's trusted local labour network.
          </p>
        </div>
        {/* proof row */}
        <div className="mt-12 flex flex-col gap-4">
          {[
            { n: '01', t: 'Verified Thekedars', d: 'All contractors are vetted before joining.' },
            { n: '02', t: 'Secure Payments', d: 'Escrow protects both customers and karigars.' },
            { n: '03', t: 'OTP-Verified Jobs', d: 'Every job is confirmed with a 4-digit OTP.' },
          ].map(item => (
            <div key={item.n} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.05] border border-white/[0.08]">
              <span className="font-['Fraunces',serif] text-[24px] font-black text-[#FF6B2B] leading-none flex-shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-[13px] font-bold text-white/80">{item.t}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
        {/* decorative number */}
        <div
          className="absolute bottom-[-20px] right-[-10px] font-['Fraunces',serif] text-[240px] font-black text-white/[0.03] leading-none pointer-events-none select-none"
          style={{ letterSpacing: '-8px' }}
        >
          {step === 1 ? '01' : '02'}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-[#FDFCFA] flex items-start justify-center px-6 py-16 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center justify-between">
            <p className="font-['Fraunces',serif] text-[22px] font-black text-[#0E0D0C]">
              Karigar<span className="text-[#D44B0A]">Now</span>
            </p>
            {step === 2 && (
              <button onClick={goBack} className="text-[13px] text-[#6B6560] hover:text-[#0E0D0C] flex items-center gap-1">
                ← Back
              </button>
            )}
          </div>

          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <>
              <h2 className="font-['Fraunces',serif] text-[32px] font-black tracking-[-1px] text-[#0E0D0C] mb-1">
                Create account
              </h2>
              <p className="text-[14px] text-[#6B6560] mb-8">
                Already have an account?{' '}
                <Link to="/login" className="text-[#D44B0A] font-bold">
                  Sign in
                </Link>
              </p>

              <p className="text-[13px] font-bold text-[#A89E97] uppercase tracking-[0.8px] mb-4">
                I want to...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Consumer card */}
                <button
                  onClick={() => selectRole('consumer')}
                  className="text-left p-5 rounded-xl border-2 border-[#DDD8D2] hover:border-[#0E0D0C] hover:bg-[#F5F1EC] transition-all group"
                >
                  <div className="mb-4">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <rect width="36" height="36" rx="8" fill="#FDF0E8"/>
                      <path d="M18 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" fill="#D44B0A"/>
                    </svg>
                  </div>
                  <p className="font-['Fraunces',serif] font-bold text-[16px] text-[#0E0D0C] mb-1 group-hover:text-[#D44B0A] transition-colors">
                    I need a Service
                  </p>
                  <p className="text-[12px] text-[#6B6560] leading-relaxed">
                    Book skilled workers for home repair
                  </p>
                </button>

                {/* Thekedar card */}
                <button
                  onClick={() => selectRole('thekedar')}
                  className="text-left p-5 rounded-xl border-2 border-[#DDD8D2] hover:border-[#0E0D0C] hover:bg-[#F5F1EC] transition-all group"
                >
                  <div className="mb-4">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <rect width="36" height="36" rx="8" fill="#F5F1EC"/>
                      <path d="M10 26V14l8-6 8 6v12H10zm4-10h4v6h4v-6h4l-6-4.5L14 16z" fill="#0E0D0C"/>
                    </svg>
                  </div>
                  <p className="font-['Fraunces',serif] font-bold text-[16px] text-[#0E0D0C] mb-1 group-hover:text-[#D44B0A] transition-colors">
                    I am a Thekedar
                  </p>
                  <p className="text-[12px] text-[#6B6560] leading-relaxed">
                    Grow my business digitally
                  </p>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: REGISTRATION FORM ── */}
          {step === 2 && (
            <>
              <div className="mb-2">
                <p className="text-[12px] text-[#A89E97] font-bold uppercase tracking-widest mb-1">
                  Step 2 of 2
                </p>
                <div className="flex gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-[#0E0D0C]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#0E0D0C]" />
                </div>
              </div>

              <h2 className="font-['Fraunces',serif] text-[32px] font-black tracking-[-1px] text-[#0E0D0C] mb-1">
                {role === 'consumer' ? 'Consumer' : 'Thekedar'} Registration
              </h2>
              <p className="text-[14px] text-[#6B6560] mb-6">
                Fill in your details to create your account.
              </p>

              {/* role badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDF0E8] border border-[#FAE0CC] mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D44B0A]">
                  Registering as {role === 'consumer' ? 'Customer' : 'Thekedar'}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                    placeholder="Rajesh Kumar"
                  />
                </div>

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

                {/* Mobile */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                    placeholder="9876543210"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#A89E97] uppercase tracking-[0.8px]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 rounded-lg border-2 border-[#DDD8D2] bg-white text-[#0E0D0C] text-[14px] outline-none focus:border-[#0E0D0C] transition-colors"
                    placeholder="Repeat your password"
                  />
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-[12px] text-[#A89E97]">
                  By registering, you agree to our{' '}
                  <span className="text-[#6B6560]">Terms of Service</span> and{' '}
                  <span className="text-[#6B6560]">Privacy Policy</span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
