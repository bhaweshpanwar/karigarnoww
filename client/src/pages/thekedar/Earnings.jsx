import { useState, useEffect, useMemo, useContext } from 'react';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency, formatDateShort, getDayName, isThisMonth, isThisWeek } from '../../utils/formatters';

export default function Earnings() {
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    api.get('/bookings?status=completed&page=0&size=100')
      .then(res => {
        if (res.data.success) setBookings(res.data.data.content || []);
      })
      .catch(() => showToast('Failed to load earnings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const completedBookings = bookings.filter(b => b.booking_status === 'completed');

  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);
  const thisMonth = completedBookings.filter(b => b.scheduled_at && isThisMonth(b.scheduled_at));
  const thisMonthEarnings = thisMonth.reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);
  const thisWeek = completedBookings.filter(b => b.scheduled_at && isThisWeek(b.scheduled_at));
  const thisWeekEarnings = thisWeek.reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);
  const totalJobs = completedBookings.length;

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStr = d.toDateString();
      const dayEarnings = completedBookings
        .filter(b => {
          if (!b.scheduled_at) return false;
          const bDate = new Date(b.scheduled_at);
          bDate.setHours(0, 0, 0, 0);
          return bDate.toDateString() === dayStr;
        })
        .reduce((sum, b) => sum + (b.thekedar_payout || 0), 0);
      days.push({
        date: d,
        label: getDayName(d),
        shortLabel: getDayName(d).substring(0, 3),
        earnings: dayEarnings,
        hasEarnings: dayEarnings > 0,
      });
    }
    return days;
  }, [completedBookings]);

  const maxDayEarnings = Math.max(...last7Days.map(d => d.earnings), 1);

  const paginatedBookings = completedBookings
    .sort((a, b) => new Date(b.scheduled_at || b.created_at) - new Date(a.scheduled_at || a.created_at))
    .slice(page * pageSize, (page + 1) * pageSize);

  const totalPages = Math.ceil(completedBookings.length / pageSize);

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-3xl font-black mb-6" style={{ color: '#0E0D0C' }}>Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earned', value: formatCurrency(totalEarned), accent: true },
          { label: 'This Month', value: formatCurrency(thisMonthEarnings), accent: false },
          { label: 'This Week', value: formatCurrency(thisWeekEarnings), accent: false },
          { label: 'Total Jobs', value: totalJobs, accent: false },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6B6560' }}>
              {card.label}
            </p>
            <p className="text-2xl font-black" style={{ color: card.accent ? '#D44B0A' : '#0E0D0C' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bar Chart — Last 7 Days */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: '#FFFFFF', border: '1.5px solid #DDD8D2' }}>
        <h2 className="text-base font-bold mb-6" style={{ color: '#0E0D0C' }}>Last 7 Days</h2>
        <div className="flex items-end gap-3" style={{ height: '160px' }}>
          {last7Days.map((day, i) => {
            const heightPct = maxDayEarnings > 0 ? (day.earnings / maxDayEarnings) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="relative w-full flex flex-col items-center flex-1 justify-end">
                  {day.hasEarnings && (
                    <div
                      className="w-full rounded-t-lg transition-all group-hover:opacity-80 absolute bottom-0"
                      style={{ height: `${Math.max(heightPct, 4)}%`, background: '#D44B0A', minHeight: '4px' }}
                    />
                  )}
                  {!day.hasEarnings && (
                    <div
                      className="w-full rounded-t-lg absolute bottom-0"
                      style={{ height: '3px', borderTop: '2px dashed #DDD8D2', minHeight: '3px' }}
                    />
                  )}
                </div>
                <span className="text-xs font-semibold" style={{ color: '#6B6560' }}>
                  {day.shortLabel}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1A1713] px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10">
                  <span className="text-xs font-bold" style={{ color: '#D44B0A' }}>
                    {formatCurrency(day.earnings)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earnings Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#DDD8D2' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#EDE9E4' }}>
                {['Date', 'Service', 'Consumer', 'Workers', 'Total', 'Service Charge', 'Your Payout'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A89E97' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#A89E97' }}>
                    No completed bookings yet
                  </td>
                </tr>
              ) : paginatedBookings.map(booking => (
                <tr key={booking.id} className="border-b last:border-0" style={{ borderColor: '#F5F1EC' }}>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#0E0D0C' }}>
                    {booking.scheduled_at ? formatDateShort(booking.scheduled_at) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#6B6560' }}>
                    {booking.service?.name || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#6B6560' }}>
                    {booking.consumer_name ? booking.consumer_name.split(' ')[0] + ' ' + (booking.consumer_name.split(' ')[1]?.[0] || '') + '.' : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#6B6560' }}>
                    {booking.workers_needed || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: '#0E0D0C' }}>
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#A89E97' }}>
                    {formatCurrency(booking.platform_fee)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold" style={{ color: '#D44B0A' }}>
                    {formatCurrency(booking.thekedar_payout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#EDE9E4' }}>
            <p className="text-xs" style={{ color: '#A89E97' }}>
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-30"
                style={{ borderColor: '#DDD8D2', color: '#6B6560' }}
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-30"
                style={{ borderColor: '#DDD8D2', color: '#6B6560' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
