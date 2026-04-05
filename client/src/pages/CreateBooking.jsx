import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

const PLATFORM_FEE_RATE = 0.11;

export default function CreateBooking() {
  const { thekedarId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thekedar, setThekedar] = useState(null);
  const [loadingThekedar, setLoadingThekedar] = useState(true);
  const [thekedarError, setThekedarError] = useState('');

  const [form, setForm] = useState({
    service_id: '',
    workers_needed: 1,
    scheduled_date: '',
    scheduled_time: '',
    job_description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadingThekedar(true);
    api.get(`/thekedars/${thekedarId}`)
      .then(res => { if (res.data.success) setThekedar(res.data.data); })
      .catch(() => setThekedarError('Could not load thekedar info.'))
      .finally(() => setLoadingThekedar(false));
  }, [thekedarId]);

  const teamSize = thekedar?.team_size || thekedar?.workers?.length || 10;

  const selectedService = thekedar?.services?.find(s => s.id === form.service_id);
  const rate = selectedService?.custom_rate || thekedar?.services?.[0]?.custom_rate || 0;
  const estimatedHours = 2;
  const subtotal = rate * form.workers_needed * estimatedHours;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + platformFee;

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
    setError('');
  };

  const validate = () => {
    if (!form.service_id) return 'Please select a service';
    if (!form.workers_needed || form.workers_needed < 1) return 'Select at least 1 worker';
    if (!form.scheduled_date) return 'Please select a date';
    if (!form.scheduled_time) return 'Please select a time';
    if (!form.job_description || form.job_description.trim().length < 20) return 'Job description must be at least 20 characters';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError('');
    try {
      const scheduledAt = `${form.scheduled_date}T${form.scheduled_time}:00`;
      const payload = {
        thekedarId: thekedarId,
        serviceId: form.service_id,
        workersNeeded: form.workers_needed,
        jobDescription: form.job_description,
        scheduledAt: scheduledAt,
        addressId: '00000000-0000-0000-0000-000000000000',
      };
      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        navigate(`/bookings/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (loadingThekedar) {
    return (
      <div className="min-h-screen bg-[#FDFCFA] pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (thekedarError) {
    return (
      <div className="min-h-screen bg-[#FDFCFA] pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#B93424] mb-3">{thekedarError}</p>
          <button onClick={() => window.location.reload()} className="text-[#D44B0A] text-sm font-semibold hover:underline">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <nav className="mb-4 flex items-center gap-2 text-sm text-[#6B6560]">
            <Link to="/" className="hover:text-[#D44B0A]">Home</Link>
            <span>/</span>
            <Link to={`/thekedars/${thekedarId}`} className="hover:text-[#D44B0A]">{thekedar?.name}</Link>
            <span>/</span>
            <span className="text-[#0E0D0C]">Book</span>
          </nav>
          <h1 className="font-['Fraunces',serif] text-3xl font-black text-[#0E0D0C] tracking-[-1px]">Book Service</h1>
        </div>

        {/* Thekedar summary */}
        {thekedar && (
          <div className="p-4 rounded-xl border-2 border-[#DDD8D2] bg-white mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-lg">
              {thekedar.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[#0E0D0C] font-semibold">{thekedar.name}</p>
              <p className="text-[#6B6560] text-xs">{thekedar.location} • {thekedar.rating_average?.toFixed(1)}★</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service selector */}
          <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Service *</label>
            <select name="service_id" value={form.service_id} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C] transition-colors">
              <option value="">Select a service</option>
              {thekedar?.services?.map(svc => (
                <option key={svc.id} value={svc.id}>{svc.name} — ₹{svc.custom_rate}/hr</option>
              ))}
            </select>
          </div>

          {/* Workers */}
          <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Number of Workers *</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => handleChange({ target: { name: 'workers_needed', value: Math.max(1, form.workers_needed - 1), type: 'number' } })}
                className="w-10 h-10 rounded-lg bg-[#F5F1EC] border-2 border-[#DDD8D2] text-[#0E0D0C] text-lg font-bold hover:border-[#D44B0A] transition-colors">−</button>
              <span className="text-[#0E0D0C] font-bold text-xl w-8 text-center">{form.workers_needed}</span>
              <button type="button" onClick={() => handleChange({ target: { name: 'workers_needed', value: Math.min(teamSize, form.workers_needed + 1), type: 'number' } })}
                className="w-10 h-10 rounded-lg bg-[#F5F1EC] border-2 border-[#DDD8D2] text-[#0E0D0C] text-lg font-bold hover:border-[#D44B0A] transition-colors">+</button>
              <span className="text-[#6B6560] text-sm ml-2">Max: {teamSize}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Date *</label>
              <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} min={minDate} required
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C] transition-colors" />
            </div>
            <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Time *</label>
              <select name="scheduled_time" value={form.scheduled_time} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C] transition-colors">
                <option value="">Select time</option>
                {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Job description */}
          <div className="p-5 rounded-xl border-2 border-[#DDD8D2] bg-white">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-2">Job Description * (min 20 chars)</label>
            <textarea name="job_description" value={form.job_description} onChange={handleChange} required minLength={20} rows={4}
              placeholder="Describe the work needed in detail..."
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm placeholder-[#A89E97] outline-none focus:border-[#0E0D0C] transition-colors resize-none" />
          </div>

          {/* Price estimate */}
          {selectedService && (
            <div className="p-5 rounded-xl border-2 border-[#D44B0A] bg-white">
              <h3 className="text-sm font-bold text-[#0E0D0C] mb-3">Price Estimate</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6560]">₹{rate}/hr × {form.workers_needed} worker{form.workers_needed > 1 ? 's' : ''}</span>
                  <span className="text-[#0E0D0C]">{formatCurrency(rate * form.workers_needed)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6560]">Minimum hours</span>
                  <span className="text-[#0E0D0C]">{estimatedHours} hrs</span>
                </div>
                <div className="flex justify-between border-t border-[#EDE9E4] pt-1.5 mt-1.5">
                  <span className="text-[#6B6560]">Subtotal</span>
                  <span className="text-[#0E0D0C]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6560]">Platform fee (11%)</span>
                  <span className="text-[#0E0D0C]">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between border-t border-[#EDE9E4] pt-1.5 font-bold">
                  <span className="text-[#0E0D0C]">Total</span>
                  <span className="text-[#D44B0A]">{formatCurrency(total)}</span>
                </div>
                <p className="text-[#A89E97] text-xs mt-2">* Final amount may vary based on actual hours</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-[#FDECEA] border-2 border-[#B93424] text-[#B93424] text-sm">{error}</div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#D44B0A] transition-colors disabled:opacity-50">
            {submitting ? 'Confirming Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
