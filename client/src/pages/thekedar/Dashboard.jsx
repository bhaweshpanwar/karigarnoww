import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import ToastContext from '../../context/ToastContext';
import { formatCurrency, formatDate, maskName, isToday, isThisWeek } from '../../utils/formatters';

function StatCard({ label, value, accent }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B6560' }}>
        {label}
      </p>
      <p className="text-3xl font-black" style={{ color: accent ? '#D44B0A' : '#0E0D0C' }}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: '#FEF3C7', color: '#92600A' },
    accepted: { bg: '#EFF6FF', color: '#1A4ED8' },
    dispatched: { bg: '#E8F5EE', color: '#1A6E42' },
    in_progress: { bg: '#FDF0E8', color: '#D44B0A' },
    completed: { bg: '#E8F5EE', color: '#1A6E42' },
    cancelled: { bg: '#FDECEA', color: '#B93424' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}

function RequestCard({ booking, onAccept, onDecline }) {
  const [accepted, setAccepted] = useState(false);
  const [acceptedBooking, setAcceptedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useContext(ToastContext);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/bookings/${booking.id}/accept`);
      if (res.data.success) {
        setAcceptedBooking(res.data.data);
        setAccepted(true);
        showToast(`Booking accepted! OTP: ${res.data.data.otp}`, 'success');
        onAccept(booking.id, res.data.data);
      }
    } catch {
      showToast('Failed to accept booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/bookings/${booking.id}/reject`);
      if (res.data.success) {
        showToast('Booking declined', 'info');
        onDecline(booking.id);
      }
    } catch {
      showToast('Failed to decline booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayBooking = acceptedBooking || booking;
  const serviceName = displayBooking.service?.name || booking.service?.name || 'Service';
  const area = displayBooking.address?.city || booking.address?.city || '';

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}
    >
      {accepted && acceptedBooking ? (
        <div className="text-center py-2">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#1A6E42' }}>
            ✓ Accepted
          </p>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6B6560' }}>
            🔑 OTP — Share with Worker
          </p>
          <div className="flex justify-center gap-2 mb-3">
            {acceptedBooking.otp ? acceptedBooking.otp.split('').map((d, i) => (
              <div
                key={i}
                className="w-12 h-14 rounded-lg flex items-center justify-center text-2xl font-black"
                style={{ background: '#D44B0A', color: '#FFFFFF' }}
              >
                {d}
              </div>
            )) : <span className="text-2xl font-black" style={{ color: '#D44B0A' }}>----</span>}
          </div>
          <p className="text-xs" style={{ color: '#A89E97' }}>
            Dispatch workers from Job Details
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-base" style={{ color: '#0E0D0C' }}>{maskName(booking.consumer_name)}</p>
              <p className="text-sm mt-0.5" style={{ color: '#6B6560' }}>{serviceName}</p>
              {area && <p className="text-xs mt-1" style={{ color: '#A89E97' }}>{area}</p>}
            </div>
            <StatusBadge status={booking.booking_status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
            <span className="text-xs font-semibold" style={{ color: '#6B6560' }}>
              {booking.workers_needed} worker{booking.workers_needed > 1 ? 's' : ''}
            </span>
            {booking.scheduled_at && (
              <span className="text-xs font-semibold" style={{ color: '#6B6560' }}>
                {formatDate(booking.scheduled_at)}
              </span>
            )}
            {booking.total_amount && (
              <span className="text-xs font-bold" style={{ color: '#D44B0A' }}>
                {formatCurrency(booking.total_amount)}
              </span>
            )}
          </div>
          {booking.job_description && (
            <p className="text-xs mb-4 line-clamp-2" style={{ color: '#A89E97' }}>
              {booking.job_description}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1A6E42' }}
            >
              {loading ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: '#B93424', color: '#B93424' }}
            >
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveJobCard({ booking }) {
  const navigate = useNavigate();
  const serviceName = booking.service?.name || 'Service';

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-base" style={{ color: '#0E0D0C' }}>{maskName(booking.consumer_name)}</p>
          <p className="text-sm mt-0.5" style={{ color: '#6B6560' }}>{serviceName}</p>
        </div>
        <StatusBadge status={booking.booking_status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {booking.address && (
          <span className="text-xs" style={{ color: '#6B6560' }}>
            {booking.address.city || ''}
          </span>
        )}
        {booking.scheduled_at && (
          <span className="text-xs" style={{ color: '#6B6560' }}>
            {formatDate(booking.scheduled_at)}
          </span>
        )}
        {booking.total_amount && (
          <span className="text-xs font-bold" style={{ color: '#D44B0A' }}>
            {formatCurrency(booking.total_amount)}
          </span>
        )}
      </div>

      {booking.booking_status === 'accepted' && (
        <button
          onClick={() => navigate(`/thekedar/jobs/${booking.id}`)}
          className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#D44B0A' }}
        >
          Dispatch Workers
        </button>
      )}

      {(booking.booking_status === 'accepted' || booking.booking_status === 'dispatched') && booking.otp && (
        <div>
          <div className="flex justify-center gap-2 mb-3">
            {booking.otp.split('').map((d, i) => (
              <div key={i} className="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-black" style={{ background: '#FDF0E8', color: '#D44B0A' }}>{d}</div>
            ))}
          </div>
          <div className="text-center">
            {booking.booking_status === 'accepted' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#EFF6FF', color: '#1A4ED8' }}>
                OTP Generated — Dispatch Workers
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#E8F5EE', color: '#1A6E42' }}>
                Workers Sent
              </span>
            )}
          </div>
        </div>
      )}

      {booking.booking_status === 'in_progress' && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FDF0E8', color: '#D44B0A' }}>
            Work in Progress
          </span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    Promise.all([
      api.get('/bookings?page=0&size=100'),
      api.get('/workers'),
    ]).then(([bRes, wRes]) => {
      if (bRes.data.success) setBookings(bRes.data.data.content || []);
      if (wRes.data.success) setWorkers(wRes.data.data || []);
    }).catch(() => {
      showToast('Failed to load dashboard data', 'error');
    }).finally(() => setLoading(false));
  }, []);

  const pendingBookings = bookings.filter(b => b.booking_status === 'pending');
  const activeBookings = bookings.filter(b => ['accepted', 'dispatched', 'in_progress'].includes(b.booking_status));
  const todayJobs = bookings.filter(b => b.scheduled_at && isToday(b.scheduled_at));
  const todayEarnings = bookings
    .filter(b => b.booking_status === 'completed' && b.scheduled_at && isToday(b.scheduled_at))
    .reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);
  const weekJobs = bookings.filter(b => b.scheduled_at && isThisWeek(b.scheduled_at));
  const weekEarnings = bookings
    .filter(b => b.booking_status === 'completed' && b.scheduled_at && isThisWeek(b.scheduled_at))
    .reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);

  const handleAccept = (id, updatedBooking) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatedBooking, booking_status: 'accepted' } : b));
  };

  const handleDecline = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#0E0D0C' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: '#6B6560' }}>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Jobs" value={todayJobs.length} />
        <StatCard label="Pending" value={pendingBookings.length} />
        <StatCard label="Today's Earnings" value={formatCurrency(todayEarnings)} accent />
        <StatCard label="Rating" value={`${(user?.rating_average || 0).toFixed(1)}`} />
      </div>

      {/* Incoming Requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#0E0D0C' }}>New Job Requests</h2>
          <Link to="/thekedar/jobs" className="text-sm font-semibold" style={{ color: '#D44B0A' }}>
            View All
          </Link>
        </div>
        {pendingBookings.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
            <p className="text-sm" style={{ color: '#A89E97' }}>No new job requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingBookings.slice(0, 3).map(booking => (
              <RequestCard
                key={booking.id}
                booking={booking}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active Jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#0E0D0C' }}>Active Jobs</h2>
          <Link to="/thekedar/jobs" className="text-sm font-semibold" style={{ color: '#D44B0A' }}>
            View All
          </Link>
        </div>
        {activeBookings.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
            <p className="text-sm" style={{ color: '#A89E97' }}>No active jobs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeBookings.slice(0, 3).map(booking => (
              <ActiveJobCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0E0D0C' }}>This Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Jobs This Week" value={weekJobs.length} />
          <StatCard label="Earnings This Week" value={formatCurrency(weekEarnings)} accent />
          <StatCard label="Avg Rating" value={`${(user?.rating_average || 0).toFixed(1)}`} />
          <StatCard label="Team Size" value={`${workers.length}`} />
        </div>
      </section>
    </div>
  );
}
