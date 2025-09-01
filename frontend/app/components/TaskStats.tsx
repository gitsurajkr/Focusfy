'use client';

interface Task {
  id: string;
  title: string;
  type: 'EVENT' | 'HABIT' | 'NORMAL';
  completed: boolean;
  created_at: string;
  start_date?: string;
  due_date?: string;
  tags: string[];
  reminder_before?: number;
  reminder_every?: number;
  repeat_interval?: number;
  channel: string[];
}

interface TaskStatsProps {
  tasks: Task[];
  onFilterChange?: (filter: 'ALL' | 'EVENT' | 'HABIT' | 'NORMAL' | 'COMPLETED' | 'OVERDUE' | 'ACTIVE' | 'DUE_TODAY') => void;
  currentFilter?: string;
}

export default function TaskStats({ tasks, onFilterChange, currentFilter }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  const eventTasks = tasks.filter(task => task.type === 'EVENT').length;
  const habitTasks = tasks.filter(task => task.type === 'HABIT').length;
  const normalTasks = tasks.filter(task => task.type === 'NORMAL').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Time-based statistics
  const now = new Date();
  const overdueTasks = tasks.filter(task => 
    !task.completed && task.due_date && new Date(task.due_date) < now
  ).length;
  
  const dueTodayTasks = tasks.filter(task => {
    if (task.completed || !task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }).length;
  
  const activeTasks = tasks.filter(task => {
    if (task.completed) return false;
    const hasStarted = !task.start_date || new Date(task.start_date) <= now;
    const notEnded = !task.due_date || new Date(task.due_date) > now;
    return hasStarted && notEnded;
  }).length;

  return (
    <div className="pixel-border bg-[#181825]/80 p-6 mb-10 mt-6">
      <h3 className="text-sm mb-4 text-center gaming-accent pixel-font uppercase tracking-wider">QUEST STATISTICS</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Total Progress */}
        <button
          onClick={() => onFilterChange?.('ALL')}
          className={`pixel-border p-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all ${
            currentFilter === 'ALL' ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="font-bold text-white pixel-font text-lg">{completionRate}%</div>
          <div className="text-white pixel-font">ALL TASKS</div>
        </button>

        {/* Completed */}
        <button
          onClick={() => onFilterChange?.('COMPLETED')}
          className={`pixel-border p-3 text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-all ${
            currentFilter === 'COMPLETED' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          <div className="font-bold text-white pixel-font text-lg">{completedTasks}</div>
          <div className="text-white pixel-font">COMPLETED</div>
        </button>

        {/* Pending */}
        <div className="pixel-border p-3 text-center bg-gradient-to-r from-yellow-500 to-orange-500">
          <div className="font-bold text-white pixel-font text-lg">{pendingTasks}</div>
          <div className="text-white pixel-font">PENDING</div>
        </div>

        {/* Total */}
        <div className="pixel-border p-3 text-center bg-gradient-to-r from-gray-600 to-gray-700">
          <div className="font-bold text-white pixel-font text-lg">{totalTasks}</div>
          <div className="text-white pixel-font">TOTAL</div>
        </div>
      </div>

      {/* Quest Type Breakdown */}
      {totalTasks > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-cyan-400/30">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('EVENT')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 transition-all ${
                  currentFilter === 'EVENT' ? 'ring-2 ring-red-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{eventTasks}</div>
                <div className="text-white pixel-font">EVENTS</div>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('HABIT')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-all ${
                  currentFilter === 'HABIT' ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{habitTasks}</div>
                <div className="text-white pixel-font">HABITS</div>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('NORMAL')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all ${
                  currentFilter === 'NORMAL' ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{normalTasks}</div>
                <div className="text-white pixel-font">NORMAL</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time-Based Status */}
      {totalTasks > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-orange-400/30">
          <h4 className="text-xs mb-2 text-center pixel-font text-orange-400">TIME STATUS</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('OVERDUE')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all ${
                  currentFilter === 'OVERDUE' ? 'ring-2 ring-red-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{overdueTasks}</div>
                <div className="text-white pixel-font">OVERDUE</div>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('ACTIVE')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all ${
                  currentFilter === 'ACTIVE' ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{activeTasks}</div>
                <div className="text-white pixel-font">ACTIVE</div>
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => onFilterChange?.('DUE_TODAY')}
                className={`w-full pixel-border p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all ${
                  currentFilter === 'DUE_TODAY' ? 'ring-2 ring-cyan-400' : ''
                }`}
              >
                <div className="font-bold text-white pixel-font">{dueTodayTasks}</div>
                <div className="text-white pixel-font">DUE TODAY</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mt-4">
          <div className="pixel-border p-1 bg-[#232946]/50">
            <div 
              className="h-4 transition-all duration-500 pixel-border bg-gradient-to-r from-cyan-400 to-blue-500"
              style={{ 
                width: `${completionRate}%`,
                minWidth: completionRate > 0 ? '20px' : '0px',
                background: completionRate === 100 
                  ? 'linear-gradient(to right, #10b981, #059669)' 
                  : 'linear-gradient(to right, #06b6d4, #3b82f6)'
              }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-xs pixel-font gaming-accent">
              {completionRate === 100 ? 'LEGENDARY STATUS!' : 'Keep grinding!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
