import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

function WorkerCard({ worker, onToggle, onEdit, onDelete }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(worker.id, !worker.is_available);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#FDF0E8', color: '#D44B0A' }}>
            {worker.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold" style={{ color: '#0E0D0C' }}>{worker.name}</p>
            <p className="text-xs" style={{ color: '#6B6560' }}>{worker.mobile || 'No mobile'}</p>
          </div>
        </div>
        <button onClick={handleToggle} disabled={toggling} className="flex items-center gap-1.5">
          <div
            className="w-8 h-4 rounded-full relative transition-colors duration-200"
            style={{ background: worker.is_available ? '#1A6E42' : '#DDD8D2' }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: worker.is_available ? 'translateX(16px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: worker.is_available ? '#1A6E42' : '#6B6560' }}>
            {worker.is_available ? 'Available' : 'Busy'}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(Array.isArray(worker.skills) ? worker.skills : worker.skills?.split(',') || []).map((skill, i) => (
          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5F1EC', color: '#6B6560' }}>
            {skill.trim()}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs" style={{ color: '#6B6560' }}>Daily Rate: </span>
          <span className="text-sm font-bold" style={{ color: '#D44B0A' }}>{formatCurrency(worker.daily_rate)}</span>
          <span className="text-xs" style={{ color: '#A89E97' }}>/day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#A89E97' }}>
            {worker.total_jobs || 0} jobs
          </span>
          <button
            onClick={() => onEdit(worker)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: '#DDD8D2', color: '#6B6560' }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(worker)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ color: '#B93424' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkerModal({ worker, services, onClose, onSubmit }) {
  const [name, setName] = useState(worker?.name || '');
  const [mobile, setMobile] = useState(worker?.mobile || '');
  const [dailyRate, setDailyRate] = useState(worker?.daily_rate || '');
  const [selectedSkills, setSelectedSkills] = useState(Array.isArray(worker?.skills) ? worker.skills : []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useContext(ToastContext);

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!dailyRate || dailyRate <= 0) { setError('Valid daily rate is required'); return; }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), mobile, daily_rate: Number(dailyRate), skills: selectedSkills }, worker?.id);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(14,13,12,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #DDD8D2' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold" style={{ color: '#0E0D0C' }}>{worker ? 'Edit Worker' : 'Add Worker'}</h3>
          <button onClick={onClose} className="text-lg" style={{ color: '#6B6560' }}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Raju Mistri"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Daily Rate (Rs.) *</label>
            <input
              type="number"
              value={dailyRate}
              onChange={e => setDailyRate(e.target.value)}
              placeholder="450"
              min="1"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{ background: '#FAFAFA', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6B6560' }}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {(services || []).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSkillToggle(s.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    borderColor: selectedSkills.includes(s.name) ? '#D44B0A' : '#DDD8D2',
                    background: selectedSkills.includes(s.name) ? '#FDF0E8' : 'transparent',
                    color: selectedSkills.includes(s.name) ? '#D44B0A' : '#6B6560',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-center py-2 rounded-lg" style={{ background: '#FDECEA', color: '#B93424' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#D44B0A' }}
          >
            {submitting ? 'Saving...' : worker ? 'Update Worker' : 'Add Worker'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MyWorkers() {
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [deleteWorker, setDeleteWorker] = useState(null);
  const { showToast } = useContext(ToastContext);

  const loadWorkers = () => {
    api.get('/workers')
      .then(res => { if (res.data.success) setWorkers(res.data.data); })
      .catch(() => showToast('Failed to load workers', 'error'))
      .finally(() => setLoading(false));
  };

  const loadServices = () => {
    api.get('/services')
      .then(res => { if (res.data.success) setServices(res.data.data); })
      .catch(() => {});
  };

  useEffect(() => { loadWorkers(); loadServices(); }, []);

  const handleToggle = async (id, is_available) => {
    try {
      const res = await api.put(`/workers/${id}`, { is_available });
      if (res.data.success) {
        setWorkers(prev => prev.map(w => w.id === id ? { ...w, is_available } : w));
        showToast(`Worker marked as ${is_available ? 'available' : 'busy'}`, 'success');
      }
    } catch {
      showToast('Failed to update availability', 'error');
    }
  };

  const handleAddWorker = async (data) => {
    const res = await api.post('/workers', data);
    if (res.data.success) {
      showToast('Worker added to your team!', 'success');
      loadWorkers();
    }
  };

  const handleEditWorker = async (data, id) => {
    const res = await api.put(`/workers/${id}`, data);
    if (res.data.success) {
      showToast('Worker updated!', 'success');
      loadWorkers();
    }
  };

  const handleDeleteWorker = async (worker) => {
    setDeleteWorker(worker);
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/workers/${deleteWorker.id}`);
      if (res.data.success) {
        showToast('Worker removed', 'success');
        setWorkers(prev => prev.filter(w => w.id !== deleteWorker.id));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Cannot remove worker with active booking';
      showToast(msg, 'error');
    } finally {
      setDeleteWorker(null);
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Available' && w.is_available) || (filter === 'Busy' && !w.is_available);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: '#0E0D0C' }}>My Team</h1>
          <p className="text-sm font-semibold" style={{ color: '#6B6560' }}>
            {workers.length} Worker{workers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditWorker(null); setModalOpen(true); }}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#D44B0A' }}
        >
          Add Worker
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2', color: '#0E0D0C' }}
        />
        <div className="flex gap-2">
          {['All', 'Available', 'Busy'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: filter === f ? '#D44B0A' : '#FFFFFF',
                color: filter === f ? '#FFFFFF' : '#6B6560',
                border: '1.5px solid #DDD8D2',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ background: '#FFFFFF' }} />
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
          {workers.length === 0 ? (
            <>
              <p className="text-lg font-bold mb-2" style={{ color: '#0E0D0C' }}>Your team is empty</p>
              <p className="text-sm mb-6" style={{ color: '#A89E97' }}>
                Add your first worker to start accepting jobs.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#D44B0A' }}
              >
                Add Worker
              </button>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#A89E97' }}>No workers match your search</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkers.map(worker => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onToggle={handleToggle}
              onEdit={(w) => { setEditWorker(w); setModalOpen(true); }}
              onDelete={handleDeleteWorker}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <WorkerModal
          worker={editWorker}
          services={services}
          onClose={() => setModalOpen(false)}
          onSubmit={editWorker ? handleEditWorker : handleAddWorker}
        />
      )}

      {deleteWorker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(14,13,12,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #B93424' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0E0D0C' }}>Remove Worker?</h3>
            <p className="text-sm mb-6" style={{ color: '#6B6560' }}>
              Are you sure you want to remove <strong style={{ color: '#0E0D0C' }}>{deleteWorker.name}</strong> from your team?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteWorker(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:opacity-80" style={{ borderColor: '#DDD8D2', color: '#6B6560' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#B93424' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
