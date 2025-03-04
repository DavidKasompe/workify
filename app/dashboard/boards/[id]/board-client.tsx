'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { Plus, Users, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/Button';
import { TaskModal } from '@/app/components/TaskModal';
import { DraggableTask } from '@/app/components/DraggableTask';
import { Task } from '@/app/types';
import { Breadcrumb } from '@/app/components/Breadcrumb';

interface Column {
  id: string;
  name: string;
  order: number;
}

interface Board {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  tasks: Task[];
  columns: Column[];
}

interface BoardClientProps {
  id: string;
}

const columnToStatus: { [key: string]: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' } = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  'Review': 'REVIEW',
  'Done': 'DONE',
};

const statusToColumn: { [key: string]: string } = {
  'TODO': 'To Do',
  'IN_PROGRESS': 'In Progress',
  'REVIEW': 'Review',
  'DONE': 'Done',
};

export function BoardClient({ id }: BoardClientProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }
    })
  );

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/${id}`);
      if (!response.ok) throw new Error('Failed to fetch board');
      const data = await response.json();
      
      
      if (data && data.tasks) {
        data.tasks = data.tasks.map(task => ({
          ...task,
          id: String(task.id) 
        }));
      }
      
      setBoard(data);
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, boardId: id }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create task');
      }
      
      if (!responseData.data) {
        throw new Error('No data received from server');
      }

      
      await fetchBoard();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const getTasksByStatus = (columnName: string) => {
    if (!board?.tasks) return [];
    
    const status = columnToStatus[columnName];
    if (!status) return [];
    
    return board.tasks
      .filter(task => task && task.id && task.status === status)
      .map(task => ({
        ...task,
        id: String(task.id)
      }));
  };

  
  const findTask = (taskId: string) => {
    if (!board?.tasks) return null;
    
    const task = board.tasks.find(task => String(task.id) === taskId);
    return task || null;
  };

 
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = String(active.id);
    const task = findTask(taskId);
    
    if (task) {
      setActiveTask(task);
      
      const container = statusToColumn[task.status];
      setActiveContainer(container);
    }
  };

  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setHoveredContainer(over ? String(over.id) : null);
  };

  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
  
    setActiveTask(null);
    setActiveContainer(null);
    setHoveredContainer(null);
    
  
    if (!over || !board) return;
    
    const taskId = String(active.id);
    const destinationColumn = String(over.id);
    
    
    const task = findTask(taskId);
    if (!task) return;
    
    
    const newStatus = columnToStatus[destinationColumn];
    if (!newStatus) return;
    
    
    if (statusToColumn[task.status] === destinationColumn) return;
    
    console.log(`Moving task ${taskId} from ${task.status} to ${newStatus}`);
    
    try {
      
      const updatedTasks = board.tasks.map(t => 
        String(t.id) === taskId ? { ...t, status: newStatus } : t
      );
      
      setBoard(prev => {
        if (!prev) return null;
        return { ...prev, tasks: updatedTasks };
      });
      
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task status`);
      }
      
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchBoard(); 
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      
      await fetchBoard();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      
      await fetchBoard();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const breadcrumbItems = [
    { label: 'Boards', href: '/dashboard' },
    { label: board?.name || 'Loading...', href: `/dashboard/boards/${id}` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Board not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
        <Button size="sm" onClick={() => setShowNewTaskModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {board.columns.map((column) => {
            
            return (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.name)}
                isActive={activeContainer === column.name}
                isOver={hoveredContainer === column.name}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            );
          })}
        </div>

        {}
        <DragOverlay>
          {activeTask && (
            <div className="p-3 rounded-lg border bg-white shadow-lg max-w-xs">
              <div className="text-sm font-medium line-clamp-1">{activeTask.title}</div>
              {activeTask.description && (
                <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {activeTask.description}
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSubmit={handleCreateTask}
        boardId={id}
      />
    </div>
  );
}


function DroppableColumn({ 
  column, 
  tasks, 
  isActive,
  isOver,
  onUpdate,
  onDelete
}: { 
  column: Column, 
  tasks: Task[],
  isActive: boolean,
  isOver: boolean,
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>,
  onDelete: (taskId: string) => Promise<void>
}) {
  
  const { setNodeRef } = useDroppable({
    id: column.name,
  });

  return (
    <div 
      className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col"
    >
      <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
        {column.name}
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h3>
      
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[200px] p-2 rounded-lg transition-colors
          ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : ''}
          ${isActive ? 'bg-gray-100' : ''}
        `}
        style={{ minHeight: '200px' }}
      >
        {tasks.map((task, index) => (
          <DraggableTask
            key={task.id}
            task={task}
            index={index}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        
        {tasks.length === 0 && !isOver && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400">No tasks</p>
          </div>
        )}
        
        {isOver && tasks.length === 0 && (
          <div className="h-full border-2 border-dashed border-indigo-200 rounded-lg"></div>
        )}
      </div>
    </div>
  );
} 