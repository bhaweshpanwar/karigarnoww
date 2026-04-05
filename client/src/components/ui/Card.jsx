export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white border transition-colors ${hover ? 'hover:border-rule hover:shadow-sm' : 'border-rule2'} rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
