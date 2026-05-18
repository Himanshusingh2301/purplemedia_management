import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function getTextNotes(task) {
  if (!task) return [];
  const items = (task.notes || [])
    .filter((n) => n.type === 'text')
    .map((n) => ({ id: n._id, content: n.content, user: n.user, createdAt: n.createdAt }));

  (task.comments || []).forEach((c) => {
    items.push({ id: `c-${c._id}`, content: c.text, user: c.user, createdAt: c.createdAt });
  });

  return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

const NotesPanel = ({ task, open, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open || !task) return null;

  const textNotes = getTextNotes(task);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `/api/tasks/${task._id}/notes`,
        { type: 'text', content: content.trim() },
        config
      );
      setContent('');
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Notes</h2>
            <p className="mt-0.5 text-sm text-gray-400 line-clamp-1">{task.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {textNotes.length > 0 ? (
            <ul className="space-y-3">
              {textNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-200"
                >
                  <p className="whitespace-pre-wrap break-words">{note.content}</p>
                  {note.user?.name && (
                    <span className="mt-1.5 block text-xs text-gray-500">
                      {note.user.name}
                      {note.createdAt && ` · ${new Date(note.createdAt).toLocaleDateString()}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No notes yet.</p>
          )}
        </div>

        <form onSubmit={handleAdd} className="border-t border-gray-800 p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a note..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </aside>
    </div>
  );
};

export default NotesPanel;
