import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the id parameter at the beginning
    const params = await Promise.resolve(context.params);
    const id = params.id;

    const task = await prisma.task.findUnique({
      where: {
        id: id,
        ownerId: session.user.id,
      },
      include: {
        subtasks: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Error fetching task' },
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

    // Extract the id parameter at the beginning
    const params = await Promise.resolve(context.params);
    const id = params.id;

    const body = await req.json();
    const { title, description, priority, dueDate, recurring, status, progress, subtasks } = body;

    // First, update the main task
    const task = await prisma.task.update({
      where: {
        id: id,
        ownerId: session.user.id,
      },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        recurring,
        status,
        progress,
      },
      include: {
        subtasks: true,
      },
    });

    // Then, handle subtasks updates
    if (subtasks) {
      // Delete existing subtasks
      await prisma.task.deleteMany({
        where: {
          parentId: id,
        },
      });

      // Create new subtasks
      if (subtasks.length > 0) {
        await prisma.task.createMany({
          data: subtasks.map((subtask: { title: string; completed: boolean }) => ({
            title: subtask.title,
            description: '',
            priority: priority,
            status: 'TODO',
            progress: subtask.completed ? 100 : 0,
            ownerId: session.user.id,
            parentId: id,
          })),
        });
      }
    }

    // Fetch the updated task with new subtasks
    const updatedTask = await prisma.task.findUnique({
      where: {
        id: id,
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error updating task' },
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

    // Extract the id parameter at the beginning
    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Delete the task and all its subtasks
    await prisma.task.delete({
      where: {
        id: id,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error deleting task' },
      { status: 500 }
    );
  }
} 