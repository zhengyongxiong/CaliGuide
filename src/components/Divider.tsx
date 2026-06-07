interface DividerProps {
  className?: string;
  label?: string;
}

export default function Divider({ className = '', label }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="text-xs text-on-surface-variant font-medium">{label}</span>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>
    );
  }

  return <div className={`h-px bg-outline-variant ${className}`} />;
}
