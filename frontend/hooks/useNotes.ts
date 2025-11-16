"use client"

import { useState, useEffect } from 'react';
import { noteApi } from '@/lib/api';
import type { Note } from '@/lib/types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await noteApi.getNotes();
      setNotes(fetchedNotes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (noteData: { title: string; content: string }) => {
    try {
      const note = await noteApi.addNote(noteData);
      setNotes(prev => [...prev, note]);
      return note;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add note');
    }
  };

  const updateNote = async (noteId: string, updates: { title?: string; content?: string }) => {
    try {
      const note = await noteApi.updateNote(noteId, updates);
      setNotes(prev => prev.map(n => n.id === noteId ? note : n));
      return note;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await noteApi.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete note');
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
  };
}
