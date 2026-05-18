import React from 'react';

const Input = React.forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
});

export default Input;
