import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const base = "animate-pulse bg-gray-200 dark:bg-gray-800";
  
  const variants = {
    text: "h-4 w-full rounded",
    rect: "h-20 w-full rounded-xl",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} />
  );
};
