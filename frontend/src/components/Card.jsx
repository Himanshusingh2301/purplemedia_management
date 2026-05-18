import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '1.5rem', ...props.style }} {...props}>
      {children}
    </div>
  );
};

export default Card;
