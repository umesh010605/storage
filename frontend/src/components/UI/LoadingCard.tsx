import React from 'react';

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ 
  title = "Loading...", 
  description,
  className = "" 
}) => {
  return (
    <div className={`card animate-fade-in ${className}`}>
      <div className="flex items-center justify-center space-x-3">
        <div className="loading-spinner h-6 w-6 border-primary-600" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;