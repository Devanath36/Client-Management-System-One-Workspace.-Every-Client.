import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalToDo, ToDoPriority, ToDoStatus, CalendarEvent } from '../../types';
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FolderKanban,
  Users,
  Shield,
  Briefcase,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare,
} from 'lucide-react';
import { DailyMotivationCard } from '../motivation/DailyMotivationCard';

interface MyWorkspaceViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const MyWorkspaceView: React.FC<MyWorkspaceViewProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    meetings,
    tasks,
    projects,
  } = useApp();

  // Live Real-Time Clock with seconds ticking every second
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calendar State
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarCursor, setCalendarCursor] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState<'personal' | 'project' | 'meeting'>('personal');
  const [newEventPriority, setNewEventPriority] = useState<ToDoPriority>('Medium');

  // To-Do State & Modals
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [todoSortBy, setTodoSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<PersonalToDo | null>(null);

  // Add / Edit To-Do Form State
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState<ToDoPriority>('Medium');
  const [todoDueDate, setTodoDueDate] = useState(new Date().toISOString().substring(0, 10));

  // Personalized Greeting calculation
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // User-scoped data
  const userTodos = todos.filter((t) => !t.userId || t.userId === currentUser?.id);
  const totalTodosCount = userTodos.length;
  const pendingTodosCount = userTodos.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedTodosCount = userTodos.filter((t) => t.status === 'Completed').length;
  const overdueTodosCount = userTodos.filter((t) => {
    if (t.status === 'Completed') return false;
    const today = new Date().toISOString().substring(0, 10);
    return t.dueDate < today;
  }).length;

  const todayStr = new Date().toISOString().substring(0, 10);

  // Today's meetings for user
  const todayMeetings = meetings.filter(
    (m) =>
      m.date === todayStr &&
      (m.attendeeIds.includes(currentUser?.id || '') ||
        m.organizerId === currentUser?.id ||
        currentUser?.role === 'admin')
  );


  // Filter & Sort To-Dos
  const filteredTodos = userTodos
    .filter((t) => {
      const isOverdue = t.status !== 'Completed' && t.dueDate < todayStr;
      if (todoFilter === 'pending') return t.status === 'Pending' || t.status === 'In Progress';
      if (todoFilter === 'completed') return t.status === 'Completed';
      if (todoFilter === 'overdue') return isOverdue;
      return true;
    })
    .sort((a, b) => {
      if (todoSortBy === 'priority') {
        const priorityRank = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

  // Calendar Helpers
  const currentMonthName = calendarCursor.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrev = () => {
    if (calendarView === 'week') {
      setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    } else if (calendarView === 'day') {
      const cur = new Date(selectedDateStr);
      cur.setDate(cur.getDate() - 1);
      const nextStr = cur.toISOString().substring(0, 10);
      setSelectedDateStr(nextStr);
      setCalendarCursor(cur);
    } else {
      setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (calendarView === 'week') {
      setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    } else if (calendarView === 'day') {
      const cur = new Date(selectedDateStr);
      cur.setDate(cur.getDate() + 1);
      const nextStr = cur.toISOString().substring(0, 10);
      setSelectedDateStr(nextStr);
      setCalendarCursor(cur);
    } else {
      setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handlePrevMonth = handlePrev;
  const handleNextMonth = handleNext;

  const handleTodayCalendar = () => {
    const now = new Date();
    setCalendarCursor(now);
    setSelectedDateStr(now.toISOString().substring(0, 10));
  };

  const getWeekDates = (baseDate: Date) => {
    const current = new Date(baseDate);
    const day = current.getDay();
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - day);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  // Gather all items scheduled for a specific date (Meetings, Project deadlines, Personal to-dos)
  const getItemsForDate = (dateStr: string) => {
    const dateMeetings = meetings.filter(
      (m) =>
        m.date === dateStr &&
        (m.attendeeIds.includes(currentUser?.id || '') ||
          m.organizerId === currentUser?.id ||
          currentUser?.role === 'admin')
    );
    const dateTodos = userTodos.filter((t) => t.dueDate === dateStr);
    const dateEvents = calendarEvents.filter(
      (e) => (!e.userId || e.userId === currentUser?.id) && e.date === dateStr
    );
    const dateProjectDeadlines = projects.filter((p) => p.deadline === dateStr);

    return {
      meetings: dateMeetings,
      todos: dateTodos,
      events: dateEvents,
      projectDeadlines: dateProjectDeadlines,
      totalCount: dateMeetings.length + dateTodos.length + dateEvents.length + dateProjectDeadlines.length,
    };
  };

  const selectedDateSchedule = getItemsForDate(selectedDateStr);

  // Handle To-Do Submit (Add or Edit)
  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim()) return;

    if (editingTodo) {
      updateTodo(editingTodo.id, {
        title: todoTitle.trim(),
        description: todoDescription.trim(),
        priority: todoPriority,
        dueDate: todoDueDate,
      });
      setEditingTodo(null);
    } else {
      addTodo({
        title: todoTitle.trim(),
        description: todoDescription.trim(),
        priority: todoPriority,
        status: 'Pending',
        dueDate: todoDueDate,
      });
    }

    setTodoTitle('');
    setTodoDescription('');
    setTodoPriority('Medium');
    setTodoDueDate(new Date().toISOString().substring(0, 10));
    setIsAddTodoModalOpen(false);
  };

  const handleOpenEditTodo = (todo: PersonalToDo) => {
    setEditingTodo(todo);
    setTodoTitle(todo.title);
    setTodoDescription(todo.description || '');
    setTodoPriority(todo.priority);
    setTodoDueDate(todo.dueDate);
    setIsAddTodoModalOpen(true);
  };

  // Handle Calendar Event Create
  const handleCreateCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addCalendarEvent({
      title: newEventTitle.trim(),
      date: selectedDateStr,
      time: newEventTime,
      type: newEventType,
      priority: newEventPriority,
    });

    setNewEventTitle('');
    setIsEventModalOpen(false);
  };

  const priorityColor = {
    Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    High: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER & GREETING WITH LIVE TIME AND MOTIVATIONAL QUOTE */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Welcome & Live Time Card */}
        <div className="lg:col-span-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Workspace</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-black/20 text-white text-xs font-mono font-medium">
                {currentUser?.role === 'admin'
                  ? 'Administrator'
                  : currentUser?.role === 'manager'
                  ? 'Operations Manager'
                  : currentUser?.role === 'team_lead'
                  ? 'Solutions Team Lead'
                  : 'Engineering Contributor'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {currentUser?.name}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Here is your synchronized personal productivity cockpit, meetings schedule, and
              scheduled milestone agenda.
            </p>
          </div>

          {/* Live Clock with Ticking Seconds */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-wider tabular-nums">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-blue-100">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('meetings')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Meetings</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upgraded Dynamic Daily Motivation Card */}
        <DailyMotivationCard />
      </div>

      {/* ========================================================= */}
      {/* 2. QUICK ACCESS METRIC COUNTERS                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending To-Dos */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>My Active To-Dos</span>
            <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {pendingTodosCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalTodosCount} Total</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono">
              {completedTodosCount} Completed
            </span>
            {overdueTodosCount > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-medium font-mono">
                · {overdueTodosCount} Overdue
              </span>
            )}
          </div>
        </div>

        {/* Meetings Today */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Meetings Today</span>
            <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {todayMeetings.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">Scheduled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {todayMeetings.length > 0 ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                Next: {todayMeetings[0].startTime} ({todayMeetings[0].platform})
              </span>
            ) : (
              <span>No further meetings today</span>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Active Projects</span>
            <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {projects.filter((p) => p.status === 'In Progress' || p.status === 'New' || p.status === 'Active').length}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {projects.length} Total</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-mono">
            Client initiatives in delivery
          </p>
        </div>

        {/* Deliverables / Assigned Tasks */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Client Tasks Oversight</span>
            <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {currentUser?.role === 'team_member'
                ? tasks.filter((t) => t.assigneeId === currentUser?.id).length
                : tasks.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">Tasks</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-mono">
            {currentUser?.role === 'team_member' ? 'Assigned to your queue' : 'All active projects'}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE CALENDAR & PERSONAL TO-DO LIST SPLIT       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Calendar Section (7 Cols on LG/XL) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-3.5">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Interactive Calendar
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Personal deadlines, meetings & project milestones
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
              {/* View Selector */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => setCalendarView('month')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'month'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('week')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'week'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('day')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'day'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Day
                </button>
              </div>

              {/* Month / Week Navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleTodayCalendar}
                  className="h-7 px-2 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Month Title & Add Event button */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
              {currentMonthName}
            </h4>
            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-900/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event / Deadline</span>
            </button>
          </div>

          {/* Calendar Grid Display */}
          <div className="space-y-1.5">
            {/* Day of Week Labels */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {[
                { full: 'Sun', short: 'Su' },
                { full: 'Mon', short: 'Mo' },
                { full: 'Tue', short: 'Tu' },
                { full: 'Wed', short: 'We' },
                { full: 'Thu', short: 'Th' },
                { full: 'Fri', short: 'Fr' },
                { full: 'Sat', short: 'Sa' },
              ].map((d) => (
                <div key={d.full} className="py-0.5 text-[10px] sm:text-xs font-bold text-slate-400 select-none">
                  <span className="hidden sm:inline">{d.full}</span>
                  <span className="sm:hidden">{d.short}</span>
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            {calendarView === 'month' && (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {Array.from({ length: getFirstDayOfMonth(calendarCursor.getFullYear(), calendarCursor.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-slate-50/40 dark:bg-slate-800/20 opacity-30" />
                ))}

                {Array.from({ length: getDaysInMonth(calendarCursor.getFullYear(), calendarCursor.getMonth()) }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStr = `${calendarCursor.getFullYear()}-${String(
                    calendarCursor.getMonth() + 1
                  ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = dayStr === todayStr;
                  const isSelected = dayStr === selectedDateStr;
                  const dayItems = getItemsForDate(dayStr);

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => setSelectedDateStr(dayStr)}
                      className={`h-8 sm:h-9 md:h-10 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer select-none ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-950/70 ring-1 sm:ring-2 ring-blue-500/30'
                          : isToday
                          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between leading-none">
                        <span
                          className={`text-[11px] sm:text-xs font-mono font-bold ${
                            isSelected
                              ? 'text-blue-600 dark:text-blue-400'
                              : isToday
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        )}
                      </div>

                      {/* Event Indicator Dots */}
                      {dayItems.totalCount > 0 ? (
                        <div className="flex items-center gap-0.5 overflow-hidden">
                          {dayItems.meetings.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                              title={`${dayItems.meetings.length} Meeting(s)`}
                            />
                          )}
                          {dayItems.todos.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                              title={`${dayItems.todos.length} To-Do(s)`}
                            />
                          )}
                          {dayItems.projectDeadlines.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
                              title={`${dayItems.projectDeadlines.length} Project Milestone(s)`}
                            />
                          )}
                          {dayItems.events.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                              title={`${dayItems.events.length} Event(s)`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Week View Strip */}
            {calendarView === 'week' && (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {getWeekDates(calendarCursor).map((date) => {
                  const dayStr = date.toISOString().substring(0, 10);
                  const isToday = dayStr === todayStr;
                  const isSelected = dayStr === selectedDateStr;
                  const dayItems = getItemsForDate(dayStr);
                  const dayNum = date.getDate();

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => setSelectedDateStr(dayStr)}
                      className={`h-12 sm:h-14 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all text-center flex flex-col justify-between cursor-pointer select-none ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-950/70 ring-1 sm:ring-2 ring-blue-500/30'
                          : isToday
                          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold ${
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400'
                            : isToday
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayItems.totalCount > 0 ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {dayItems.totalCount > 1 && (
                            <span className="text-[9px] font-mono text-slate-400">+{dayItems.totalCount - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-300 dark:text-slate-600">·</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Day View Summary Card */}
            {calendarView === 'day' && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedDateSchedule.totalCount} active items scheduled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTodayCalendar}
                  className="px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Go to Today
                </button>
              </div>
            )}
          </div>

          {/* Selected Date Schedule Inspection Panel */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>
                  Schedule for <span className="font-mono text-blue-600 dark:text-blue-400">{selectedDateStr}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {selectedDateSchedule.totalCount} item{selectedDateSchedule.totalCount === 1 ? '' : 's'}
              </span>
            </div>

            {selectedDateSchedule.totalCount === 0 ? (
              <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 text-center text-xs text-slate-500 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-2">
                <span>No meetings or deadlines scheduled for this date.</span>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {/* Meetings */}
                {selectedDateSchedule.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                        <Video className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                          {m.startTime} – {m.endTime} · {m.platform}
                        </p>
                      </div>
                    </div>
                    {m.meetingUrl && (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}

                {/* To-Dos on selected date */}
                {selectedDateSchedule.todos.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTodoComplete(t.id)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                          t.status === 'Completed'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                      >
                        {t.status === 'Completed' && <Check className="w-2.5 h-2.5" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            t.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          } truncate`}
                        >
                          {t.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Due: {t.dueDate}
                        </p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {t.status}
                    </span>
                  </div>
                ))}

                {/* Project Deadlines on selected date */}
                {selectedDateSchedule.projectDeadlines.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-rose-600 text-white shrink-0">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Milestone: {p.title}
                        </p>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                          Client: {p.clientName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-600 font-mono shrink-0">Due Today</span>
                  </div>
                ))}

                {/* Custom Calendar Events */}
                {selectedDateSchedule.events.map((e) => (
                  <div
                    key={e.id}
                    className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-amber-600 text-white shrink-0">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {e.title}
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                          Time: {e.time} · {e.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCalendarEvent(e.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove Event"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PERSONAL TO-DO LIST (5 Cols on LG/XL)                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal To-Do List
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingTodosCount} pending · {completedTodosCount} done
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingTodo(null);
                setTodoTitle('');
                setTodoDescription('');
                setTodoPriority('Medium');
                setTodoDueDate(todayStr);
                setIsAddTodoModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Filter Pills & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setTodoFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  todoFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({totalTodosCount})
              </button>
              <button
                onClick={() => setTodoFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  todoFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pending ({pendingTodosCount})
              </button>
              <button
                onClick={() => setTodoFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  todoFilter === 'completed'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Done ({completedTodosCount})
              </button>
              {overdueTodosCount > 0 && (
                <button
                  onClick={() => setTodoFilter('overdue')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    todoFilter === 'overdue'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 font-bold shadow-xs'
                      : 'text-rose-500'
                  }`}
                >
                  Overdue ({overdueTodosCount})
                </button>
              )}
            </div>

            <span className="text-[11px] font-medium text-slate-400">Sorted by Due Date</span>
          </div>

          {/* List of Tasks */}
          <div className="space-y-2 max-h-[360px] sm:max-h-[380px] overflow-y-auto pr-1">
            {filteredTodos.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No tasks found in this view</p>
                <button
                  onClick={() => setIsAddTodoModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Create a personal to-do
                </button>
              </div>
            ) : (
              filteredTodos.map((todo) => {
                const isOverdue = todo.status !== 'Completed' && todo.dueDate < todayStr;
                return (
                  <div
                    key={todo.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 group ${
                      todo.status === 'Completed'
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : isOverdue
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodoComplete(todo.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                        todo.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-900'
                      }`}
                      aria-label={todo.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {todo.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs sm:text-sm font-semibold leading-snug ${
                            todo.status === 'Completed'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {todo.title}
                        </p>
                      </div>

                      {todo.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          Due: {todo.dueDate} {isOverdue && '(Overdue)'}
                        </span>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditTodo(todo)}
                            className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT TO-DO                                   */}
      {/* ========================================================= */}
      {isAddTodoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingTodo ? 'Edit To-Do Task' : 'Add New Personal Task'}
            </h3>

            <form onSubmit={handleSaveTodo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="e.g. Complete responsive QA pass on dashboard"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={todoDescription}
                  onChange={(e) => setTodoDescription(e.target.value)}
                  placeholder="Key deliverables or notes..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTodoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingTodo ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CALENDAR EVENT / DEADLINE                      */}
      {/* ========================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Calendar Event / Deadline
            </h3>
            <p className="text-xs text-slate-500">
              Scheduled for date: <span className="font-mono font-bold text-blue-600">{selectedDateStr}</span>
            </p>

            <form onSubmit={handleCreateCalendarEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Sprint Retrospective Presentation"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="personal">Personal Deadline</option>
                    <option value="meeting">Team Meeting</option>
                    <option value="project">Project Target</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
