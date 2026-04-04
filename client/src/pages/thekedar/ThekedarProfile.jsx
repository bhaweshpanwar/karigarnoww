import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

export default function ThekedarProfile() {
  const { user: authUser } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [profile, setProfile] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');
  const [offeredServices, setOfferedServices] = useState([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [newServiceId, setNewServiceId] = useState('');
  const [newServiceRate, setNewServiceRate] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/thekedars/me').catch(() => ({ data: { success: false, data: null } })),
      api.get('/services'),
    ]).then(([pRes, sRes]) => {
      if (pRes.data.success && pRes.data.data) {
        const p = pRes.data.data;
        setProfile(p);
        setBio(p.bio || '');
        setExperience(p.experience || '');
        setLocation(p.location || '');
        setRatePerHour(p.rate_per_hour || '');
        setOfferedServices(p.services || []);
      }
      if (sRes.data.success) setAllServices(sRes.data.data);
    }).catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/thekedars/me', {
        bio,
        experience,
        location,
        rate_per_hour: Number(ratePerHour) || null,
      });
      if (res.data.success) {
        showToast('Profile updated!', 'success');
      }
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    if (!newServiceId) return;
    const svc = allServices.find(s => s.id === newServiceId);
    if (!svc) return;
    setOfferedServices(prev => [...prev, { ...svc, custom_rate: Number(newServiceRate) || 0 }]);
    setNewServiceId('');
    setNewServiceRate('');
    setAddServiceOpen(false);
  };

  const handleRemoveService = (id) => {
    setOfferedServices(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-20 md:pb-0">
        <div className="h-12 w-48 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
        <div className="h-64 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-3xl font-black mb-6" style={{ color: '#0E0D0C' }}>My Profile</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Rating', value: `${(profile?.rating_average || authUser?.rating_average || 0).toFixed(1)}` },
          { label: 'Total Jobs', value: profile?.total_jobs || 0 },
          { label: 'Team Size', value: profile?.team_size || 0 },
          { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B6560' }}>{stat.label}</p>
            <p className="text-xl font-black" style={{ color: '#0E0D0C' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        <h2 className="text-base font-bold mb-5" style={{ color: '#0E0D0C' }}>Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Name</label>
            <input
              type="text"
              value={profile?.name || authUser?.name || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-not-allowed"
              style={{ background: '#F5F1EC', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Email</label>
            <input
              type="email"
              value={profile?.email || authUser?.email || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-not-allowed"
              style={{ background: '#F5F1EC', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Mobile</label>
            <input
              type="tel"
              value={profile?.mobile || authUser?.mobile || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-not-allowed"
              style={{ background: '#F5F1EC', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Rate per Hour (Rs.)</label>
            <input
              type="number"
              value={ratePerHour}
              onChange={e => setRatePerHour(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell customers about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Experience</label>
            <input
              type="text"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="e.g. 8 years"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Location / City</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Indore, MP"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>
        </div>
      </div>

      {/* Services Offered */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#0E0D0C' }}>Services Offered</h2>
          <button
            onClick={() => setAddServiceOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
            style={{ background: '#FDF0E8', color: '#D44B0A' }}
          >
            + Add Service
          </button>
        </div>
        {offeredServices.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#A89E97' }}>No services added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {offeredServices.map(svc => (
              <div
                key={svc.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{ background: '#FDF0E8', borderColor: '#FAE0CC' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#0E0D0C' }}>{svc.name}</span>
                {svc.custom_rate && (
                  <span className="text-xs font-bold" style={{ color: '#D44B0A' }}>{formatCurrency(svc.custom_rate)}/hr</span>
                )}
                <button
                  onClick={() => handleRemoveService(svc.id)}
                  className="ml-1 text-xs hover:opacity-70"
                  style={{ color: '#A89E97' }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: '#D44B0A' }}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>

      {/* Add Service Modal */}
      {addServiceOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(14,13,12,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #DDD8D2' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#0E0D0C' }}>Add Service</h3>
              <button onClick={() => setAddServiceOpen(false)} style={{ color: '#6B6560' }}>X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Service</label>
                <select
                  value={newServiceId}
                  onChange={e => setNewServiceId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
                >
                  <option value="">Select a service...</option>
                  {allServices.filter(s => !offeredServices.find(o => o.id === s.id)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Custom Rate (Rs./hr)</label>
                <input
                  type="number"
                  value={newServiceRate}
                  onChange={e => setNewServiceRate(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
                />
              </div>
              <button
                onClick={handleAddService}
                disabled={!newServiceId}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#D44B0A' }}
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
