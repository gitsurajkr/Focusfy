"use client"

import { Calendar, User, Tag, Loader2 } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useAuth } from "@/contexts/AuthContext"

export default function MissionLogsPage() {
  const { tasks, loading } = useTasks()
  const { user } = useAuth()

  // Group tasks by status for mission logs display
  const missions = (tasks || []).map(task => ({
    id: task.id,
    mission: task.title,
    date: new Date(task.created_at).toISOString().split('T')[0],
    user: user?.name || "You",
    status: task.completed ? 'Completed' : 'In Progress',
    tags: task.tags.length > 0 ? task.tags : ['No tags'],
  }))

  const getStatusColor = (status: string) => {
    if (status === "Completed") return "bg-secondary/10 text-secondary"
    return "bg-primary/10 text-primary"
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
          <p className="text-muted-foreground">Loading mission logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mission Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your major projects and milestones</p>
      </div>

      {/* Timeline */}
      <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
        {missions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm md:text-base">No mission logs yet. Complete some tasks to see them here!</p>
          </div>
        ) : (
          missions.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Timeline connector */}
            {index < missions.length - 1 && <div className="absolute left-4 md:left-6 top-10 md:top-12 w-0.5 h-6 md:h-8 bg-border"></div>}

            {/* Log item */}
            <div className="flex gap-3 md:gap-4">
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center pt-1">
                <div
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${log.status === "Completed" ? "bg-secondary" : "bg-primary"} ring-4 ring-card shrink-0`}
                ></div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-3 md:pb-4 min-w-0">
                <div className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-foreground wrap-break-word flex-1">{log.mission}</h3>
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-xs md:text-sm font-medium ${getStatusColor(log.status)} shrink-0`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <Calendar size={14} className="md:w-4 md:h-4 shrink-0" />
                      {log.date}
                    </span>
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <User size={14} className="md:w-4 md:h-4 shrink-0" />
                      {log.user}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {log.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 bg-muted text-muted-foreground text-xs rounded-lg"
                      >
                        <Tag size={10} className="md:w-3 md:h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}
