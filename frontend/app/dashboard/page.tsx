"use client"

import { CheckCircle2, BookMarked, Zap, Calendar, Target } from 'lucide-react'
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useTasks } from "@/hooks/useTasks"
import { useNotes } from "@/hooks/useNotes"
import { useAuth } from "@/contexts/AuthContext"
import { useMemo } from "react"
import { taskApi } from "@/lib/api"
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, loading: tasksLoading, updateTask } = useTasks()
  const { notes, loading: notesLoading } = useNotes()

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await taskApi.updateTask(taskId, { completed: !completed })
      updateTask(taskId, { completed: !completed })
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const completedTasks = tasks?.filter(t => t.completed).length || 0
    const activeTasks = tasks?.filter(t => !t.completed).length || 0
    
    return [
      {
        label: "Tasks Completed",
        value: completedTasks.toString(),
        icon: CheckCircle2,
        color: "from-primary/20 to-primary/5",
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
      },
      {
        label: "Notes Created",
        value: (notes?.length || 0).toString(),
        icon: BookMarked,
        color: "from-secondary/20 to-secondary/5",
        iconBg: "bg-secondary/15",
        iconColor: "text-secondary",
      },
      {
        label: "Active Tasks",
        value: activeTasks.toString(),
        icon: Zap,
        color: "from-amber-500/20 to-amber-500/5",
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-500",
      },
    ]
  }, [tasks, notes])

  const taskBreakdown = useMemo(() => {
    const completed = tasks?.filter(t => t.completed).length || 0
    const active = tasks?.filter(t => !t.completed).length || 0
    const total = tasks?.length || 1 // Avoid division by zero
    
    return [
      { name: "Completed", value: completed, fill: "#6366F1", percentage: Math.round((completed / total) * 100) },
      { name: "Active", value: active, fill: "#10B981", percentage: Math.round((active / total) * 100) },
    ]
  }, [tasks])

  const recentTasks = useMemo(() => {
    return (tasks || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        due: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
        tags: task.tags.join(', ') || 'No tags',
      }))
  }, [tasks])

  const containerVariants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.04, delayChildren: 0.06 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28 } }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/10">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground tracking-tight">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-muted-foreground mt-2 md:mt-3 text-sm md:text-base lg:text-lg">Here&apos;s your productivity snapshot for today</p>
            </div>
          </div>
        </motion.div>

        {(tasksLoading || notesLoading) ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[1,2,3].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.03 }}
                  className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border/40 bg-card/50 p-4 md:p-5 lg:p-6"
                >
                  <div className="h-6 bg-muted/30 rounded w-1/3 mb-3 animate-pulse" />
                  <div className="h-10 bg-muted/20 rounded w-1/2 animate-pulse" />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-1">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="h-64 bg-card/50 border border-border/40 rounded-xl p-4 animate-pulse" />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 bg-card/50 border border-border/40 rounded-lg p-3 animate-pulse" />
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.02 }}
              className={`group relative overflow-hidden rounded-xl md:rounded-2xl border border-border/40 dark:border-border/60 backdrop-blur-sm hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-50 dark:opacity-30 group-hover:opacity-75 transition-opacity`}
              />
              <div className="relative p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.iconBg} p-2 md:p-3 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} className={`${stat.iconColor} md:w-6 md:h-6`} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
          
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <div className="group h-full rounded-xl md:rounded-2xl border border-border/40 dark:border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-sm hover:border-primary/40 dark:hover:border-primary/50 p-4 md:p-5 lg:p-6 transition-all hover:shadow-premium">
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/15 dark:bg-primary/10">
                  <Target size={18} className="text-primary" />
                </div>
                Task Overview
              </h3>

              <div className="space-y-6">
                <div className="flex justify-center relative">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={taskBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {taskBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                          padding: "12px 16px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700, fontSize: "14px" }}
                        formatter={(value, name, props) => [
                          `${value} tasks`,
                          props.payload.name
                        ]}
                        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-foreground">{tasks?.length || 0}</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Tasks</div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border/40 dark:border-border/20">
                  {taskBreakdown.map((item, i) => (
                    <div
                      key={i}
                      className="group/item cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full transition-transform group-hover/item:scale-125 shadow-sm"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted/40 dark:bg-muted/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover/item:shadow-lg"
                          style={{
                            backgroundColor: item.fill,
                            width: `${item.percentage}%`,
                            opacity: 0.9,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-border/40 dark:border-border/20 grid grid-cols-2 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/30 dark:bg-muted/10">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-sm font-bold text-foreground">{taskBreakdown[0]?.percentage || 0}%</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30 dark:bg-muted/10">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-sm font-bold text-foreground">{taskBreakdown[1]?.percentage || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Quick actions */}
            <div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/15 dark:bg-secondary/10">
                  <Zap size={16} className="text-secondary md:w-[18px] md:h-[18px]" />
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {[
                  { href: "/dashboard/tasks-logs", label: "Tasks Logs", desc: "View all" },
                  { href: "/dashboard/settings#bot", label: "Bot Config", desc: "Setup" },
                  { href: "/dashboard/settings#health", label: "Profile Settings", desc: "Settings" },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className="group relative h-16 md:h-20 rounded-lg md:rounded-xl border border-border/40 dark:border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-sm p-3 md:p-4 hover:border-secondary/40 dark:hover:border-secondary/50 cursor-pointer transition-all hover:shadow-md active:scale-95">
                      <p className="text-xs md:text-sm font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">{action.desc}</p>
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/15 dark:bg-amber-500/10">
                  <Calendar size={16} className="text-amber-500 md:w-[18px] md:h-[18px]" />
                </div>
                Recent Tasks
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {recentTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.02 }}
                    className="group flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl border border-border/40 dark:border-border/60 bg-card/50 dark:bg-card/30 backdrop-blur-sm hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                      className="w-4 h-4 md:w-5 md:h-5 rounded-md border-2 border-border accent-primary cursor-pointer transition-all shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-xs md:text-sm transition-all truncate ${
                          task.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.due}</p>
                    </div>
                    <span className="text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 shrink-0 hidden sm:inline">
                      {task.tags || 'No tags'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-4">
          <Link href="/dashboard/tasks">
            <button className="w-full group relative overflow-hidden rounded-lg md:rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-semibold py-3 md:py-4 transition-all hover:shadow-lg hover:shadow-primary/50 active:scale-95 duration-300 text-sm md:text-base">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <Zap size={16} className="md:w-[18px] md:h-[18px]" />+ New Task
              </span>
            </button>
          </Link>
          <Link href="/dashboard/notes">
            <button className="w-full group relative rounded-lg md:rounded-xl border border-border/40 dark:border-border/60 bg-card/50 dark:bg-card/30 text-foreground font-semibold py-3 md:py-4 backdrop-blur-sm hover:border-secondary/40 dark:hover:border-secondary/50 hover:shadow-md transition-all active:scale-95 duration-300 text-sm md:text-base">
              <span className="flex items-center justify-center gap-2">
                <BookMarked size={16} className="md:w-[18px] md:h-[18px]" />+ New Note
              </span>
            </button>
          </Link>
        </div>
          </>
        )}
      </motion.div>
      
    </div>
  )
}
