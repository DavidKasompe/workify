import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  recurring: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  progress: number;
  subtasks: Task[];
  attachments: Attachment[];
}

export interface TaskData {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  recurring: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;
  subtasks: { title: string; completed: boolean }[];
  attachments: File[];
  boardId: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  taskId: string;
  createdAt: string;
} 