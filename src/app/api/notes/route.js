// app/api/notes/route.js
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db'; // Use alias configured in jsconfig.json or tsconfig.json

/**
 * GET handler to fetch main notes (no parent_id).
 */
export async function GET(request) {
  try {
    const db = await openDb();
    // Fetch only top-level notes
    const notes = await db.all('SELECT * FROM notes WHERE parent_id IS NULL ORDER BY created_at DESC');
    // No need to close db if connection is cached by openDb

    // Fetch reply counts for each note
    const notesWithReplyCounts = await Promise.all(notes.map(async (note) => {
        const replyCountResult = await db.get('SELECT COUNT(*) as count FROM notes WHERE parent_id = ?', [note.id]);
        return { ...note, reply_count: replyCountResult.count };
    }));

    return NextResponse.json(notesWithReplyCounts);
  } catch (error) {
    console.error("API GET /api/notes Error:", error);
    return NextResponse.json({ error: 'Failed to fetch notes', details: error.message }, { status: 500 });
  }
}

/**
 * POST handler to create a new note or a reply.
 */
export async function POST(request) {
  try {
    const { text, parent_id } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    if (text.length > 280) {
        return NextResponse.json({ error: 'Text cannot exceed 280 characters' }, { status: 400 });
    }

    const db = await openDb();
    const result = await db.run(
      'INSERT INTO notes (text, parent_id) VALUES (?, ?)',
      [text, parent_id || null] // Store parent_id if provided, otherwise null
    );

    // Fetch the newly created note/reply to return it
    const newNote = await db.get('SELECT * FROM notes WHERE id = ?', [result.lastID]);
    // No need to close db if connection is cached

    if (!newNote) {
        throw new Error('Failed to retrieve the created note.');
    }

    // If it's a reply, fetch the updated reply count for the parent
    let parentReplyCount = 0;
    if (parent_id) {
        const replyCountResult = await db.get('SELECT COUNT(*) as count FROM notes WHERE parent_id = ?', [parent_id]);
        parentReplyCount = replyCountResult.count;
    }


    return NextResponse.json({ ...newNote, parent_reply_count: parentReplyCount }, { status: 201 });

  } catch (error) {
    console.error("API POST /api/notes Error:", error);
    return NextResponse.json({ error: 'Failed to create note', details: error.message }, { status: 500 });
  }
}
