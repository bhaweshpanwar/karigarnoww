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

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(res => {
        if (res.data.success) setBooking(res.data.data);
      })
      .catch(() => showToast('Failed to load booking', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await api.put(`/bookings/${id}/accept`);
      if (res.data.success) {
        setBooking(res.data.data);
        showToast('Booking accepted!', 'success');
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

  return (
    <div className="pb-20 md:pb-0">
      <button
        onClick={() => navigate('/thekedar/jobs')}
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
        style={{ color: '#6B6560' }}
      >
        Back to Jobs
      </button>

      <h1 className="text-3xl font-black mb-6" style={{ color: '#0E0D0C' }}>Job Details</h1>

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
        {booking.booking_status === 'accepted' && booking.otp && (
          <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#FDF0E8', border: '1px solid #F5E0CC' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6B6560' }}>
              Share with your worker
            </p>
            <div className="flex justify-center gap-3 mb-4">
              {booking.otp.split('').map((d, i) => (
                <div key={i} className="w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-black" style={{ background: '#D44B0A', color: '#FFFFFF' }}>
                  {d}
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#A89E97' }}>
              Worker enters this OTP at customer's location
            </p>
          </div>
        )}

        {/* Dispatched Workers */}
        {booking.booking_status === 'dispatched' && booking.assigned_workers && (
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
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FFFFFF', color: '#1A6E42' }}>
                Waiting for OTP verification
              </span>
            </div>
          </div>
        )}

        {/* In Progress */}
        {booking.booking_status === 'in_progress' && (
          <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#FDF0E8', border: '1px solid #F5E0CC' }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold" style={{ background: '#FFFFFF', color: '#D44B0A' }}>
              Work in Progress
            </span>
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
              <p className="text-xs mb-1" style={{ color: '#6B6560' }}>Platform Fee</p>
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
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#A89E97' }}>Consumer Review</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: '#D44B0A' }}>{booking.review.rating}</span>
              <p className="text-sm" style={{ color: '#0E0D0C' }}>{booking.review.comment}</p>
            </div>
          </div>
        )}

        {/* Accept / Decline */}
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
      </div>
    </div>
  );
}
