import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ServiceSkeleton() {
  return (
    <div className="animate-pulse p-6 rounded-xl border border-[#DDD8D2]">
      <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
      <div className="h-7 w-36 bg-gray-200 rounded mb-3" />
      <div className="h-3 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchServices = () => {
    setLoading(true);
    setError('');
    api.get('/services')
      .then(res => {
        if (res.data.success) setServices(res.data.data);
      })
      .catch(() => setError('Could not load services. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#FDFCFA] pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Fraunces',serif] text-4xl md:text-5xl font-black text-[#0E0D0C] tracking-[-2px] mb-2">
            What do you need fixed today?
          </h1>
          <p className="text-[#6B6560] text-base">Browse from our services below</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full md:w-96 px-4 py-3 rounded-xl bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm placeholder-[#A89E97] outline-none focus:border-[#0E0D0C] transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-4 px-5 py-4 rounded-xl bg-[#FDECEA] border border-[#B93424]">
            <span className="text-[#B93424] text-sm">{error}</span>
            <button onClick={fetchServices} className="ml-auto text-[13px] font-semibold text-[#D44B0A] hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ServiceSkeleton key={i} />)}
          </div>
        )}

        {/* Empty search */}
        {!loading && !error && filtered.length === 0 && search && (
          <div className="text-center py-20">
            <p className="text-[#6B6560] text-lg mb-2">No services found for "{search}"</p>
            <button onClick={() => setSearch('')} className="text-[#D44B0A] text-sm font-semibold hover:underline">
              Clear search
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(svc => (
              <div
                key={svc.id}
                onClick={() => navigate(`/services/${svc.slug}`)}
                className="group p-6 rounded-xl border-2 border-[#DDD8D2] bg-white hover:border-[#FF6B00] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,107,0,0.12)]"
              >
                <p className="font-['Fraunces',serif] text-[11px] font-bold text-[#A89E97] tracking-widest uppercase mb-3">
                  Service
                </p>
                <h3 className="font-['Fraunces',serif] text-[22px] font-bold text-[#0E0D0C] mb-2 group-hover:text-[#D44B0A] transition-colors">
                  {svc.name}
                </h3>
                <p className="text-[#6B6560] text-[13px] leading-relaxed mb-4 line-clamp-2">
                  {svc.description}
                </p>
                <span className="inline-flex items-center text-[13px] font-semibold text-[#D44B0A] group-hover:underline">
                  View Thekedars
                  <svg className="ml-1.5 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
