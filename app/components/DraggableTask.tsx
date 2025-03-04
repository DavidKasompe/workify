'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, Clock, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/app/types';
import { TaskDetail } from './TaskDetail';

interface DraggableTaskProps {
  task: Task;
  index: number;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function DraggableTask({ task, index, onUpdate, onDelete }: DraggableTaskProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  // Debug task ID
  console.log(`DraggableTask render with ID: ${task?.id} (${typeof task?.id}), index: ${index}`);

  // Make sure task ID exists and is a string
  const taskId = task?.id ? String(task.id) : '';
  if (!taskId) {
    console.error('Task is missing an ID', task);
    return null;
  }

  // Setup draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: taskId,
    data: { task }
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 hover:border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
      case 'LOW':
        return 'bg-blue-50 border-blue-200 hover:border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200 hover:border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'MEDIUM':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'LOW':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  console.log(`Rendering draggable task: ${taskId} at index ${index}`);

  // Calculate completion percentage
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.status === 'DONE')?.length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    try {
      setIsDeleting(true);
      await onDelete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    try {
      await onUpdate(taskId, { title: editTitle });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    setShowMenu(!showMenu);
  };

  if (isEditing) {
    return (
      <div 
        className="p-3 mb-2 rounded-lg border bg-white shadow"
        onClick={(e) => e.stopPropagation()} // Prevent clicking through when editing
      >
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-1 mb-2 border rounded-md"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={handleUpdate}
            className="p-1 text-blue-500 hover:text-blue-700"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Make the entire card draggable again for board functionality
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`
        p-3 mb-2 rounded-lg border bg-white shadow
        cursor-grab active:cursor-grabbing select-none
        transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-indigo-200' : ''}
        ${task.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : 
          task.priority === 'MEDIUM' ? 'border-l-4 border-l-yellow-500' : 
          'border-l-4 border-l-blue-500'}
      `}
      data-testid="draggable-task"
      data-task-id={taskId}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
        
        <button
          onClick={toggleMenu}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">{task.description}</p>
      )}

      {totalSubtasks > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <CheckSquare className="w-3 h-3 mr-1" />
              <span>{completedSubtasks} of {totalSubtasks} subtasks</span>
            </div>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {task.dueDate && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}

      {showMenu && (
        <div 
          className="absolute right-2 mt-1 w-32 bg-white rounded-md shadow-lg border z-10"
          onClick={(e) => e.stopPropagation()} // Prevent triggering parent click handlers
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
          >
            <Edit2 className="w-3 h-3 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <><Clock className="w-3 h-3 mr-2 animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 className="w-3 h-3 mr-2" /> Delete</>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 