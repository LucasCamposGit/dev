import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json([], { status: 400 });
    }
    
    const replies = await prisma.note.findMany({
      where: {
        parent_id: parseInt(id)
      },
      orderBy: {
        created_at: 'asc'
      }
    });
    
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json([], { status: 500 });
  }
}