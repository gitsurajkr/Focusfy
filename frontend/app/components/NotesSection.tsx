'use client';

import { useState } from 'react';

interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  notes: Note[];
  onNotesUpdate: () => void;
}

export default function NotesSection({ notes, onNotesUpdate }: NotesSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) return;

    try {
      const noteData = {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
      };

      let response;
      if (editingNote) {
        // Update existing note
        response = await fetch(`http://localhost:3001/api/update-notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData),
        });
      } else {
        // Create new note
        response = await fetch('http://localhost:3001/api/add-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData),
        });
      }

      if (response.ok) {
        setFormData({ title: '', content: '' });
        setIsCreating(false);
        setEditingNote(null);
        onNotesUpdate();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content,
    });
    setIsCreating(true);
  };

  const deleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/delete-notes/${noteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onNotesUpdate();
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingNote(null);
    setFormData({ title: '', content: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sortedNotes = notes.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div>
      {/* Create Note Button */}
      {!isCreating && (
        <div className="mb-6 text-center">
          <button
            onClick={() => setIsCreating(true)}
            className="minecraft-btn task-habit"
          >
            📝 NEW ADVENTURE LOG
          </button>
        </div>
      )}

      {/* Note Form */}
      {isCreating && (
        <div className="minecraft-card mb-6" style={{ background: 'var(--minecraft-yellow)' }}>
          <h3 className="text-sm mb-4 text-center">
            {editingNote ? 'EDIT NOTE' : 'CREATE NOTE'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-2">Title (optional):</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="minecraft-input w-full"
                placeholder="Enter note title..."
              />
            </div>

            <div>
              <label className="block text-xs mb-2">Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="minecraft-input w-full h-32 resize-none"
                placeholder="Write your adventure notes here..."
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="minecraft-btn task-habit flex-1"
              >
                {editingNote ? 'UPDATE' : ' CREATE'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="minecraft-btn"
                style={{ background: 'var(--minecraft-red)' }}
              >
                ❌ CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="text-center minecraft-container p-6">
            <p className="text-sm">📰 No adventure logs found!</p>
            <p className="text-xs mt-2">Start documenting your journey!</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className="minecraft-card"
              style={{ background: 'var(--minecraft-white)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {note.title && (
                    <h3 className="font-bold text-sm mb-2">📚 {note.title}</h3>
                  )}
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <span> {formatDate(note.updated_at)}</span>
                    {note.created_at !== note.updated_at && (
                      <span className="text-yellow-600"> edited</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditing(note)}
                    className="minecraft-btn text-xs task-normal"
                    title='Edit'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className='w-3 h-3' viewBox="0 0 640 640"><path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"/></svg>
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="minecraft-btn text-xs"
                    style={{ background: 'var(--minecraft-red)' }}
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className='w-3 h-3' viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
                  </button>
                </div>
              </div>

              <div className="minecraft-container p-3 bg-gray-100">
                <pre className="text-sm  whitespace-pre-wrap font-mono break-words">
                  {note.content}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
