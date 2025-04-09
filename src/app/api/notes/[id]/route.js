import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // First delete any replies (cascade should handle this with Prisma but being explicit)
    await prisma.note.deleteMany({
      where: {
        parent_id: parseInt(id)
      }
    });
    
    // Then delete the main note
    const deletedNote = await prisma.note.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return NextResponse.json({ message: 'Note deleted', note: deletedNote });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}