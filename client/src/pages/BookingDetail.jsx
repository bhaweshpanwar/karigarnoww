import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STEPS = ['pending', 'accepted', 'dispatched', 'in_progress', 'completed'];

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
  in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const STEP_LABELS = {
  pending: 'Booking Created',
  accepted: 'Accepted',
  dispatched: 'Workers Dispatched',
  in_progress: 'Work In Progress',
  completed: 'Completed',
};

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchBooking = () => {
    setLoading(true);
    setError('');
    api.get(`/bookings/${id}`)
      .then(res => { if (res.data.success) setBooking(res.data.data); })
      .catch(() => setError('Failed to load booking details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const currentStepIdx = STATUS_STEPS.indexOf(booking?.booking_status);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${id}/complete`);
      if (res.data.success) {
        setConfirmComplete(false);
        showToast('Payment released. Job completed!');
        fetchBooking();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      if (res.data.success) {
        setConfirmCancel(false);
        showToast('Booking cancelled.');
        fetchBooking();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (rating === 0) { showToast('Please select a rating.'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { booking_id: id, rating, comment: reviewComment });
      showToast('Thanks for your feedback!');
      fetchBooking();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-20 pb-16 px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-white border-2 border-[#D44B0A] text-[#0E0D0C] text-sm shadow-lg animate-[fadeDown_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6B6560]">
          <Link to="/bookings" className="hover:text-[#D44B0A]">My Bookings</Link>
          <span>/</span>
          <span className="text-[#0E0D0C]">{booking?.service?.name || '...'}</span>
        </nav>

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-white rounded-xl border border-[#DDD8D2]" />
            <div className="h-32 bg-white rounded-xl border border-[#DDD8D2]" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-[#B93424] text-sm mb-3">{error}</p>
            <button onClick={fetchBooking} className="text-[#D44B0A] text-sm font-semibold hover:underline">Try Again</button>
          </div>
        )}

        {booking && !loading && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-['Fraunces',serif] text-2xl md:text-3xl font-black text-[#0E0D0C] tracking-[-1px] mb-1">
                  {booking.service?.name}
                </h1>
                <p className="text-[#6B6560] text-sm">with {booking.thekedar_name}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.booking_status] || ''}`}>
                {booking.booking_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            {/* Timeline */}
            <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6">
              <h2 className="text-sm font-bold text-[#0E0D0C] mb-5">Booking Timeline</h2>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          done
                            ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                            : 'bg-white border-[#DDD8D2] text-[#DDD8D2]'
                        }`}>
                          {done ? '✓' : idx + 1}
                        </div>
                        <p className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${done ? 'text-[#0E0D0C]' : 'text-[#DDD8D2]'}`}>
                          {STEP_LABELS[step]}
                        </p>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1 ${idx < currentStepIdx ? 'bg-[#FF6B00]' : 'bg-[#DDD8D2]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Scheduled</p>
                  <p className="text-[#0E0D0C] font-medium">{formatDate(booking.scheduled_at)}</p>
                </div>
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Workers Needed</p>
                  <p className="text-[#0E0D0C] font-medium">{booking.workers_needed}</p>
                </div>
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Total Amount</p>
                  <p className="text-[#D44B0A] font-bold">{formatCurrency(booking.total_amount)}</p>
                </div>
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Payment</p>
                  <p className="text-[#0E0D0C] font-medium capitalize">{booking.payment_status?.replace('_', ' ')}</p>
                </div>
              </div>

              {booking.address && (
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Address</p>
                  <p className="text-[#0E0D0C] text-sm">{booking.address.address_line1}, {booking.address.city}, {booking.address.state} {booking.address.postal_code}</p>
                </div>
              )}

              {booking.job_description && (
                <div>
                  <p className="text-[#6B6560] text-xs mb-1">Job Description</p>
                  <p className="text-[#0E0D0C] text-sm leading-relaxed">{booking.job_description}</p>
                </div>
              )}

              <div className="border-t border-[#EDE9E4] pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6560]">Total Amount</span>
                  <span className="text-[#0E0D0C]">{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6560]">Platform Fee</span>
                  <span className="text-[#0E0D0C]">{formatCurrency(booking.platform_fee)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#EDE9E4] pt-1.5">
                  <span className="text-[#0E0D0C]">Thekedar Receives</span>
                  <span className="text-[#D44B0A]">{formatCurrency(booking.thekedar_payout)}</span>
                </div>
              </div>
            </div>

            {/* OTP Section */}
            {booking.booking_status === 'dispatched' && booking.otp && (
              <div className="p-6 rounded-xl border-2 border-[#D44B0A] bg-white mb-6 text-center">
                <p className="text-2xl mb-1">🔐</p>
                <p className="text-sm font-bold text-[#0E0D0C] mb-1">Share this OTP with the worker</p>
                <p className="text-xs text-[#6B6560] mb-4">Worker enters this on arrival to start the job</p>
                <div className="flex justify-center gap-3">
                  {booking.otp.split('').map((digit, i) => (
                    <span key={i} className="w-12 h-14 rounded-xl bg-[#FF6B00] text-white text-2xl font-black flex items-center justify-center">
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Workers assigned */}
            {booking.assigned_workers?.length > 0 && (
              <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6">
                <h2 className="text-sm font-bold text-[#0E0D0C] mb-3">Assigned Workers</h2>
                <div className="space-y-3">
                  {booking.assigned_workers.map(w => (
                    <div key={w.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-xs">
                        {w.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="text-[#0E0D0C] text-sm font-medium">{w.name}</p>
                        <p className="text-[#6B6560] text-xs">{w.mobile} • {w.skills}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Complete */}
              {booking.booking_status === 'in_progress' && (
                <>
                  {confirmComplete ? (
                    <div className="p-5 rounded-xl border-2 border-[#D44B0A] bg-white">
                      <p className="text-[#0E0D0C] text-sm font-medium mb-3">Are you sure the work is done? This will release payment to the thekedar.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setConfirmComplete(false)}
                          className="flex-1 py-2.5 rounded-lg border-2 border-[#DDD8D2] text-[#6B6560] text-sm font-medium hover:border-[#D44B0A] transition-colors">
                          Cancel
                        </button>
                        <button onClick={handleComplete} disabled={submitting}
                          className="flex-1 py-2.5 rounded-lg bg-[#FF6B00] text-white text-sm font-bold hover:bg-[#D44B0A] transition-colors disabled:opacity-50">
                          {submitting ? 'Processing...' : 'Confirm & Release Payment'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmComplete(true)}
                      className="w-full py-3.5 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#D44B0A] transition-colors">
                      Mark Job as Complete
                    </button>
                  )}
                </>
              )}

              {/* Cancel */}
              {(booking.booking_status === 'pending' || booking.booking_status === 'accepted') && (
                <>
                  {confirmCancel ? (
                    <div className="p-5 rounded-xl border-2 border-[#B93424] bg-white">
                      <p className="text-[#0E0D0C] text-sm font-medium mb-3">Are you sure you want to cancel this booking?</p>
                      <div className="flex gap-3">
                        <button onClick={() => setConfirmCancel(false)}
                          className="flex-1 py-2.5 rounded-lg border-2 border-[#DDD8D2] text-[#6B6560] text-sm font-medium hover:border-[#D44B0A] transition-colors">
                          No, Keep It
                        </button>
                        <button onClick={handleCancel} disabled={submitting}
                          className="flex-1 py-2.5 rounded-lg border-2 border-[#B93424] text-[#B93424] text-sm font-bold hover:bg-[#FDECEA] transition-colors disabled:opacity-50">
                          {submitting ? 'Cancelling...' : 'Yes, Cancel Booking'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmCancel(true)}
                      className="w-full py-2.5 rounded-xl border-2 border-[#B93424] text-[#B93424] text-sm font-medium hover:bg-[#FDECEA] transition-colors">
                      Cancel Booking
                    </button>
                  )}
                </>
              )}

              {/* Review */}
              {booking.booking_status === 'completed' && !booking.has_review && (
                <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white">
                  <h2 className="text-sm font-bold text-[#0E0D0C] mb-1">Rate Your Experience</h2>
                  <p className="text-[#6B6560] text-xs mb-4">How was your experience with {booking.thekedar_name}?</p>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)}
                          className="text-3xl transition-transform hover:scale-110">
                          <span className={star <= rating ? 'text-[#FF6B00]' : 'text-[#DDD8D2]'}>★</span>
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3}
                      placeholder="Share your experience (optional)"
                      className="w-full px-4 py-3 rounded-lg bg-[#F5F1EC] border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm placeholder-[#A89E97] outline-none focus:border-[#D44B0A] transition-colors resize-none" />
                    <button type="submit" disabled={submittingReview}
                      className="w-full py-3 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#D44B0A] transition-colors disabled:opacity-50">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {booking.booking_status === 'completed' && booking.has_review && (
                <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white text-center">
                  <p className="text-[#1A6E42] text-sm font-medium">✓ Thanks for your feedback!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
