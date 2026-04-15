import { useState, useEffect, useRef } from 'react';
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
    <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#FDFCFA', border: '2px solid #0E0D0C' }}>
      <p className="text-sm font-bold mb-4" style={{ color: '#0E0D0C' }}>🔐 Share this OTP with worker</p>
      <div className="flex justify-center gap-3 mb-4">
        {otp.split('').map((d, i) => (
          <div key={i}
            className="w-14 h-16 rounded-lg flex items-center justify-center text-3xl font-black"
            style={{ background: '#FDFCFA', border: '2px solid #0E0D0C', color: '#D44B0A', fontFamily: 'Fraunces, serif' }}>
            {d}
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: '#A89E97' }}>Show this code when worker knocks</p>
    </div>
  );
}

// ── OTP Input Form ────────────────────────────────────────────
function OtpInputForm({ bookingId, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const allFilled = digits.every(d => d !== '');

  const handleChange = (idx, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError('');
    if (clean && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }
    if (next.every(d => d !== '')) {
      inputRefs[3].current?.blur();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx] === '' && idx > 0) {
        inputRefs[idx - 1].current?.focus();
      } else {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4).split('');
    if (pasted.length > 0) {
      const next = [...digits];
      pasted.forEach((c, i) => { if (i < 4) next[i] = c; });
      setDigits(next);
      const lastIdx = Math.min(pasted.length, 3);
      inputRefs[lastIdx].current?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!allFilled) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/bookings/${bookingId}/verify-otp`, { otp: digits.join('') });
      if (res.data.success) {
        onVerified();
      }
    } catch (err) {
      setError('Incorrect OTP. Please check again.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-5 mb-6" style={{ background: '#FDFCFA', border: '2px solid #DDD8D2' }}>
      <p className="text-sm font-bold mb-1" style={{ color: '#0E0D0C' }}> Worker has arrived?</p>
      <p className="text-xs mb-4" style={{ color: '#6B6560' }}>Enter the OTP worker confirmed:</p>
      <div className="flex justify-center gap-3 mb-4">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-14 h-16 rounded-lg text-center text-2xl font-bold"
            style={{
              background: '#FDFCFA',
              border: `2px solid ${error ? '#B93424' : '#DDD8D2'}`,
              color: '#0E0D0C',
              outline: 'none',
              fontFamily: 'Fraunces, serif',
              animation: shake ? 'shake 0.4s ease' : 'none',
            }}
          />
        ))}
      </div>
      {error && <p className="text-center text-xs mb-3" style={{ color: '#B93424' }}>{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!allFilled || loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: '#D44B0A' }}
      >
        {loading ? 'Verifying...' : 'Confirm Arrival & Start Job'}
      </button>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <span className={star <= (hover || value) ? 'text-[#D44B0A]' : 'text-[#DDD8D2]'}>★</span>
        </button>
      ))}
    </div>
  );
}

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
    setTimeout(() => setToast(''), 3500);
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

  const handleVerified = () => {
    showToast('Work started! OTP verified successfully.');
    fetchBooking();
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${id}/complete`);
      if (res.data.success) {
        setConfirmComplete(false);
        showToast('Payment released! Job completed.');
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
        showToast('Booking cancelled. Refund will be processed.');
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
      await api.post('/reviews', {
        booking_id: id,
        thekedar_id: booking.thekedar_id || booking.thekedar?.id,
        rating,
        comment: reviewComment,
      });
      showToast('Thank you for your feedback!');
      fetchBooking();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#FDFCFA' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-white border-2 border-[#D44B0A] text-[#0E0D0C] text-sm shadow-lg animate-[fadeDown_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: '#6B6560' }}>
          <Link to="/bookings" className="hover:text-[#D44B0A] transition-colors">My Bookings</Link>
          <span>/</span>
          <span style={{ color: '#0E0D0C' }}>{booking?.service?.name || '...'}</span>
        </nav>

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-48 rounded-xl" style={{ background: '#FFFFFF' }} />
            <div className="h-32 rounded-xl" style={{ background: '#FFFFFF' }} />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-sm mb-3" style={{ color: '#B93424' }}>{error}</p>
            <button onClick={fetchBooking} className="text-sm font-semibold hover:underline" style={{ color: '#D44B0A' }}>Try Again</button>
          </div>
        )}

        {booking && !loading && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: '#0E0D0C', fontFamily: 'Fraunces, serif' }}>
                  {booking.service?.name}
                </h1>
                <p className="text-sm" style={{ color: '#6B6560' }}>with {booking.thekedar_name}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.booking_status] || ''}`}>
                {booking.booking_status?.replace('_', ' ')}
              </span>
            </div>

            {/* Timeline */}
            <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
              <h2 className="text-sm font-bold mb-5" style={{ color: '#0E0D0C' }}>Booking Timeline</h2>
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

            {/* Details */}
            <div className="rounded-xl p-6 mb-6 space-y-4" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Scheduled</p>
                  <p className="font-medium" style={{ color: '#0E0D0C' }}>{formatDate(booking.scheduled_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Workers Needed</p>
                  <p className="font-medium" style={{ color: '#0E0D0C' }}>{booking.workers_needed}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Total Amount</p>
                  <p className="font-bold" style={{ color: '#D44B0A' }}>{formatCurrency(booking.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Payment</p>
                  <p className="font-medium capitalize" style={{ color: '#0E0D0C' }}>{booking.payment_status?.replace('_', ' ')}</p>
                </div>
              </div>

              {booking.address && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Address</p>
                  <p className="text-sm" style={{ color: '#0E0D0C' }}>
                    {booking.address.address_line1}, {booking.address.city}, {booking.address.state} {booking.address.postal_code}
                  </p>
                </div>
              )}

              {booking.job_description && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A89E97' }}>Job Description</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#0E0D0C' }}>{booking.job_description}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-1.5 text-sm" style={{ borderColor: '#EDE9E4' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#6B6560' }}>Total Amount</span>
                  <span style={{ color: '#0E0D0C' }}>{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B6560' }}>Service Charge</span>
                  <span style={{ color: '#0E0D0C' }}>{formatCurrency(booking.platform_fee)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1.5" style={{ borderColor: '#EDE9E4' }}>
                  <span style={{ color: '#0E0D0C' }}>Thekedar Receives</span>
                  <span style={{ color: '#D44B0A' }}>{formatCurrency(booking.thekedar_payout)}</span>
                </div>
              </div>
            </div>

            {/* OTP Display — dispatched only (consumer can only verify after workers dispatched) */}
            {booking.booking_status === 'dispatched' && booking.otp && (
              <OtpDisplayBox otp={booking.otp} />
            )}

            {/* Waiting note — shown at accepted before workers dispatched */}
            {booking.booking_status === 'accepted' && booking.otp && (
              <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#EFF6FF', border: '1.5px solid #BFDCFF' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#1A4ED8' }}>OTP Generated — Waiting for Dispatch</p>
                <p className="text-xs" style={{ color: '#6B6560' }}>Thekedar will dispatch workers soon. You'll be able to verify OTP once workers are on the way.</p>
                <div className="flex justify-center gap-2 mt-4">
                  {booking.otp.split('').map((d, i) => (
                    <div key={i}
                      className="w-12 h-14 rounded-lg flex items-center justify-center text-2xl font-black"
                      style={{ background: '#FFFFFF', border: '2px solid #BFDCFF', color: '#1A4ED8', fontFamily: 'Fraunces, serif' }}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTP Input — dispatched */}
            {booking.booking_status === 'dispatched' && (
              <OtpInputForm bookingId={id} onVerified={handleVerified} />
            )}

            {/* In Progress Banner */}
            {booking.booking_status === 'in_progress' && (
              <div className="rounded-xl p-5 mb-6 text-center" style={{ background: '#E8F5EE', border: '1px solid #D1E8D6' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#1A6E42' }}> Work is currently ongoing</p>
                <p className="text-xs" style={{ color: '#6B6560' }}>OTP was verified — workers are on site</p>
              </div>
            )}

            {/* Workers Assigned */}
            {booking.assigned_workers?.length > 0 && (
              <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: '#0E0D0C' }}>Assigned Workers</h2>
                <div className="space-y-3">
                  {booking.assigned_workers.map(w => (
                    <div key={w.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#FDF0E8', color: '#D44B0A' }}>
                        {w.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0E0D0C' }}>{w.name}</p>
                        <p className="text-xs" style={{ color: '#6B6560' }}>
                          {Array.isArray(w.skills) ? w.skills.join(', ') : w.skills}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Complete — in_progress */}
              {booking.booking_status === 'in_progress' && (
                <>
                  {confirmComplete ? (
                    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
                      <h3 className="text-base font-bold mb-2" style={{ color: '#0E0D0C' }}>Job Complete?</h3>
                      <p className="text-sm mb-4" style={{ color: '#6B6560' }}>
                        Confirming this will release {formatCurrency(booking.thekedar_payout)} to {booking.thekedar_name}. This cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmComplete(false)}
                          className="flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all hover:opacity-80"
                          style={{ borderColor: '#DDD8D2', color: '#6B6560' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleComplete}
                          disabled={submitting}
                          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#D44B0A' }}
                        >
                          {submitting ? 'Processing...' : 'Yes, Release Payment'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmComplete(true)}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: '#0E0D0C' }}
                    >
                      Mark Job as Complete
                    </button>
                  )}
                </>
              )}

              {/* Cancel — pending or accepted */}
              {(booking.booking_status === 'pending' || booking.booking_status === 'accepted') && (
                <>
                  {confirmCancel ? (
                    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #B93424' }}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: '#B93424' }}>Cancel Booking?</h3>
                      <p className="text-sm mb-4" style={{ color: '#6B6560' }}>Are you sure you want to cancel? Refund will be processed.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmCancel(false)}
                          className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:opacity-80"
                          style={{ borderColor: '#DDD8D2', color: '#6B6560' }}
                        >
                          No, Keep It
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={submitting}
                          className="flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all hover:bg-[#FDECEA] disabled:opacity-50"
                          style={{ borderColor: '#B93424', color: '#B93424' }}
                        >
                          {submitting ? 'Cancelling...' : 'Yes, Cancel Booking'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      className="py-2.5 rounded-xl border-2 text-sm font-medium transition-all hover:bg-[#FDECEA]"
                      style={{ borderColor: '#B93424', color: '#B93424' }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </>
              )}

              {/* Review — completed without review */}
              {booking.booking_status === 'completed' && !booking.has_review && (
                <div className="rounded-xl p-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
                  <h2 className="text-sm font-bold mb-1" style={{ color: '#0E0D0C' }}>⭐ Rate your experience</h2>
                  <p className="text-xs mb-4" style={{ color: '#6B6560' }}>
                    How was your experience with {booking.thekedar_name}?
                  </p>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <StarRating value={rating} onChange={setRating} />
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Share your experience (optional)"
                      className="w-full px-4 py-3 rounded-lg text-sm resize-none transition-colors outline-none"
                      style={{ background: '#F5F1EC', border: '2px solid #DDD8D2', color: '#0E0D0C' }}
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#D44B0A' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Review Submitted */}
              {booking.booking_status === 'completed' && booking.has_review && booking.review && (
                <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: '#0E0D0C' }}>Your Review</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className="text-lg" style={{ color: s <= booking.review.rating ? '#D44B0A' : '#DDD8D2' }}>★</span>
                    ))}
                  </div>
                  {booking.review.comment && (
                    <p className="text-sm" style={{ color: '#6B6560' }}>{booking.review.comment}</p>
                  )}
                </div>
              )}

              {booking.booking_status === 'completed' && booking.has_review && !booking.review && (
                <div className="rounded-xl p-5 text-center" style={{ background: '#E8F5EE', border: '1px solid #D1E8D6' }}>
                  <p className="text-sm font-medium" style={{ color: '#1A6E42' }}>✓ Thank you for your feedback!</p>
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
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(212,74,10,0.35); }
          70% { box-shadow: 0 0 0 8px rgba(212,74,10,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,74,10,0); }
        }
      `}</style>
    </div>
  );
}