
import React from 'react';
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt,
  size = 'md', 
  status,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("relative rounded-full", className)}>
      <img 
        src={src} 
        alt={alt} 
        className={cn(
          "rounded-full object-cover border-2 border-white",
          sizeClasses[size]
        )}
      />
      {status && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2 border-white",
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
            status === 'online' ? 'bg-green-400' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
