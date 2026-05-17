export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white border transition-all duration-200 ${hover ? 'hover:border-none hover:shadow-md hover:-translate-y-0.5 hover:bg-bg2' : 'border-rule2'} rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
