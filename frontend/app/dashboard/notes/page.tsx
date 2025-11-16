"use client"

import { useState, FormEvent } from "react"
import { Plus, Search, Trash2, Edit2, Loader2 } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"

export default function NotesPage() {
  const { notes, loading, error, addNote, deleteNote, updateNote } = useNotes()
  const [showNewNote, setShowNewNote] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingNote, setEditingNote] = useState<{ id: string; title: string; content: string } | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  const filteredNotes = (notes || []).filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setIsSubmitting(true)
    try {
      if (editingNote) {
        await updateNote(editingNote.id, formData)
        setEditingNote(null)
      } else {
        await addNote(formData)
      }
      setFormData({ title: "", content: "" })
      setShowNewNote(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (note: typeof notes[0]) => {
    setEditingNote({ id: note.id, title: note.title, content: note.content })
    setFormData({ title: note.title, content: note.content })
    setShowNewNote(true)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    try {
      await deleteNote(noteId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCancel = () => {
    setShowNewNote(false)
    setEditingNote(null)
    setFormData({ title: "", content: "" })
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Write and organize your thoughts</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No notes found matching your search" : "No notes yet. Create your first note!"}
          </p>
        </div>
      ) : (
        /* Notes grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-20 md:mb-8">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-card border border-border rounded-xl p-3 md:p-4 hover:shadow-md transition-smooth flex flex-col min-h-[140px]"
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="font-semibold text-foreground line-clamp-2 flex-1 text-sm md:text-base">{note.title}</h3>
              <div className="flex gap-0.5 md:gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(note)}
                  className="p-1 hover:bg-muted rounded transition-smooth"
                >
                  <Edit2 size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 hover:bg-muted rounded transition-smooth"
                >
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{note.content}</p>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              {(() => {
                const date = new Date(note.created_at);
                return !isNaN(date.getTime()) 
                  ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'No date';
              })()}
            </p>
          </div>
        ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewNote(!showNewNote)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-primary to-secondary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-smooth flex items-center justify-center z-20"
      >
        <Plus size={20} className="md:w-6 md:h-6" />
      </button>

      {/* New/Edit Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 w-full max-w-2xl shadow-lg max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">
              {editingNote ? "Edit Note" : "Create New Note"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Note title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <textarea
                  placeholder="Write your note here..."
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth resize-none text-sm md:text-base md:rows-8"
                  required
                />
              </div>
              <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-3 md:px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 md:px-4 py-2 bg-linear-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>{editingNote ? "Update Note" : "Save Note"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
