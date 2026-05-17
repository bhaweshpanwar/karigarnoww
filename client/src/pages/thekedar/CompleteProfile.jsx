import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import ToastContext from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

export default function CompleteProfile() {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    location: '',
    rate_per_hour: '',
  });
  const [selectedServices, setSelectedServices] = useState([]); // { service_id, custom_rate }

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load services', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.service_id === service.id);
      if (exists) {
        return prev.filter(s => s.service_id !== service.id);
      } else {
        return [...prev, { service_id: service.id, name: service.name, custom_rate: formData.rate_per_hour || '' }];
      }
    });
  };

  const handleServiceRateChange = (serviceId, rate) => {
    setSelectedServices(prev => 
      prev.map(s => s.service_id === serviceId ? { ...s, custom_rate: rate } : s)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bio || !formData.location || !formData.rate_per_hour) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Please select at least one service', 'error');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Update profile
      await api.put('/thekedars/me', {
        bio: formData.bio,
        experience: formData.experience,
        location: formData.location,
        rate_per_hour: parseFloat(formData.rate_per_hour)
      });

      // Step 2: Add services
      for (const s of selectedServices) {
        await api.post('/thekedar-services', {
          service_id: s.service_id,
          custom_rate: parseFloat(s.custom_rate || formData.rate_per_hour)
        });
      }

      showToast('Profile completed! Welcome to KarigarNow.', 'success');
      navigate('/thekedar/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EC] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0E0D0C] mb-2">Complete Your Profile</h1>
          <p className="text-[#6B6560]">Tell customers about yourself before you start accepting jobs.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 text-[#0E0D0C]">About You</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4A443F] mb-1">Bio / About You</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your experience and the type of work you do best"
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDD8D2] focus:border-[#D44B0A] focus:outline-none min-h-[120px] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 8 years"
                />
                <Input
                  label="Your City / Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Indore, Madhya Pradesh"
                  required
                />
              </div>

              <div className="w-full md:w-1/2">
                <Input
                  label="Base Rate ₹ per hour"
                  name="rate_per_hour"
                  type="number"
                  value={formData.rate_per_hour}
                  onChange={handleInputChange}
                  placeholder="e.g. 200"
                  required
                />
                <p className="text-[10px] text-[#6B6560] mt-1">Base rate per worker per hour</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2 text-[#0E0D0C]">Services You Offer</h2>
            <p className="text-sm text-[#6B6560] mb-6">Select the services you and your team can provide.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(service => {
                const isSelected = selectedServices.find(s => s.service_id === service.id);
                return (
                  <div key={service.id} className="space-y-2">
                    <div
                      onClick={() => toggleService(service)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                        ? 'border-[#D44B0A] bg-[#FDF0E8]' 
                        : 'border-[#DDD8D2] bg-white hover:border-[#A89E97]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isSelected ? 'text-[#D44B0A]' : 'text-[#0E0D0C]'}`}>
                          {service.name}
                        </span>
                        {isSelected && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D44B0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6560] line-clamp-2">{service.description}</p>
                    </div>

                    {isSelected && (
                      <div className="px-1">
                        <label className="text-[10px] font-bold text-[#4A443F] uppercase tracking-wider">
                          Rate for {service.name} (₹/hr)
                        </label>
                        <input
                          type="number"
                          value={isSelected.custom_rate}
                          onChange={(e) => handleServiceRateChange(service.id, e.target.value)}
                          placeholder={formData.rate_per_hour || "200"}
                          className="w-full mt-1 px-3 py-1.5 text-sm rounded-lg border-2 border-[#D44B0A] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-[#D44B0A] text-white font-bold rounded-lg hover:bg-[#B83D08] transition-colors disabled:opacity-50"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
