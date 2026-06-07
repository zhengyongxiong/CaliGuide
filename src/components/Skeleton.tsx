interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-variant rounded';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '2.5rem', height: '2.5rem' },
    rectangular: { width: '100%', height: '8rem' },
  };

  const style = {
    width: width || defaultSizes[variant].width,
    height: height || defaultSizes[variant].height,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton layouts
export function PostSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" height="0.75rem" />
          <Skeleton width="25%" height="0.5rem" />
        </div>
      </div>
      <Skeleton count={2} />
      <Skeleton width="60%" height="0.5rem" />
    </div>
  );
}

export function GuideSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton variant="rectangular" height={160} />
      <div className="p-4 space-y-2">
        <Skeleton width="25%" height="0.5rem" />
        <Skeleton />
        <Skeleton width="75%" height="0.5rem" />
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton width={60} height={20} />
        <Skeleton width={40} height={20} />
      </div>
      <Skeleton />
      <Skeleton width="75%" height="0.5rem" />
      <div className="flex gap-4">
        <Skeleton width={100} height={16} />
        <Skeleton width={80} height={16} />
      </div>
    </div>
  );
}
