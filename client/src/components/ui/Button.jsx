export default function Button({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-sans font-semibold transition-colors rounded-sm';

  const variants = {
    solid: 'bg-ink text-white hover:bg-accent',
    ghost: 'bg-white border border-rule text-ink hover:border-ink',
    danger: 'bg-red text-white hover:bg-red/90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-6 py-3 text-[14px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
