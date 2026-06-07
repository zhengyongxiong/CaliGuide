interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export default function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
