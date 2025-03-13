import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
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

    const params = await Promise.resolve(context.params);
    const id = params.id;

    const body = await req.json();
    const { title, description, priority, dueDate, recurring, status, progress, subtasks } = body;

    await prisma.task.update({
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

    if (subtasks) {
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

    const params = await Promise.resolve(context.params);
    const id = params.id;

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

export async function PATCH(
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
    const { title, description, priority, dueDate, recurring, status, progress, subtasks } = body;

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
        ownerId: session.user.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(recurring !== undefined && { recurring }),
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress }),
      },
      include: {
        subtasks: true,
      },
    });

    if (subtasks) {
      await prisma.task.deleteMany({
        where: {
          parentId: id,
        },
      });

      if (subtasks.length > 0) {
        await prisma.task.createMany({
          data: subtasks.map((subtask: { title: string; completed: boolean }) => ({
            title: subtask.title,
            description: '',
            priority: priority || updatedTask.priority,
            status: 'TODO',
            progress: subtask.completed ? 100 : 0,
            ownerId: session.user.id,
            parentId: id,
          })),
        });
      }
    }

    const finalTask = await prisma.task.findUnique({
      where: {
        id: id,
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json(finalTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error updating task' },
      { status: 500 }
    );
  }
} 