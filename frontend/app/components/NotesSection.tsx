'use client';

import { useState } from 'react';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { Note } from '../../types';

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
    
    if (!formData.content.trim()) {
      showToast.warning('Please enter some content for your note! ');
      return;
    }

    const loadingMessage = editingNote ? 'Updating note...' : 'Creating note...';
    const loadingToastId = showToast.loading(loadingMessage);

    try {
      const noteData = {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
      };

      if (editingNote) {
        // Update existing note
        await api.patch(`/api/update-notes/${editingNote.id}`, noteData);
        showToast.update(loadingToastId, 'Note updated successfully! ', 'success');
      } else {
        // Create new note
        await api.post('/api/add-notes', noteData);
        showToast.update(loadingToastId, 'Adventure log created!', 'success');
      }

      setFormData({ title: '', content: '' });
      setIsCreating(false);
      setEditingNote(null);
      onNotesUpdate();
    } catch (error) {
      let errorMessage = 'Failed to save note';
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        errorMessage = typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : errorMessage;
      }
      const actionType = editingNote ? 'update' : 'create';
      showToast.update(loadingToastId, `Failed to ${actionType} note: ${errorMessage}`, 'error');
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
      const loadingToastId = showToast.loading('Deleting note...');
      try {
        await api.delete(`/api/delete-notes/${noteId}`);
        showToast.update(loadingToastId, 'Note deleted successfully! ', 'success');
        onNotesUpdate();
      } catch (error) {
        let errorMessage = 'Failed to delete note';
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'error' in error.response.data
        ) {
          errorMessage = typeof error.response.data.error === 'string'
            ? error.response.data.error
            : errorMessage;
        }
        showToast.update(loadingToastId, `Failed to delete note: ${errorMessage}`, 'error');
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
            className="px-4 py-2 rounded pixel-border pixel-font bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            NEW ADVENTURE LOG
          </button>
        </div>
      )}

      {/* Note Form */}
      {isCreating && (
        <div className="pixel-border bg-yellow-400/10 mb-6 p-4">
          <h3 className="text-sm mb-4 text-center pixel-font">
            {editingNote ? 'EDIT NOTE' : 'CREATE NOTE'}
          </h3> 
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div>
              <label className="block text-xs mb-2 pixel-font">Title (optional):</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                placeholder="Enter note title..."
              />
            </div>

            <div>
              <label className="block text-xs mb-2 pixel-font">Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-32 resize-none pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                placeholder="Write your adventure notes here..."
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded pixel-border pixel-font bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                {editingNote ? 'UPDATE' : ' CREATE'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 rounded pixel-border pixel-font bg-gradient-to-r from-pink-500 to-red-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4 max-h-96 overflow-y-auto ">
        {sortedNotes.length === 0 ? (
          <div className="text-center pixel-border bg-[#181825]/80 p-6">
            <p className="text-sm pixel-font">No adventure logs found!</p>
            <p className="text-xs mt-2">Start documenting your journey!</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className="pixel-border bg-[#181825] p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {note.title && (
                    <h3 className="font-bold text-sm mb-2 pixel-font">{note.title}</h3>
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
                    className="px-2 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
                    title='Edit'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className='w-3 h-3' viewBox="0 0 640 640"><path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"/></svg>
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="px-2 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-pink-500 to-red-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className='w-3 h-3' viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
                  </button>
                </div>
              </div>
              <div className="pixel-border p-3 bg-[#232946]/10">
                <pre className="text-sm whitespace-pre-wrap font-mono break-words pixel-font">
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
