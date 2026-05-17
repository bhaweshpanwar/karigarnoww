export default function Button({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-[Instrument+Sans] font-semibold transition-all duration-200 rounded-lg';

  const variants = {
    solid: 'bg-accent text-white hover:bg-[#B83D08] active:bg-[#9C3307] hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
    ghost: 'bg-transparent text-[#6B6560] hover:bg-[#F5F1EC] hover:text-[#0E0D0C] active:scale-[0.98]',
    outline: 'bg-white border-2 border-[#DDD8D2] text-[#0E0D0C] hover:border-[#0E0D0C] hover:bg-[#F5F1EC] active:scale-[0.98]',
    danger: 'bg-red text-white hover:bg-red/90',
  };

  const sizes = {
    sm: 'px-3 py-2 text-[12px]',
    md: 'px-4 py-3 text-[13px]',
    lg: 'px-6 py-4 text-[14px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
