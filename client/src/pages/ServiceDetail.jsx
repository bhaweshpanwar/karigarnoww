import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function StarRating({ rating }) {
  return (
    <span className="text-[#FF6B00] text-sm">
      {'★'.repeat(Math.round(rating))}
      <span className="text-[#DDD8D2]">{'★'.repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

function ThekedarSkeleton() {
  return (
    <div className="animate-pulse p-5 rounded-xl border border-[#DDD8D2] bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
    </div>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [thekedars, setThekedars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [city, setCity] = useState('');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchService = (pageNum = 0) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const params = new URLSearchParams({ page: pageNum, size: 12 });
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (city) params.set('city', city);

    api.get(`/services/${slug}?${params}`)
      .then(res => {
        if (res.data.success) {
          const data = res.data.data;
          setService(data.service);
          if (pageNum === 0) setThekedars(data.thekedars.content);
          else setThekedars(prev => [...prev, ...data.thekedars.content]);
          setHasMore(data.thekedars.currentPage < data.thekedars.totalPages - 1);
          setPage(pageNum);
        }
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => { fetchService(0); }, [slug, sort]);

  const handleSearch = e => {
    e.preventDefault();
    fetchService(0);
  };

  const loadMore = () => fetchService(page + 1);

  const handleBook = thekedarId => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'thekedar') { alert('Thekedars cannot book services'); return; }
    navigate(`/book/${thekedarId}`);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#FDFCFA] pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6B6560]">
          <Link to="/" className="hover:text-[#D44B0A] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-[#D44B0A] transition-colors">Services</Link>
          <span>/</span>
          <span className="text-[#0E0D0C] capitalize">{slug}</span>
        </nav>

        {/* Service heading */}
        {service && (
          <div className="mb-8">
            <h1 className="font-['Fraunces',serif] text-4xl md:text-5xl font-black text-[#0E0D0C] tracking-[-2px] mb-2">
              {service.name}
            </h1>
            <p className="text-[#6B6560] text-base">{service.description}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Search</p>
                <form onSubmit={handleSearch}>
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Thekedar name..."
                    className="w-full px-3 py-2.5 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm placeholder-[#A89E97] outline-none focus:border-[#0E0D0C] transition-colors"
                  />
                </form>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Sort By</p>
                <div className="flex flex-col gap-2">
                  {[{ v: 'rating', l: 'Top Rated' }, { v: 'price', l: 'Lowest Price' }].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => { setSort(opt.v); fetchService(0); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2 ${
                        sort === opt.v
                          ? 'bg-[#0E0D0C] border-[#0E0D0C] text-white'
                          : 'bg-white border-[#DDD8D2] text-[#6B6560] hover:border-[#D44B0A]'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">City</p>
                <input
                  type="text" value={city} onChange={e => { setCity(e.target.value); fetchService(0); }}
                  placeholder="e.g. Indore"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm placeholder-[#A89E97] outline-none focus:border-[#0E0D0C] transition-colors"
                />
              </div>
            </div>
          </aside>

          {/* Thekedar grid */}
          <div className="flex-1">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <ThekedarSkeleton key={i} />)}
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <p className="text-[#B93424] text-sm mb-3">{error}</p>
                <button onClick={() => fetchService(0)} className="text-[#D44B0A] text-sm font-semibold hover:underline">Try Again</button>
              </div>
            )}

            {!loading && !error && thekedars.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#6B6560] text-lg">No thekedars available for this service in your area yet.</p>
              </div>
            )}

            {!loading && !error && thekedars.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {thekedars.map(t => (
                    <div key={t.id} className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white hover:border-[#D44B0A] transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#0E0D0C] truncate">{t.name}</h3>
                            {t.is_online && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Online" />}
                          </div>
                          <p className="text-[#6B6560] text-xs truncate">{t.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={t.rating_average} />
                        <span className="text-[#6B6560] text-xs">{t.rating_average?.toFixed(1)} ({t.total_jobs} jobs)</span>
                      </div>
                      <p className="text-[#D44B0A] font-semibold text-sm mb-3">₹{t.custom_rate}/hr per worker</p>
                      <p className="text-[#6B6560] text-xs mb-4">{t.experience}</p>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/thekedars/${t.id}`)}
                          className="flex-1 py-2 rounded-lg border-2 border-[#DDD8D2] text-[#6B6560] text-xs font-medium hover:border-[#D44B0A] hover:text-[#D44B0A] transition-colors">
                          View Profile
                        </button>
                        <button onClick={() => handleBook(t.id)}
                          className="flex-1 py-2 rounded-lg bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#D44B0A] transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-6 text-center">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="px-8 py-3 rounded-xl border-2 border-[#DDD8D2] text-[#6B6560] text-sm font-medium hover:border-[#D44B0A] hover:text-[#D44B0A] transition-colors disabled:opacity-50">
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
