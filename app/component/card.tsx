// Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // Add onMouseEnter and onMouseLeave as optional props
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onMouseEnter, onMouseLeave }) => {
  return (
    <div className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );
};

export default Card;
