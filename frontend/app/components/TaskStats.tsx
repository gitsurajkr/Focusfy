'use client';

interface Task {
  id: string;
  title: string;
  type: 'EVENT' | 'HABIT' | 'NORMAL';
  completed: boolean;
  created_at: string;
}

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  const eventTasks = tasks.filter(task => task.type === 'EVENT').length;
  const habitTasks = tasks.filter(task => task.type === 'HABIT').length;
  const normalTasks = tasks.filter(task => task.type === 'NORMAL').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="minecraft-card mb-6">
      <h3 className="text-sm mb-4 text-center"> QUEST STATISTICS</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Total Progress */}
        <div className="minecraft-container p-3 text-center task-normal">
          <div className="font-bold text-white">{completionRate}%</div>
          <div className="text-white">COMPLETE</div>
        </div>

        {/* Completed */}
        <div className="minecraft-container p-3 text-center task-habit">
          <div className="font-bold text-white">{completedTasks}</div>
          <div className="text-white">DONE </div>
        </div>

        {/* Pending */}
        <div className="minecraft-container p-3 text-center" style={{ background: 'var(--minecraft-orange)' }}>
          <div className="font-bold text-white">{pendingTasks}</div>
          <div className="text-white">PENDING </div>
        </div>

        {/* Total */}
        <div className="minecraft-container p-3 text-center" style={{ background: 'var(--minecraft-gray)' }}>
          <div className="font-bold text-white">{totalTasks}</div>
          <div className="text-white">TOTAL </div>
        </div>
      </div>

      {/* Quest Type Breakdown */}
      {totalTasks > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-gray-400">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="minecraft-container p-2 task-event">
                <div className="font-bold text-white">{eventTasks}</div>
                <div className="text-white">EVENTS</div>
              </div>
            </div>
            <div className="text-center">
              <div className="minecraft-container p-2 task-habit">
                <div className="font-bold text-white">{habitTasks}</div>
                <div className="text-white"> HABITS</div>
              </div>
            </div>
            <div className="text-center">
              <div className="minecraft-container p-2 task-normal">
                <div className="font-bold text-white">{normalTasks}</div>
                <div className="text-white"> NORMAL</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mt-4">
          <div className="minecraft-container p-1" style={{ background: 'var(--minecraft-gray)' }}>
            <div 
              className="h-4 transition-all duration-500 minecraft-container"
              style={{ 
                width: `${completionRate}%`,
                background: completionRate === 100 ? 'var(--minecraft-green)' : 'var(--minecraft-yellow)',
                minWidth: completionRate > 0 ? '20px' : '0px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
