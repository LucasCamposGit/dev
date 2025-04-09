// /app/api/notes/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      where: {
        parent_id: null
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, parent_id } = body;
    
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const note = await prisma.note.create({
      data: {
        text,
        parent_id: parent_id ? parseInt(parent_id) : null
      }
    });
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
