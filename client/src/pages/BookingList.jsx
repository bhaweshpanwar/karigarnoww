import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_TABS = ['All', 'pending', 'accepted', 'dispatched', 'in_progress', 'completed', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
  in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  dispatched: 'Dispatched',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function BookingSkeleton() {
  return (
    <div className="animate-pulse p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
      <div className="flex justify-between items-start mb-3">
        <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-3 w-32 bg-gray-200 rounded" /></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  );
}

export default function BookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookings = (tabPage = 0) => {
    if (tabPage === 0) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const params = new URLSearchParams({ page: tabPage, size: 10 });
    if (activeTab !== 'All') params.set('status', activeTab);

    api.get(`/bookings?${params}`)
      .then(res => {
        if (res.data.success) {
          const content = res.data.data.content;
          if (tabPage === 0) setBookings(content);
          else setBookings(prev => [...prev, ...content]);
          setHasMore(res.data.data.currentPage < res.data.data.totalPages - 1);
          setPage(tabPage);
        }
      })
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => { setPage(0); fetchBookings(0); }, [activeTab]);

  const loadMore = () => fetchBookings(page + 1);

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-['Fraunces',serif] text-3xl md:text-4xl font-black text-[#0E0D0C] tracking-[-1px] mb-1">My Bookings</h1>
          <p className="text-[#6B6560] text-sm">Track and manage your service bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors border-2 ${
                activeTab === tab
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                  : 'bg-white border-[#DDD8D2] text-[#6B6560] hover:border-[#D44B0A]'
              }`}
            >
              {tab === 'All' ? 'All' : STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <BookingSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-[#B93424] text-sm mb-3">{error}</p>
            <button onClick={() => fetchBookings(0)} className="text-[#D44B0A] text-sm font-semibold hover:underline">Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-[#0E0D0C] font-bold text-lg mb-2">No bookings yet.</h3>
            <p className="text-[#6B6560] text-sm mb-6">Book your first service!</p>
            <Link to="/services"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#D44B0A] transition-colors">
              Browse Services
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && bookings.length > 0 && (
          <>
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white hover:border-[#D44B0A] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[#0E0D0C] font-semibold mb-0.5">{b.service_name}</h3>
                      <p className="text-[#6B6560] text-xs">{b.thekedar_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[b.booking_status] || ''}`}>
                      {STATUS_LABELS[b.booking_status] || b.booking_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6B6560] mb-3">
                    {b.scheduled_at && <span>📅 {formatDate(b.scheduled_at)}</span>}
                    <span>👷 {b.workers_needed || 1} worker{(b.workers_needed || 1) > 1 ? 's' : ''}</span>
                    <span className="text-[#D44B0A] font-semibold">{formatCurrency(b.total_amount)}</span>
                  </div>
                  <button onClick={() => navigate(`/bookings/${b.id}`)}
                    className="w-full py-2 rounded-lg border-2 border-[#DDD8D2] text-[#6B6560] text-xs font-medium hover:border-[#D44B0A] hover:text-[#D44B0A] transition-colors">
                    View Details
                  </button>
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
  );
}
