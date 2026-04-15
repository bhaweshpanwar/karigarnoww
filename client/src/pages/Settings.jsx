import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', mobile: '', photo: '' });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    is_primary: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        photo: user.photo || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    setAddressLoading(true);
    api.get('/addresses')
      .then(res => {
        if (res.data.success) setAddresses(res.data.data);
      })
      .catch(() => showToast('Failed to load addresses', 'error'))
      .finally(() => setAddressLoading(false));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put('/users/me', profile);
      if (res.data.success) {
        login(res.data.data);
        showToast('Profile updated successfully', 'success');
        setProfileEditing(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Both fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    try {
      const res = await api.put('/users/me/password', passwordForm);
      if (res.data.success) {
        showToast('Password changed successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '' });
        setPasswordVisible(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      is_primary: false,
    });
    setEditingAddressId(null);
    setAddressFormVisible(false);
  };

  const handleAddressEdit = (address) => {
    setAddressForm({
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'India',
      postal_code: address.postal_code || '',
      is_primary: address.is_primary || false,
    });
    setEditingAddressId(address.id);
    setAddressFormVisible(true);
  };

  const handleAddressSave = async () => {
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setAddressSaving(true);
    try {
      if (editingAddressId) {
        const res = await api.put(`/addresses/${editingAddressId}`, addressForm);
        if (res.data.success) {
          setAddresses(prev => prev.map(a => a.id === editingAddressId ? res.data.data : a));
          showToast('Address updated', 'success');
        }
      } else {
        const res = await api.post('/addresses', addressForm);
        if (res.data.success) {
          setAddresses(prev => [...prev, res.data.data]);
          showToast('Address added', 'success');
        }
      }
      resetAddressForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetPrimary = async (id) => {
    const addr = addresses.find(a => a.id === id);
    if (!addr) return;
    try {
      await api.put(`/addresses/${id}`, { ...addr, is_primary: true });
      setAddresses(prev => prev.map(a => ({ ...a, is_primary: a.id === id })));
      showToast('Primary address updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update primary', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="font-['Fraunces',serif] text-3xl font-black text-[#0E0D0C] tracking-[-1px]">Settings</h1>
          <p className="text-[#6B6560] text-sm mt-1">Manage your profile and addresses</p>
        </div>

        {/* Profile Section */}
        <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#0E0D0C]">Profile</h2>
            {!profileEditing && (
              <button
                onClick={() => setProfileEditing(true)}
                className="text-sm text-[#D44B0A] font-semibold hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {profileEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Mobile</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={e => setProfile(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#FF6B00] text-white text-sm font-bold hover:bg-[#D44B0A] transition-colors disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setProfileEditing(false); setProfile({ name: user.name, email: user.email, mobile: user.mobile, photo: user.photo }); }}
                  className="px-5 py-2.5 rounded-lg bg-[#F5F1EC] text-[#0E0D0C] text-sm font-semibold hover:border-[#DDD8D2] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6B6560]">Name</span><span className="text-[#0E0D0C] font-medium">{user?.name}</span></div>
              <div className="flex justify-between"><span className="text-[#6B6560]">Email</span><span className="text-[#0E0D0C] font-medium">{user?.email}</span></div>
              <div className="flex justify-between"><span className="text-[#6B6560]">Mobile</span><span className="text-[#0E0D0C] font-medium">{user?.mobile || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#6B6560]">Role</span><span className="text-[#0E0D0C] font-medium capitalize">{user?.role}</span></div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#0E0D0C]">Change Password</h2>
            <button
              onClick={() => { setPasswordVisible(v => !v); setPasswordError(''); }}
              className="text-sm text-[#D44B0A] font-semibold hover:underline"
            >
              {passwordVisible ? 'Cancel' : 'Change'}
            </button>
          </div>

          {passwordVisible && (
            <div className="space-y-4">
              {passwordError && (
                <div className="px-4 py-3 rounded-lg bg-[#FDECEA] border border-[#B93424] text-[#B93424] text-sm">{passwordError}</div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={passwordSaving}
                className="px-5 py-2.5 rounded-lg bg-[#FF6B00] text-white text-sm font-bold hover:bg-[#D44B0A] transition-colors disabled:opacity-50"
              >
                {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div className="p-6 rounded-xl border-2 border-[#DDD8D2] bg-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-[#0E0D0C]">My Addresses</h2>
            {!addressFormVisible && (
              <button
                onClick={() => { setAddressFormVisible(true); setEditingAddressId(null); resetAddressForm(); }}
                className="text-sm text-[#D44B0A] font-semibold hover:underline"
              >
                + Add Address
              </button>
            )}
          </div>

          {addressLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 && !addressFormVisible ? (
            <div className="py-6 text-center text-sm text-[#6B6560]">
              No addresses saved yet.{' '}
              <button onClick={() => setAddressFormVisible(true)} className="text-[#D44B0A] font-semibold hover:underline">
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-lg border-2 border-[#DDD8D2] bg-[#FDFCFA]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-sm text-[#0E0D0C]">
                      <p className="font-medium">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                      <p className="text-[#6B6560]">{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p className="text-[#6B6560]">{addr.country}</p>
                      {addr.is_primary && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6B00] text-white uppercase tracking-wider">Primary</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex gap-2">
                        {!addr.is_primary && (
                          <button onClick={() => handleSetPrimary(addr.id)} className="text-xs text-[#D44B0A] hover:underline font-semibold">Set Primary</button>
                        )}
                        <button onClick={() => handleAddressEdit(addr)} className="text-xs text-[#6B6560] hover:text-[#0E0D0C] transition-colors">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-[#B93424] hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {addressFormVisible && (
                <div className="p-5 rounded-xl border-2 border-[#D44B0A] bg-[#FFFAF7] space-y-4">
                  <h3 className="text-sm font-bold text-[#0E0D0C]">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Address Line 1 *</label>
                    <input type="text" value={addressForm.address_line1} onChange={e => setAddressForm(f => ({ ...f, address_line1: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" placeholder="House/Flat No., Street" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Address Line 2</label>
                    <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm(f => ({ ...f, address_line2: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" placeholder="Landmark, Area" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">City *</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">State *</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Country</label>
                      <input type="text" value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A89E97] mb-1.5">Postal Code *</label>
                      <input type="text" value={addressForm.postal_code} onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] text-sm outline-none focus:border-[#0E0D0C]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_primary" checked={addressForm.is_primary} onChange={e => setAddressForm(f => ({ ...f, is_primary: e.target.checked }))}
                      className="w-4 h-4 accent-[#FF6B00]" />
                    <label htmlFor="is_primary" className="text-sm text-[#0E0D0C]">Set as primary address</label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddressSave} disabled={addressSaving}
                      className="px-5 py-2.5 rounded-lg bg-[#FF6B00] text-white text-sm font-bold hover:bg-[#D44B0A] transition-colors disabled:opacity-50">
                      {addressSaving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button onClick={resetAddressForm}
                      className="px-5 py-2.5 rounded-lg bg-[#F5F1EC] text-[#0E0D0C] text-sm font-semibold hover:border-[#DDD8D2] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}