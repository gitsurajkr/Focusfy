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
    <div className="pixel-border bg-[#181825]/80 p-6 mb-10 mt-6">
      <h3 className="text-sm mb-4 text-center gaming-accent pixel-font uppercase tracking-wider">QUEST STATISTICS</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Total Progress */}
        <div className="pixel-border p-3 text-center bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="font-bold text-white pixel-font text-lg">{completionRate}%</div>
          <div className="text-white pixel-font">COMPLETE</div>
        </div>

        {/* Completed */}
        <div className="pixel-border p-3 text-center bg-gradient-to-r from-green-500 to-emerald-500">
          <div className="font-bold text-white pixel-font text-lg">{completedTasks}</div>
          <div className="text-white pixel-font">DONE</div>
        </div>

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
              <div className="pixel-border p-2 bg-gradient-to-r from-red-500 to-pink-500">
                <div className="font-bold text-white pixel-font">{eventTasks}</div>
                <div className="text-white pixel-font">EVENTS</div>
              </div>
            </div>
            <div className="text-center">
              <div className="pixel-border p-2 bg-gradient-to-r from-green-500 to-emerald-500">
                <div className="font-bold text-white pixel-font">{habitTasks}</div>
                <div className="text-white pixel-font">HABITS</div>
              </div>
            </div>
            <div className="text-center">
              <div className="pixel-border p-2 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="font-bold text-white pixel-font">{normalTasks}</div>
                <div className="text-white pixel-font">NORMAL</div>
              </div>
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
              {completionRate === 100 ? 'LEGENDARY STATUS!' : 'Keep grinding, gamer!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
