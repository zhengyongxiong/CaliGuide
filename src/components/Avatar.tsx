interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase();
    if (alt) return alt.charAt(0).toUpperCase();
    return '?';
  };

  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600',
    'bg-pink-100 text-pink-600',
    'bg-teal-100 text-teal-600',
  ];

  const getColor = () => {
    const char = getInitial();
    const index = char.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center ${getColor()}`}>
          {getInitial()}
        </div>
      )}
    </div>
  );
}
