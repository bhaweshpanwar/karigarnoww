import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATS = [
  { value: '2,400+', label: 'Verified Thekedars', accent: true },
  { value: '18,000+', label: 'Jobs Completed', accent: false },
  { value: '4.8★', label: 'Average Rating', accent: true },
  { value: '47 min', label: 'Avg Response', accent: false },
];

const HOW_STEPS = [
  { num: '01', title: 'Choose Service', desc: 'Browse categories and pick the service you need — plumbing, electrical, painting and more.' },
  { num: '02', title: 'See Nearby Thekedars', desc: 'View ratings, rates and experience of local contractors offering your selected service.' },
  { num: '03', title: 'Book & Pay', desc: 'Share your address, pay securely via escrow. Your payment is held until the job is done.' },
  { num: '04', title: 'Rate Your Karigar', desc: 'Workers arrive, you share the OTP to confirm arrival. After completion, rate your experience.' },
];

const TICKER_ITEMS = [
  'Plumbing Available',
  'Painters Ready',
  'Electricians Online',
  'Carpenters Near You',
];

function ServiceSkeleton() {
  return (
    <div className="animate-pulse p-8">
      <div className="h-3 w-12 bg-rule2 rounded mb-3" />
      <div className="h-6 w-28 bg-rule2 rounded mb-2" />
      <div className="h-3 w-full bg-rule2 rounded mb-2" />
      <div className="h-3 w-2/3 bg-rule2 rounded" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/services')
      .then(res => { if (res.data.success) setServices(res.data.data); })
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] border-b-2 border-ink min-h-[calc(100vh-56px)]"
        style={{ borderBottom: '2px solid #0E0D0C' }}
      >
        {/* LEFT */}
        <div
          className="flex flex-col justify-between relative"
          style={{ padding: '72px 60px 64px', borderRight: '2px solid #0E0D0C' }}
        >
          <div>
            <p
              className="text-[10px] font-bold tracking-[3px] uppercase mb-8"
              style={{ color: '#A89E97' }}
            >
              INDIA&apos;S LABOUR MARKETPLACE
            </p>
            <h1
              className="font-display font-black leading-[0.97] tracking-[-3px]"
              style={{ fontSize: 'clamp(52px, 7vw, 96px)', color: '#0E0D0C' }}
            >
              Skilled{' '}
              <span style={{ fontStyle: 'normal' }}>hands,</span>
              <br />
              <span style={{ fontStyle: 'italic', color: '#D44B0A' }}>one tap</span>
              <br />
              away.
            </h1>
          </div>

          <div className="mt-10">
            <p className="font-display italic text-[18px] mb-8" style={{ color: '#6B6560' }}>
              Apna kaam, apna worker
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3.5 rounded-sm text-[14px] font-bold text-white transition-colors"
                style={{ background: '#0E0D0C', transform: 'translateY(-2px)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#D44B0A'}
                onMouseLeave={e => e.currentTarget.style.background = '#0E0D0C'}
              >
                Book a Service
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3.5 rounded-sm text-[14px] font-bold bg-white transition-colors"
                style={{ border: '2px solid #0E0D0C', transform: 'translateY(-2px)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F1EC'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                Register as Thekedar
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT STATS */}
        <aside
          className="hidden lg:flex flex-col"
          style={{ borderLeft: '2px solid #0E0D0C' }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="px-9 py-6 flex flex-col justify-center"
              style={{
                borderBottom: i < STATS.length - 1 ? '1.5px solid #EDE9E4' : 'none',
              }}
            >
              <p
                className="text-[10px] font-bold tracking-[2px] uppercase mb-2"
                style={{ color: '#A89E97' }}
              >
                {s.label}
              </p>
              <p
                className="font-display text-[36px] font-black tracking-[-1.5px] leading-none"
                style={{ color: s.accent ? '#D44B0A' : '#0E0D0C' }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </aside>
      </section>

      {/* ── TICKER STRIP ── */}
      <div
        className="flex overflow-x-auto"
        style={{ background: '#0E0D0C', borderBottom: '2px solid #0E0D0C' }}
      >
        {TICKER_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-8 py-4 flex items-center gap-3"
            style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-white text-[14px] font-semibold">{item}</span>
          </div>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section
        className="grid grid-cols-1 lg:grid-cols-[260px_1fr]"
        style={{ borderBottom: '2px solid #0E0D0C' }}
      >
        {/* Left intro */}
        <div
          className="flex flex-col justify-between"
          style={{
            padding: '56px 40px 56px 56px',
            borderRight: '2px solid #0E0D0C',
            borderBottom: '2px solid #0E0D0C',
          }}
        >
          <div>
            <p className="text-[10px] font-bold tracking-[3px] uppercase mb-4" style={{ color: '#A89E97' }}>
              What We Offer
            </p>
            <h2 className="font-display text-[38px] font-black tracking-[-1.5px] leading-[1.05] mb-4" style={{ color: '#0E0D0C' }}>
              Our Services
            </h2>
            <p className="text-[13.5px] leading-relaxed" style={{ color: '#6B6560' }}>
              From a leaking tap to a full home painting — find skilled karigars for every job.
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="mt-8 self-start px-6 py-3 rounded-sm text-[13px] font-bold text-white transition-colors"
            style={{ background: '#0E0D0C' }}
            onMouseEnter={e => e.currentTarget.style.background = '#D44B0A'}
            onMouseLeave={e => e.currentTarget.style.background = '#0E0D0C'}
          >
            Browse All Services
          </button>
        </div>

        {/* Right grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white"
          style={{ borderBottom: '2px solid #0E0D0C' }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-8" style={{ borderRight: '1.5px solid #DDD8D2', borderBottom: '1.5px solid #DDD8D2' }}>
                <ServiceSkeleton />
              </div>
            ))
          ) : error ? (
            <div className="p-8 col-span-full text-center py-16">
              <p className="text-[14px] mb-2" style={{ color: '#B93424' }}>{error}</p>
              <button onClick={() => window.location.reload()} className="text-[13px] font-semibold" style={{ color: '#D44B0A' }}>
                Try Again
              </button>
            </div>
          ) : (
            services.map((svc, i) => (
              <div
                key={svc.id}
                onClick={() => navigate(`/services/${svc.slug}`)}
                className="cursor-pointer transition-colors"
                style={{ padding: '32px 28px', borderRight: '1.5px solid #DDD8D2', borderBottom: '1.5px solid #DDD8D2' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDF0E8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p className="font-display text-[11px] font-bold mb-3" style={{ color: '#A89E97' }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-[22px] font-bold tracking-[-0.5px] mb-2" style={{ color: '#0E0D0C' }}>
                  {svc.name}
                </h3>
                <p className="text-[12.5px] mb-3" style={{ color: '#6B6560' }}>{svc.description}</p>
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm transition-colors"
                  style={{ background: '#EDE9E4', color: '#A89E97' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FAE0CC'; e.currentTarget.style.color = '#D44B0A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#EDE9E4'; e.currentTarget.style.color = '#A89E97'; }}
                >
                  Book Now
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ borderBottom: '2px solid #0E0D0C' }}
      >
        {HOW_STEPS.map((step, i) => (
          <div
            key={step.num}
            className="p-12"
            style={{
              borderRight: i < HOW_STEPS.length - 1 ? '1.5px solid #DDD8D2' : 'none',
              borderBottom: i >= 2 ? '2px solid #DDD8D2' : 'none',
            }}
          >
            <p
              className="font-display text-[56px] font-black tracking-[-2px] text-rule mb-5"
              style={{ color: '#DDD8D2' }}
            >
              {step.num}
            </p>
            <h3 className="font-display text-[18px] font-bold tracking-[-0.3px] mb-3" style={{ color: '#0E0D0C' }}>
              {step.title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: '#6B6560' }}>{step.desc}</p>
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="flex flex-col sm:flex-row justify-between items-center gap-6"
        style={{ background: '#0E0D0C', padding: '40px 56px' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <p className="font-display text-[20px] font-black text-white">
            Karigar<span style={{ color: '#FF6B2B' }}>Now</span>
          </p>
          <p className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Apna kaam, apna worker</p>
        </div>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          &copy; {new Date().getFullYear()} KarigarNow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
