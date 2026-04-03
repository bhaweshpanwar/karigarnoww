import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ThekedarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thekedar, setThekedar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchProfile = () => {
    setLoading(true);
    setError('');
    api.get(`/thekedars/${id}`)
      .then(res => { if (res.data.success) setThekedar(res.data.data); })
      .catch(() => setError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'thekedar') { showToast('You cannot book services'); return; }
    navigate(`/book/${id}`);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#FDFCFA] pb-32">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-white border-2 border-[#D44B0A] text-[#0E0D0C] text-sm shadow-lg animate-[fadeDown_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6B6560]">
          <Link to="/" className="hover:text-[#D44B0A]">Home</Link>
          <span>/</span>
          <span className="text-[#0E0D0C] capitalize">{thekedar?.name || '...'}</span>
        </nav>

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-white rounded-xl border border-[#DDD8D2]" />
            <div className="h-24 bg-white rounded-xl border border-[#DDD8D2]" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-[#B93424] text-sm mb-3">{error}</p>
            <button onClick={fetchProfile} className="text-[#D44B0A] text-sm font-semibold hover:underline">Try Again</button>
          </div>
        )}

        {thekedar && !loading && (
          <>
            {/* TOP CARD */}
            <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6">
              <div className="flex items-start gap-5 mb-5">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                  {thekedar.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-[#0E0D0C]">{thekedar.name}</h1>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${thekedar.is_online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {thekedar.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-[#6B6560] text-sm mb-2">{thekedar.location}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#FF6B00]">{'★'.repeat(Math.round(thekedar.rating_average))} <span className="text-[#DDD8D2]">{'★'.repeat(5 - Math.round(thekedar.rating_average))}</span></span>
                    <span className="text-[#6B6560]">{thekedar.rating_average?.toFixed(1)} • {thekedar.total_jobs} jobs completed</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="px-4 py-3 rounded-lg bg-[#F5F1EC]">
                  <p className="text-[#6B6560] text-xs mb-1">Experience</p>
                  <p className="text-[#0E0D0C] font-semibold">{thekedar.experience || 'N/A'}</p>
                </div>
                <div className="px-4 py-3 rounded-lg bg-[#F5F1EC]">
                  <p className="text-[#6B6560] text-xs mb-1">Team Size</p>
                  <p className="text-[#0E0D0C] font-semibold">{(thekedar.team_size || thekedar.workers?.length) ? `${thekedar.team_size || thekedar.workers?.length} workers` : 'N/A'}</p>
                </div>
              </div>

              {thekedar.bio && (
                <p className="mt-4 text-[#6B6560] text-sm leading-relaxed">{thekedar.bio}</p>
              )}
            </div>

            {/* SERVICES */}
            {thekedar.services?.length > 0 && (
              <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6">
                <h2 className="text-lg font-bold text-[#0E0D0C] mb-4">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {thekedar.services.map(svc => (
                    <span key={svc.id} className="px-4 py-2 rounded-full bg-[#F5F1EC] border border-[#DDD8D2] text-sm">
                      <span className="text-[#0E0D0C] font-medium">{svc.name}</span>
                      <span className="text-[#D44B0A] ml-2">₹{svc.custom_rate}/hr</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6">
              <h2 className="text-lg font-bold text-[#0E0D0C] mb-4">What customers say</h2>
              {thekedar.reviews?.length === 0 && (
                <p className="text-[#6B6560] text-sm">No reviews yet</p>
              )}
              <div className="space-y-4">
                {thekedar.reviews?.slice(0, 5).map(review => (
                  <div key={review.id} className="pb-4 border-b border-[#EDE9E4] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#0E0D0C] font-semibold text-sm">{review.consumer_name?.split(' ')[0]}</span>
                      <span className="text-[#FF6B00] text-xs">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-[#6B6560] text-xs mb-1">{review.comment}</p>
                    <p className="text-[#A89E97] text-xs">{formatDate(review.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      {thekedar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#DDD8D2] p-4 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[#6B6560] text-xs">Starting from</p>
              <p className="text-[#0E0D0C] font-bold text-lg">
                ₹{thekedar.services?.[0]?.custom_rate || thekedar.min_rate || 0}<span className="text-[#6B6560] font-normal text-sm">/hr per worker</span>
              </p>
            </div>
            <button
              onClick={handleBook}
              className="px-8 py-3 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#D44B0A] transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
