// app/api/notes/[id]/route.js
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

/**
 * DELETE handler to delete a note and its replies (cascading delete).
 */
export async function DELETE(request, { params }) {
  const { id } = params; // Get id from route parameters

  if (!id) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  try {
    const db = await openDb();

    // Foreign key constraint with ON DELETE CASCADE should handle replies automatically.
    // We just need to delete the main note.
    const result = await db.run('DELETE FROM notes WHERE id = ?', [id]);
    // No need to close db if connection is cached

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Optionally, fetch the parent's new reply count if this was a reply
    // (Though the frontend might handle this update based on the successful delete)

    return NextResponse.json({ message: 'Note deleted successfully', changes: result.changes });
  } catch (error) {
    console.error(`API DELETE /api/notes/${id} Error:`, error);
    return NextResponse.json({ error: 'Failed to delete note', details: error.message }, { status: 500 });
  }
}
