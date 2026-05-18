import React from 'react';
import { ExternalLink } from 'lucide-react';

const TaskTitle = ({ task, className = '', as = 'h3' }) => {
  const link = task?.documentLinks?.[0];
  const Tag = as;

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-start gap-1.5 hover:text-primary transition-colors group line-clamp-2 ${className}`}
        title="Open document"
      >
        <Tag className="line-clamp-2">{task.title}</Tag>
        <ExternalLink size={14} className="flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100" />
      </a>
    );
  }

  return <Tag className={`line-clamp-2 ${className}`}>{task?.title}</Tag>;
};

export default TaskTitle;
