import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATS = [
  { value: '2,400+', label: 'Verified Thekedars' },
  { value: '18,000+', label: 'Jobs Completed' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '47 min', label: 'Avg Response Time' },
];

const HOW_STEPS = [
  { num: '01', title: 'Choose Service', desc: 'Browse categories and pick the service you need — plumbing, electrical, painting and more.' },
  { num: '02', title: 'See Nearby Thekedars', desc: 'View ratings, rates and experience of local contractors offering your selected service.' },
  { num: '03', title: 'Book & Pay', desc: 'Share your address, pay securely via escrow. Your payment is held until the job is done.' },
  { num: '04', title: 'Rate Your Karigar', desc: 'Workers arrive, you share the OTP to confirm arrival. After completion, rate your experience.' },
];

function ServiceSkeleton() {
  return (
    <div className="animate-pulse p-8">
      <div className="h-3 w-12 bg-gray-200 rounded mb-3" />
      <div className="h-6 w-28 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
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
      .then(res => {
        if (res.data.success) setServices(res.data.data);
      })
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#FDFCFA] text-[#0E0D0C]">
      {/* ── HERO ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_2px_380px] min-h-[calc(100vh-56px)] border-b-2 border-[#0E0D0C]">
        {/* left */}
        <div className="relative flex flex-col justify-between px-14 py-16 lg:py-20">
          {/* radial saffron glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 55% at 50% 55%, rgba(255,107,0,0.07) 0%, transparent 70%)',
            }}
          />
          <div>
            <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#A89E97] mb-8">
              Trusted Local Labour Platform
            </p>
            <h1
              className="font-['Fraunces',serif] font-black leading-[0.97] tracking-[-3px] text-[#0E0D0C] mb-0"
              style={{ fontSize: 'clamp(52px, 7vw, 96px)' }}
            >
              Skilled Hands,
              <br />
              <span className="italic text-[#D44B0A]">One Tap</span>
              <br />
              Away
            </h1>
            <div className="mt-10 flex items-end gap-8 flex-wrap">
              <p className="font-['Fraunces',serif] italic text-[18px] text-[#6B6560] max-w-[380px] leading-relaxed">
                Apna kaam, apna worker
              </p>
              <p className="text-[14px] text-[#6B6560] max-w-[240px] leading-relaxed">
                Connect with verified local karigars for plumbing, electrical, painting, carpentry and more.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-10">
            <button
              onClick={() => navigate('/services')}
              className="px-7 py-3.5 rounded-lg bg-[#FF6B00] text-white text-[14px] font-bold hover:bg-[#D44B0A] transition-colors"
            >
              Book a Service
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 rounded-lg bg-white text-[#0E0D0C] text-[14px] font-bold border-2 border-[#0E0D0C] hover:bg-[#F5F1EC] transition-colors"
            >
              Register as Thekedar
            </button>
          </div>
        </div>

        {/* divider */}
        <div className="hidden lg:block bg-[#0E0D0C]" />

        {/* right stats */}
        <aside className="hidden lg:flex flex-col border-t-2 lg:border-t-0 lg:border-l-2 border-[#0E0D0C]">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-8 py-7 flex flex-col justify-center border-b border-[#EDE9E4] ${i === STATS.length - 1 ? 'border-b-0' : ''}`}
            >
              <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A89E97] mb-2">{s.label}</p>
              <p className="font-['Fraunces',serif] text-[36px] font-black tracking-[-1.5px] text-[#0E0D0C] leading-none">
                {s.value}
              </p>
            </div>
          ))}
        </aside>
      </section>

      {/* ── STATS TICKER (mobile) ── */}
      <div className="lg:hidden bg-[#0E0D0C] flex overflow-x-auto">
        {STATS.map(s => (
          <div key={s.label} className="flex-shrink-0 px-8 py-4 border-r border-white/10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/40 mb-1">{s.label}</p>
            <p className="font-['Fraunces',serif] text-[28px] font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── SERVICE CATEGORIES ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] border-b-2 border-[#0E0D0C]">
        <div className="p-10 lg:p-14 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0E0D0C] flex flex-col justify-between bg-[#FDFCFA]">
          <div>
            <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#A89E97] mb-4">What We Offer</p>
            <h2 className="font-['Fraunces',serif] text-[38px] font-black tracking-[-1.5px] leading-[1.05] text-[#0E0D0C] mb-4">
              Every Trade,<br />One Platform
            </h2>
            <p className="text-[13.5px] text-[#6B6560] leading-relaxed">
              From a leaking tap to a full home painting — find skilled karigars for every job.
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="mt-8 self-start px-6 py-3 rounded-lg bg-[#FF6B00] text-white text-[13px] font-bold hover:bg-[#D44B0A] transition-colors"
          >
            View All Services
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-8 border-b border-r border-[#EDE9E4]">
                <ServiceSkeleton />
              </div>
            ))
          ) : error ? (
            <div className="p-8 col-span-full text-center py-16">
              <p className="text-[#B93424] text-[14px] mb-2">{error}</p>
              <button onClick={() => window.location.reload()} className="text-[#D44B0A] text-sm font-semibold hover:underline">
                Try Again
              </button>
            </div>
          ) : (
            services.map((svc, i) => (
              <div
                key={svc.id}
                onClick={() => navigate(`/services/${svc.slug}`)}
                className="p-8 border-b border-r border-[#EDE9E4] cursor-pointer hover:bg-[#FDF0E8] transition-colors group"
              >
                <p className="font-['Fraunces',serif] text-[11px] font-bold text-[#A89E97] tracking-wide mb-3">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-['Fraunces',serif] text-[22px] font-bold tracking-[-0.5px] text-[#0E0D0C] mb-2 group-hover:text-[#D44B0A] transition-colors">
                  {svc.name}
                </h3>
                <p className="text-[12.5px] text-[#6B6560] mb-3">{svc.description}</p>
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-[#EDE9E4] text-[#A89E97] group-hover:bg-[#FAE0CC] group-hover:text-[#D44B0A] transition-colors">
                  Book Now
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b-2 border-[#0E0D0C]">
        {HOW_STEPS.map((step, i) => (
          <div
            key={step.num}
            className={`p-10 lg:p-12 ${i < HOW_STEPS.length - 1 ? 'border-b-2 sm:border-b-0 sm:border-r border-[#EDE9E4]' : ''} ${i >= 2 ? 'lg:border-t-2 lg:border-[#EDE9E4]' : ''}`}
          >
            <p className="font-['Fraunces',serif] text-[56px] font-black tracking-[-2px] text-[#DDD8D2] leading-none mb-5">
              {step.num}
            </p>
            <h3 className="font-['Fraunces',serif] text-[18px] font-bold tracking-[-0.3px] text-[#0E0D0C] mb-3">
              {step.title}
            </h3>
            <p className="text-[13px] text-[#6B6560] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0E0D0C] px-10 lg:px-14 py-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <p className="font-['Fraunces',serif] text-[20px] font-black text-white">
            Karigar<span className="text-[#FF6B2B]">Now</span>
          </p>
          <p className="text-[12.5px] text-white/40">Apna kaam, apna worker</p>
        </div>
        <p className="text-[12px] text-white/25">
          &copy; {new Date().getFullYear()} KarigarNow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
