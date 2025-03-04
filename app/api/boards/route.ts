import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { id: session.user.id } } }
        ]
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
          select: {
            id: true,
            status: true,
          }
        },
        columns: {
          orderBy: {
            order: 'asc',
          }
        },
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Error fetching boards' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    // Create default columns
    const defaultColumns = [
      { name: 'To Do', order: 0 },
      { name: 'In Progress', order: 1 },
      { name: 'Review', order: 2 },
      { name: 'Done', order: 3 },
    ];

    const board = await prisma.board.create({
      data: {
        name,
        description,
        owner: {
          connect: { id: session.user.id },
        },
        members: {
          connect: [{ id: session.user.id }],
        },
        columns: {
          create: defaultColumns,
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

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Error creating board' }, { status: 500 });
  }
} 