export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: '#A89E97' }}>
          {label}
        </label>
      )}
      <input
        className="px-4 py-3 rounded-sm border-2 bg-white text-[14px] outline-none transition-colors font-sans"
        style={{ borderColor: error ? '#B93424' : '#DDD8D2' }}
        onFocus={e => e.currentTarget.style.borderColor = '#0E0D0C'}
        onBlur={e => e.currentTarget.style.borderColor = error ? '#B93424' : '#DDD8D2'}
        {...props}
      />
      {error && (
        <p className="text-[12px]" style={{ color: '#B93424' }}>{error}</p>
      )}
    </div>
  );
}
