import { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Paperclip,
  Download,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Button } from './Button';
import { Task } from '@/app/types';
import { ModalPortal } from './ModalPortal';

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskDetail({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    ...task,
    subtasks: task.subtasks || [],
    attachments: task.attachments || []
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate(task.id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleString();
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="w-full max-w-3xl mx-4 bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-gray-900">Task Details</h2>
            <div className={`px-2 py-1 rounded text-xs ${
              task.priority === 'HIGH'
                ? 'bg-red-100 text-red-700'
                : task.priority === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {task.priority}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
              />
            ) : (
              <p className="text-gray-900">{task.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description'}</p>
            )}
          </div>

          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    status: e.target.value as Task['status']
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    task.status === 'DONE' ? 'bg-green-500' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                    task.status === 'REVIEW' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-gray-700">{task.status}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editedTask.progress}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    progress: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
                />
              ) : (
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${task.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                  <span className="text-sm text-gray-700 mt-1">{task.progress}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates and Recurring */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    dueDate: e.target.value ? e.target.value : null
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring
              </label>
              {isEditing ? (
                <select
                  value={editedTask.recurring || ''}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    recurring: e.target.value as Task['recurring']
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300"
                >
                  <option value="">No recurring</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{task.recurring || 'No recurring'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtasks
            </label>
            <div className="space-y-2">
              {task.subtasks?.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckSquare className={`w-4 h-4 ${
                      subtask.progress === 100 ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className="text-gray-700">{subtask.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{subtask.progress}%</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No subtasks</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="space-y-2">
              {task.attachments?.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{attachment.name}</span>
                  </div>
                  <a
                    href={attachment.url}
                    download
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No attachments</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
            {isEditing && (
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
} 