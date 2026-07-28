export default function PlaceholderMedia({
  label,
  className = "",
  color = "#111111",
  children,
}: {
  label?: string;
  className?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #3a3a3a 100%)`,
      }}
    >
      {label && (
        <span className="font-heading text-paper/70 text-sm tracking-widest px-4 text-center">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
