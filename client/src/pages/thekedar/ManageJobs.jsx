import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency, formatDate, maskName } from '../../utils/formatters';

const TABS = ['Incoming', 'Active', 'Completed', 'Cancelled'];

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
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function BookingCard({ booking, onAccept, onDecline, showDispatch, onDispatch }) {
  const [accepted, setAccepted] = useState(false);
  const { showToast } = useContext(ToastContext);

  const handleAccept = async () => {
    try {
      const res = await api.put(`/bookings/${booking.id}/accept`);
      if (res.data.success) {
        setAccepted(true);
        showToast('Booking accepted!', 'success');
        if (onAccept) onAccept(booking.id, res.data.data);
      }
    } catch {
      showToast('Failed to accept', 'error');
    }
  };

  const handleDecline = async () => {
    try {
      const res = await api.put(`/bookings/${booking.id}/reject`);
      if (res.data.success) {
        showToast('Booking declined', 'info');
        if (onDecline) onDecline(booking.id);
      }
    } catch {
      showToast('Failed to decline', 'error');
    }
  };

  const serviceName = booking.service?.name || 'Service';

  return (
    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold" style={{ color: '#0E0D0C' }}>{maskName(booking.consumer_name)}</p>
          <p className="text-sm" style={{ color: '#6B6560' }}>{serviceName}</p>
        </div>
        <StatusBadge status={booking.booking_status} />
      </div>

      {booking.address && (
        <p className="text-xs mb-2" style={{ color: '#A89E97' }}>
          {booking.address.address_line1}, {booking.address.city}
        </p>
      )}

      {booking.job_description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: '#A89E97' }}>
          {booking.job_description}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
        <span className="text-xs" style={{ color: '#6B6560' }}>
          {booking.workers_needed} worker{booking.workers_needed > 1 ? 's' : ''}
        </span>
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

      {showDispatch && booking.booking_status === 'accepted' && (
        <button
          onClick={() => onDispatch(booking)}
          className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#D44B0A' }}
        >
          Dispatch Workers
        </button>
      )}

      {booking.booking_status === 'pending' && !accepted && (
        <div className="flex gap-3">
          <button onClick={handleAccept} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#1A6E42' }}>
            Accept
          </button>
          <button onClick={handleDecline} className="flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all hover:opacity-80" style={{ borderColor: '#B93424', color: '#B93424' }}>
            Decline
          </button>
        </div>
      )}

      {accepted && (
        <div className="text-center py-2">
          <p className="text-sm font-bold" style={{ color: '#1A6E42' }}>Accepted</p>
          {booking.otp && (
            <div className="flex justify-center gap-2 mt-2">
              {booking.otp.split('').map((d, i) => (
                <div key={i} className="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-black" style={{ background: '#FDF0E8', color: '#D44B0A' }}>{d}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {booking.booking_status === 'dispatched' && booking.assigned_workers && (
        <div className="mt-2">
          <p className="text-xs font-semibold mb-2" style={{ color: '#6B6560' }}>Assigned Workers:</p>
          <div className="flex flex-wrap gap-2">
            {booking.assigned_workers.map(w => (
              <span key={w.id} className="text-xs px-2 py-1 rounded-full" style={{ background: '#FDF0E8', color: '#D44B0A' }}>
                {w.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {booking.booking_status === 'completed' && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold" style={{ color: '#1A6E42' }}>
            Earned: {formatCurrency(booking.thekedar_payout)}
          </span>
          {booking.review && (
            <span className="text-xs" style={{ color: '#92600A' }}>Rating: {booking.review.rating}</span>
          )}
        </div>
      )}
    </div>
  );
}

function DispatchModal({ booking, workers, onClose, onDispatch }) {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useContext(ToastContext);
  const needed = booking?.workers_needed || 1;

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
    setError('');
  };

  const handleDispatch = async () => {
    if (selected.length !== needed) {
      setError(`Select exactly ${needed} worker${needed > 1 ? 's' : ''} (${selected.length} selected)`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${booking.id}/dispatch`, { workerIds: selected });
      if (res.data.success) {
        showToast('Workers dispatched!', 'success');
        onDispatch(booking.id, res.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to dispatch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(14,13,12,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #DDD8D2' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold" style={{ color: '#0E0D0C' }}>Dispatch Workers</h3>
          <button onClick={onClose} className="text-lg" style={{ color: '#6B6560' }}>X</button>
        </div>

        <p className="text-sm mb-4" style={{ color: '#6B6560' }}>
          Select {needed} worker{needed > 1 ? 's' : ''} for this job
        </p>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {workers.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#A89E97' }}>
              No workers available. Add workers first.
            </p>
          ) : workers.map(w => (
            <button
              key={w.id}
              onClick={() => w.is_available && handleToggle(w.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                selected.includes(w.id)
                  ? 'border-[#D44B0A]'
                  : w.is_available
                    ? 'border-[#DDD8D2] hover:border-[#A89E97]'
                    : 'border-[#EDE9E4] opacity-40 cursor-not-allowed'
              }`}
              style={{ background: selected.includes(w.id) ? '#FDF0E8' : '#FAFAFA' }}
              disabled={!w.is_available}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                selected.includes(w.id) ? 'border-[#D44B0A] bg-[#D44B0A]' : 'border-[#DDD8D2]'
              }`}>
                {selected.includes(w.id) && <span className="text-xs text-white font-bold">OK</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#0E0D0C' }}>{w.name}</p>
                <p className="text-xs" style={{ color: '#6B6560' }}>
                  {Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}
                </p>
              </div>
              <span className={`text-xs font-bold ${w.is_available ? 'text-[#1A6E42]' : 'text-[#A89E97]'}`}>
                {w.is_available ? 'Available' : 'Busy'}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-center mb-4 py-2 rounded-lg" style={{ background: '#FDECEA', color: '#B93424' }}>
            {error}
          </p>
        )}

        <p className="text-xs text-center mb-4" style={{ color: '#6B6560' }}>
          Select {needed} worker{needed > 1 ? 's' : ''} ({selected.length} selected)
        </p>

        <button
          onClick={handleDispatch}
          disabled={submitting}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#D44B0A' }}
        >
          {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
        </button>
      </div>
    </div>
  );
}

export default function ManageJobs() {
  const [activeTab, setActiveTab] = useState('Incoming');
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchBooking, setDispatchBooking] = useState(null);
  const { showToast } = useContext(ToastContext);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/bookings?page=0&size=100'),
      api.get('/workers'),
    ]).then(([bRes, wRes]) => {
      if (bRes.data.success) setBookings(bRes.data.data.content || []);
      if (wRes.data.success) setWorkers(wRes.data.data || []);
    }).catch(() => showToast('Failed to load jobs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Incoming') return b.booking_status === 'pending';
    if (activeTab === 'Active') return ['accepted', 'dispatched', 'in_progress'].includes(b.booking_status);
    if (activeTab === 'Completed') return b.booking_status === 'completed';
    if (activeTab === 'Cancelled') return b.booking_status === 'cancelled';
    return true;
  });

  const handleAccept = (id, data) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleDecline = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleDispatch = (id, data) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    setDispatchBooking(null);
  };

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-3xl font-black mb-6" style={{ color: '#0E0D0C' }}>Manage Jobs</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: activeTab === tab ? '#D44B0A' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : '#6B6560',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
          <p className="text-sm" style={{ color: '#A89E97' }}>No {activeTab.toLowerCase()} jobs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onDecline={handleDecline}
              showDispatch={activeTab === 'Active'}
              onDispatch={(b) => setDispatchBooking(b)}
            />
          ))}
        </div>
      )}

      {dispatchBooking && (
        <DispatchModal
          booking={dispatchBooking}
          workers={workers}
          onClose={() => setDispatchBooking(null)}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  );
}
