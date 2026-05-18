import React from 'react';

const styles = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/25 dark:text-amber-300 dark:border-amber-800',
  'In Progress': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/25 dark:text-blue-300 dark:border-blue-800',
  Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-300 dark:border-emerald-800',
};

const StatusSelect = ({ value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`select-status font-medium rounded-lg border py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/30 focus:border-primary dark:bg-gray-800 ${styles[value] || ''} ${className || 'text-sm'}`}
  >
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>
);

export default StatusSelect;
