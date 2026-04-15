import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency, formatDate, maskName } from '../../utils/formatters';

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
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {status?.replace('_', ' ')}
    </span>
  );
}

const STATUS_STEPS = ['pending', 'accepted', 'dispatched', 'in_progress', 'completed'];
const STEP_LABELS = {
  pending: 'Booked',
  accepted: 'Accepted',
  dispatched: 'Dispatched',
  in_progress: 'In Progress',
  completed: 'Completed',
};

// ── OTP Display Box ──────────────────────────────────────────
function OtpDisplayBox({ otp }) {
  if (!otp) return null;
  return (
    <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#FDF0E8', border: '1px solid #F5E0CC' }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6B6560' }}>
        🔑 OTP Generated — Share with Worker
      </p>
      <div className="flex justify-center gap-3 mb-3">
        {otp.split('').map((d, i) => (
          <div key={i}
            className="w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-black"
            style={{ background: '#D44B0A', color: '#FFFFFF' }}>
            {d}
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: '#A89E97' }}>Worker enters this at customer's location</p>
    </div>
  );
}

// ── Dispatch Modal ───────────────────────────────────────────
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
        onDispatch(res.data.data);
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
          <button onClick={onClose} className="text-lg" style={{ color: '#6B6560' }}>✕</button>
        </div>

        <p className="text-xs mb-4" style={{ color: '#6B6560' }}>
          Select exactly {needed} worker{needed > 1 ? 's' : ''} for this job
        </p>

        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {workers.map(w => {
            const isSelected = selected.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => handleToggle(w.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: isSelected ? '#D44B0A' : '#DDD8D2',
                  background: isSelected ? '#FFF8F5' : '#FFFFFF',
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '#FDF0E8', color: '#D44B0A' }}>
                  {w.name?.charAt(0) || 'W'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#0E0D0C' }}>{w.name}</p>
                  <p className="text-xs" style={{ color: '#6B6560' }}>
                    {Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#D44B0A] bg-[#D44B0A]' : 'border-[#DDD8D2]'}`}>
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {error && <p className="text-xs mb-3 text-center" style={{ color: '#B93424' }}>{error}</p>}

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

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [booking, setBooking] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get('/workers'),
    ]).then(([bRes, wRes]) => {
      if (bRes.data.success) setBooking(bRes.data.data);
      if (wRes.data.success) setWorkers(wRes.data.data || []);
    }).catch(() => showToast('Failed to load booking', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await api.put(`/bookings/${id}/accept`);
      if (res.data.success) {
        setBooking(res.data.data);
        showToast('Booking accepted! OTP generated.', 'success');
      }
    } catch {
      showToast('Failed to accept', 'error');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const res = await api.put(`/bookings/${id}/reject`);
      if (res.data.success) {
        showToast('Booking declined', 'info');
        navigate('/thekedar/jobs');
      }
    } catch {
      showToast('Failed to decline', 'error');
    } finally {
      setDeclining(false);
    }
  };

  const handleDispatch = (updatedBooking) => {
    setBooking(updatedBooking);
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-20 md:pb-0">
        <div className="h-12 w-48 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
        <div className="h-64 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="font-bold" style={{ color: '#0E0D0C' }}>Booking not found</p>
      </div>
    );
  }

  const serviceName = booking.service?.name || 'Service';
  const currentStepIdx = STATUS_STEPS.indexOf(booking.booking_status);

  return (
    <div className="pb-20 md:pb-0">
      <button
        onClick={() => navigate('/thekedar/jobs')}
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
        style={{ color: '#6B6560' }}
      >
        ← Back to Jobs
      </button>

      <h1 className="text-3xl font-black mb-6" style={{ color: '#0E0D0C' }}>Job Details</h1>

      {/* Timeline */}
      <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        <h2 className="text-sm font-bold mb-5" style={{ color: '#0E0D0C' }}>Job Timeline</h2>
        <div className="flex items-center">
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStepIdx;
            const active = idx === currentStepIdx;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                    style={{
                      background: done ? '#D44B0A' : '#FFFFFF',
                      borderColor: done ? '#D44B0A' : '#DDD8D2',
                      color: done ? '#FFFFFF' : '#DDD8D2',
                      boxShadow: active ? '0 0 0 4px rgba(212,74,10,0.2)' : 'none',
                      animation: active ? 'pulse-ring 1.5s infinite' : 'none',
                    }}
                  >
                    {done ? '✓' : idx + 1}
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-center leading-tight"
                    style={{ color: done ? '#0E0D0C' : '#DDD8D2' }}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1" style={{ background: idx < currentStepIdx ? '#D44B0A' : '#DDD8D2' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#0E0D0C' }}>{serviceName}</h2>
            <p className="text-sm" style={{ color: '#6B6560' }}>
              Booked by {maskName(booking.consumer_name)}
            </p>
          </div>
          <StatusBadge status={booking.booking_status} />
        </div>

        {/* OTP Section */}
        {(booking.booking_status === 'accepted' || booking.booking_status === 'dispatched') && booking.otp && (
          <OtpDisplayBox otp={booking.otp} />
        )}

        {/* Dispatched Workers */}
        {(booking.booking_status === 'dispatched' || booking.booking_status === 'in_progress' || booking.booking_status === 'completed') && booking.assigned_workers && (
          <div className="rounded-xl p-5 mb-6" style={{ background: '#E8F5EE', border: '1px solid #D1E8D6' }}>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A6E42' }}>Assigned Workers</p>
            <div className="space-y-2">
              {booking.assigned_workers.map(w => (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#FDF0E8', color: '#D44B0A' }}>
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0E0D0C' }}>{w.name}</p>
                    <p className="text-xs" style={{ color: '#6B6560' }}>{Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#D1E8D6', color: '#1A6E42' }}>
                    Dispatched
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Banner */}
        {booking.booking_status === 'in_progress' && (
          <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#FDF0E8', border: '1px solid #F5E0CC' }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold" style={{ background: '#FFFFFF', color: '#D44B0A' }}>
               Work in Progress
            </span>
          </div>
        )}

        {/* Waiting for OTP verification */}
        {booking.booking_status === 'dispatched' && (
          <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#EFF6FF', border: '1px solid #C7D9F5' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#1A4ED8' }}>⏳ Waiting for Customer</p>
            <p className="text-xs" style={{ color: '#6B6560' }}>Workers are at the location. Waiting for customer to verify OTP.</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Address</p>
            {booking.address ? (
              <p className="text-sm" style={{ color: '#0E0D0C' }}>
                {booking.address.address_line1}<br />
                {booking.address.city}, {booking.address.state} {booking.address.postal_code}
              </p>
            ) : (
              <p className="text-sm" style={{ color: '#A89E97' }}>—</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Scheduled</p>
            <p className="text-sm" style={{ color: '#0E0D0C' }}>{booking.scheduled_at ? formatDate(booking.scheduled_at) : 'Not scheduled'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Workers Needed</p>
            <p className="text-sm" style={{ color: '#0E0D0C' }}>{booking.workers_needed}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Job Description</p>
            <p className="text-sm" style={{ color: '#0E0D0C' }}>{booking.job_description || '—'}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#EDE9E4' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#A89E97' }}>Payment</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B6560' }}>Total Amount</p>
              <p className="text-lg font-black" style={{ color: '#0E0D0C' }}>{formatCurrency(booking.total_amount)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B6560' }}>Service Charge</p>
              <p className="text-lg font-black" style={{ color: '#A89E97' }}>{formatCurrency(booking.platform_fee)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B6560' }}>Your Payout</p>
              <p className="text-lg font-black" style={{ color: '#D44B0A' }}>{formatCurrency(booking.thekedar_payout)}</p>
            </div>
          </div>
        </div>

        {/* Completed Review */}
        {booking.booking_status === 'completed' && booking.review && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#EDE9E4' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#A89E97' }}>Customer Review</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: '#D44B0A' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= booking.review.rating ? '#D44B0A' : '#DDD8D2' }}>★</span>)}
              </span>
              <p className="text-sm" style={{ color: '#0E0D0C' }}>{booking.review.comment}</p>
            </div>
          </div>
        )}

        {/* Accept / Decline — pending */}
        {booking.booking_status === 'pending' && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1A6E42' }}
            >
              {accepting ? 'Accepting...' : 'Accept Booking'}
            </button>
            <button
              onClick={handleDecline}
              disabled={declining}
              className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: '#B93424', color: '#B93424' }}
            >
              {declining ? 'Declining...' : 'Decline'}
            </button>
          </div>
        )}

        {/* Dispatch Workers — accepted */}
        {booking.booking_status === 'accepted' && (
          <button
            onClick={() => setDispatchModal(true)}
            className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#D44B0A' }}
          >
            Dispatch Workers
          </button>
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModal && (
        <DispatchModal
          booking={booking}
          workers={workers}
          onClose={() => setDispatchModal(false)}
          onDispatch={handleDispatch}
        />
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(212,74,10,0.35); }
          70% { box-shadow: 0 0 0 8px rgba(212,74,10,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,74,10,0); }
        }
      `}</style>
    </div>
  );
}