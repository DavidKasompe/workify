import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        subtasks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate, recurring, subtasks, boardId } = body;

    // Validate required fields
    if (!title || !boardId) {
      return NextResponse.json(
        { error: 'Title and board ID are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        recurring,
        owner: {
          connect: { id: session.user.id },
        },
        board: {
          connect: { id: boardId },
        },
        subtasks: {
          create: Array.isArray(subtasks) ? subtasks.map((subtask: { title: string; completed: boolean }) => ({
            title: subtask.title,
            description: '',
            priority: priority || 'MEDIUM',
            status: 'TODO',
            progress: subtask.completed ? 100 : 0,
            owner: {
              connect: { id: session.user.id },
            },
          })) : [],
        },
      },
      include: {
        subtasks: true,
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
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Ensure we return a proper error object
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 