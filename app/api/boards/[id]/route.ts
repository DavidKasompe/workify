import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Ensure id exists
    if (!id) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    const board = await prisma.board.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        tasks: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            assignees: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            subtasks: true,
            attachments: true,
          }
        },
        columns: {
          orderBy: {
            order: 'asc',
          }
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check if user has access to the board
    const hasAccess = board.ownerId === session.user.id || 
      board.members.some(member => member.id === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Error fetching board' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const id = params.id;

    const body = await req.json();
    const { name, description, memberIds } = body;

    // Check if user is board owner
    const board = await prisma.board.findUnique({
      where: { id: id },
      select: { ownerId: true },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: id },
      data: {
        name,
        description,
        members: {
          set: memberIds.map((id: string) => ({ id })),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        columns: true,
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Error updating board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Check if user is board owner
    const board = await prisma.board.findUnique({
      where: { id: id },
      select: { ownerId: true },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the board and all related data
    await prisma.board.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Error deleting board' },
      { status: 500 }
    );
  }
} 