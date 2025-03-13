import { useState, useRef, useEffect } from "react";
import { X, Plus, ChevronDown, Paperclip, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { TaskData } from "@/app/types";
import { ModalPortal } from "./ModalPortal";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => void;
  boardId?: string;
  initialDate?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  boardId = "",
  initialDate,
}: TaskModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: initialDate ? new Date(initialDate) : null,
    recurring: null,
    subtasks: [],
    attachments: [],
    boardId,
  });
  const [newSubtask, setNewSubtask] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTaskData((prev) => ({
        ...prev,
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: initialDate ? new Date(initialDate) : null,
        recurring: null,
        subtasks: [],
        attachments: [],
        boardId,
      }));
      setNewSubtask("");
      setUploadError(null);
    }
  }, [isOpen, initialDate, boardId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      
      if (!taskData.title) {
        alert("Task title is required");
        return;
      }

      
      if (!taskData.boardId && boardId) {
        taskData.boardId = boardId;
      }

      
      const apiSubmitData = {
        ...taskData,
        dueDate: taskData.dueDate,
        boardId: taskData.boardId || boardId,
        status: "TODO",
      };

      console.log("Submitting task data:", apiSubmitData);

      
      onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      setUploadError("Failed to create task. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTaskData({
      ...taskData,
      attachments: [...taskData.attachments, ...files],
    });
    setUploadError(null);
  };

  const removeFile = (index: number) => {
    setTaskData({
      ...taskData,
      attachments: taskData.attachments.filter((_, i) => i !== index),
    });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setTaskData({
        ...taskData,
        subtasks: [
          ...taskData.subtasks,
          { title: newSubtask, completed: false },
        ],
      });
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setTaskData({
      ...taskData,
      subtasks: taskData.subtasks.filter((_, i) => i !== index),
    });
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="Enter task title"
              required
            />
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  value={taskData.priority}
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      priority: e.target.value as TaskData["priority"],
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={
                  taskData.dueDate
                    ? new Date(taskData.dueDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    dueDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recurring
            </label>
            <div className="relative">
              <select
                value={taskData.recurring || ""}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    recurring: e.target.value as TaskData["recurring"],
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="">No recurring</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtasks
            </label>
            <div className="space-y-3">
              {taskData.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => {
                      const newSubtasks = [...taskData.subtasks];
                      newSubtasks[index].title = e.target.value;
                      setTaskData({ ...taskData, subtasks: newSubtasks });
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSubtask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments
            </label>
            <div className="space-y-3">
              {taskData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Add Attachment
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Button>
              {uploadError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
