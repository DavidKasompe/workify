'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  useDroppable
} from '@dnd-kit/core';
import { Button } from '@/components/Button';
import { TaskModal } from '@/components/TaskModal';
import { TaskDetail } from '@/components/TaskDetail';
import { DraggableTask } from '@/components/DraggableTask';
import { TaskFilters, TaskFilters as TaskFiltersType } from '@/components/TaskFilters';
import { Task } from '@/app/types';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
}

interface Board {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [defaultBoardId, setDefaultBoardId] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    status: [],
    priority: [],
    search: '',
  });

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }
    })
  );

  const calendarDays = generateCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  useEffect(() => {
    fetchBoards();
    fetchTasks();
  }, [currentDate]);

  useEffect(() => {
    
    let result = [...tasks];

    
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status));
    }

    
    if (filters.priority.length > 0) {
      result = result.filter(task => filters.priority.includes(task.priority));
    }

    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTasks(result);
  }, [tasks, filters]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      setBoards(data);
      
      
      if (data.length > 0) {
        setDefaultBoardId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      
      if (selectedDate && !taskData.dueDate) {
        taskData.dueDate = selectedDate;
      }
      
      
      if (!taskData.boardId && defaultBoardId) {
        taskData.boardId = defaultBoardId;
      }
      
      
      const apiData = {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        status: 'TODO' 
      };
      
      console.log('Creating task with data:', apiData);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(`Failed to create task: ${response.status}`);
      }
      
      await fetchTasks();
      setShowNewTaskModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDateId = (date: Date): string => {
    return date.toISOString().split('T')[0]; 
  };

  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = String(active.id);
    const task = tasks.find(t => String(t.id) === taskId);
    
   
    document.body.classList.add('dragging');
    
    if (task) {
      setActiveTask(task);
    }
  };

  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    
    document.body.classList.remove('dragging');
    
    
    setActiveTask(null);
    
   
    if (!over) return;
    
    const taskId = String(active.id);
    const dateId = String(over.id);
    
   
    const task = tasks.find(t => String(t.id) === taskId);
    if (!task) return;
    
    try {
      
      const [year, month, day] = dateId.split('-').map(Number);
      const newDueDate = new Date(year, month - 1, day); 
      
      console.log(`Moving task ${taskId} to date ${newDueDate.toDateString()}`);
      
      
      const updatedTasks = tasks.map(t => 
        String(t.id) === taskId ? { ...t, dueDate: newDueDate.toISOString() } : t
      );
      
      setTasks(updatedTasks);
      
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: newDueDate.toISOString() }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task date`);
      }
      
    } catch (error) {
      console.error('Error updating task date:', error);
      fetchTasks(); 
    }
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    if (!activeTask) {
      e.stopPropagation(); 
      setSelectedTask(task);
      setShowTaskDetail(true);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update task');

      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      
      
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

     
      setTasks(tasks.filter(task => task.id !== taskId));
      
      
      if (selectedTask && selectedTask.id === taskId) {
        setShowTaskDetail(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowNewTaskModal(true);
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      {}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule and manage your tasks
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNewTaskModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {}
      <TaskFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden">
            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                day ? (
                  <DroppableDay
                    key={index}
                    day={day}
                    isToday={isToday(day)}
                    tasks={getTasksForDate(day)}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onDateClick={handleDateClick}
                    onTaskClick={handleTaskClick}
                  />
                ) : (
                  <div key={index} className="min-h-[120px] border-gray-100" />
                )
              ))}
            </div>
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
      )}

      {}
      <TaskModal
        isOpen={showNewTaskModal}
        onClose={() => {
          setShowNewTaskModal(false);
          setSelectedDate(null);
        }}
        onSubmit={handleCreateTask}
        boardId={defaultBoardId}
        initialDate={selectedDate?.toISOString()}
      />

      {}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}


function DroppableDay({ 
  day, 
  isToday, 
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onDateClick,
  onTaskClick
}: { 
  day: Date, 
  isToday: boolean,
  tasks: Task[],
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>,
  onTaskDelete: (taskId: string) => Promise<void>,
  onDateClick: (date: Date) => void,
  onTaskClick: (task: Task, e: React.MouseEvent) => void
}) {
  
  const dateId = day.toISOString().split('T')[0]; 
  const { setNodeRef, isOver } = useDroppable({
    id: dateId,
  });

  const handleDayClick = () => {
    onDateClick(day);
  };

  return (
    <div
      className={`min-h-[120px] p-2 border relative ${
        isToday ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100'
      } ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : ''}`}
      onClick={handleDayClick}
    >
      <div className="flex justify-between">
        <span className={`text-sm ${
          isToday ? 'text-indigo-600 font-medium' : 'text-gray-500'
        }`}>
          {day.getDate()}
        </span>
        
        {tasks.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        )}
      </div>
      
      <div 
        ref={setNodeRef}
        className="mt-2 space-y-1 max-h-[200px] overflow-y-auto"
        onClick={e => e.stopPropagation()} 
      >
        {tasks.map((task, taskIndex) => (
          <div
            key={task.id}
            className="cursor-pointer" 
            onClick={(e) => {
              
              if (!document.body.classList.contains('dragging')) {
                onTaskClick(task, e);
              }
            }}
          >
            <DraggableTask
              key={task.id}
              task={task}
              index={taskIndex}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 