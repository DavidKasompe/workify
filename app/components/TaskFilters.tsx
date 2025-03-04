import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from './Button';

interface TaskFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  status: string[];
  priority: string[];
  search: string;
}

export function TaskFilters({ onSearch, onFilterChange }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    search: '',
  });

  const handleFilterChange = (type: keyof TaskFilters, value: string) => {
    const newFilters = { ...filters };
    
    if (type === 'search') {
      newFilters.search = value;
    } else {
      const array = newFilters[type] as string[];
      const index = array.indexOf(value);
      
      if (index === -1) {
        array.push(value);
      } else {
        array.splice(index, 1);
      }
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      status: [],
      priority: [],
      search: '',
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => {
            handleFilterChange('search', e.target.value);
            onSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-0 focus:border-gray-300 text-sm"
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {(filters.status.length > 0 || filters.priority.length > 0) && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
              {filters.status.length + filters.priority.length}
            </span>
          )}
        </Button>

        {(filters.status.length > 0 || filters.priority.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                <label
                  key={status}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={filters.status.includes(status)}
                    onChange={() => handleFilterChange('status', status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                <label
                  key={priority}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    filters.priority.includes(priority)
                      ? priority === 'HIGH'
                        ? 'bg-red-100 text-red-600'
                        : priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={filters.priority.includes(priority)}
                    onChange={() => handleFilterChange('priority', priority)}
                  />
                  {priority}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 