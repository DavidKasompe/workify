'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Clock, CheckSquare, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/Button';
import Link from 'next/link';
import { BoardModal } from '@/app/components/BoardModal';

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
  tasks: {
    id: string;
    status: string;
  }[];
  columns: {
    id: string;
    name: string;
    order: number;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchBoards();
    }
  }, [status]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (tasks: Board['tasks']) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleCreateBoard = async (boardData: { name: string; description: string }) => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(boardData),
      });

      if (!response.ok) throw new Error('Failed to create board');
      

      await fetchBoards();
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">My Boards</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and organize your projects with Kanban boards
          </p>
        </div>
        <Button onClick={() => setShowNewBoardModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Board
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {}
        <button
          onClick={() => setShowNewBoardModal(true)}
          className="h-[200px] flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
        >
          <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Create New Board
          </p>
        </button>

        {}
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/dashboard/boards/${board.id}`}
            className="group"
          >
            <div className="h-[200px] p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all">
              <div className="h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                      {board.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {board.description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      
                    }}
                    className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto">
                  {}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${calculateProgress(board.tasks)}%` }}
                    />
                  </div>
                  
                  {}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        {board.tasks.length}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {board.members.length}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {calculateProgress(board.tasks)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {}
      <BoardModal
        isOpen={showNewBoardModal}
        onClose={() => setShowNewBoardModal(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
} 