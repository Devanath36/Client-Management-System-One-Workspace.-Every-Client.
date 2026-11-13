import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalToDo, ToDoPriority, CalendarEvent } from '../../types';
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
  Briefcase,
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

  const priorityColor: Record<ToDoPriority, string> = {
    Urgent: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/30',
    High: 'bg-[#E50914]/10 text-[#E50914] border-[#E50914]/25',
    Medium: 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30',
    Low: 'bg-[#F0F0F0] dark:bg-[#101010] text-[#555555] dark:text-[#A3A3A3] border-[#E0E0E0] dark:border-[#333333]',
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER & GREETING WITH LIVE TIME AND MOTIVATIONAL QUOTE */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Welcome & Live Time Card */}
        <div className="lg:col-span-7 bg-gradient-to-r from-[#E50914] via-[#c40812] to-[#FF7900] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Workspace</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-black/30 text-white text-xs font-mono font-medium">
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
            <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed">
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
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-wider tabular-nums text-white">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-[#FFC928]">
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
                  className="px-3.5 py-1.5 rounded-xl bg-[#101010] text-[#FFC928] hover:bg-[#1f1f1f] hover:text-white border border-[#333333] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Meetings</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Daily Motivation Card */}
        <DailyMotivationCard />
      </div>

      {/* ========================================================= */}
      {/* 2. QUICK ACCESS METRIC COUNTERS                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending To-Dos */}
        <div className="p-5 bg-white dark:bg-[#171717] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
            <span>My Active To-Dos</span>
            <ListTodo className="w-4 h-4 text-[#E50914]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#101010] dark:text-white">
              {pendingTodosCount}
            </span>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">/ {totalTodosCount} Total</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-[#555555] dark:text-[#A3A3A3] font-medium font-mono">
              {completedTodosCount} Completed
            </span>
            {overdueTodosCount > 0 && (
              <span className="text-[#E50914] font-bold font-mono">
                · {overdueTodosCount} Overdue
              </span>
            )}
          </div>
        </div>

        {/* Meetings Today */}
        <div className="p-5 bg-white dark:bg-[#171717] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
            <span>Meetings Today</span>
            <Video className="w-4 h-4 text-[#FF7900]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#101010] dark:text-white">
              {todayMeetings.length}
            </span>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">Scheduled</span>
          </div>
          <div className="mt-2 text-[11px] text-[#555555] dark:text-[#A3A3A3]">
            {todayMeetings.length > 0 ? (
              <span className="text-[#FF7900] font-semibold">
                Next: {todayMeetings[0].startTime} ({todayMeetings[0].platform})
              </span>
            ) : (
              <span>No further meetings today</span>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="p-5 bg-white dark:bg-[#171717] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
            <span>Active Projects</span>
            <Briefcase className="w-4 h-4 text-[#FF7900] dark:text-[#FFC928]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#101010] dark:text-white">
              {projects.filter((p) => p.status === 'In Progress' || p.status === 'New' || p.status === 'Active').length}
            </span>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">/ {projects.length} Total</span>
          </div>
          <p className="mt-2 text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono">
            Client initiatives in delivery
          </p>
        </div>

        {/* Deliverables / Assigned Tasks */}
        <div className="p-5 bg-white dark:bg-[#171717] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
            <span>Client Tasks Oversight</span>
            <CheckSquare className="w-4 h-4 text-[#E50914]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#101010] dark:text-white">
              {currentUser?.role === 'team_member'
                ? tasks.filter((t) => t.assigneeId === currentUser?.id).length
                : tasks.length}
            </span>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">Tasks</span>
          </div>
          <p className="mt-2 text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono">
            {currentUser?.role === 'team_member' ? 'Assigned to your queue' : 'All active projects'}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE CALENDAR & PERSONAL TO-DO LIST SPLIT       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Calendar Section (7 Cols on LG/XL) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#171717] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3 sm:space-y-3.5 transition-colors">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E0E0E0] dark:border-[#333333]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101010] dark:text-white leading-tight">
                  Interactive Calendar
                </h3>
                <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                  Personal deadlines, meetings & project milestones
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
              {/* View Selector */}
              <div className="inline-flex rounded-xl bg-[#F0F0F0] dark:bg-[#101010] p-0.5 text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setCalendarView('month')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'month'
                      ? 'bg-[#E50914] text-white shadow-xs font-bold'
                      : 'hover:text-[#101010] dark:hover:text-white'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('week')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'week'
                      ? 'bg-[#E50914] text-white shadow-xs font-bold'
                      : 'hover:text-[#101010] dark:hover:text-white'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('day')}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    calendarView === 'day'
                      ? 'bg-[#E50914] text-white shadow-xs font-bold'
                      : 'hover:text-[#101010] dark:hover:text-white'
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
                  className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleTodayCalendar}
                  className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#101010] dark:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Month Title & Add Event button */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-[#101010] dark:text-white font-mono">
              {currentMonthName}
            </h4>
            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="text-[11px] sm:text-xs font-semibold text-white bg-[#FF7900] hover:bg-[#e06a00] px-3 py-1 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
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
                <div key={d.full} className="py-0.5 text-[10px] sm:text-xs font-bold text-[#888888] select-none">
                  <span className="hidden sm:inline">{d.full}</span>
                  <span className="sm:hidden">{d.short}</span>
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            {calendarView === 'month' && (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {Array.from({ length: getFirstDayOfMonth(calendarCursor.getFullYear(), calendarCursor.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl bg-[#F0F0F0]/50 dark:bg-[#141414]/50 opacity-40" />
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
                          ? 'border-[#FFC928] bg-[#FFC928]/15 ring-2 ring-[#FFC928]/50 shadow-xs'
                          : isToday
                          ? 'border-[#E50914] bg-[#E50914]/10'
                          : 'border-[#EAEAEA] dark:border-[#262626] hover:border-[#CCCCCC] dark:hover:border-[#555555] bg-[#FDFDFD] dark:bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center justify-between leading-none">
                        <span
                          className={`text-[11px] sm:text-xs font-mono font-bold ${
                            isSelected
                              ? 'text-[#FF7900] dark:text-[#FFC928]'
                              : isToday
                              ? 'text-[#E50914]'
                              : 'text-[#101010] dark:text-white'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                        )}
                      </div>

                      {/* Event Indicator Dots */}
                      {dayItems.totalCount > 0 ? (
                        <div className="flex items-center gap-0.5 overflow-hidden">
                          {dayItems.meetings.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#FF7900] shrink-0"
                              title={`${dayItems.meetings.length} Meeting(s)`}
                            />
                          )}
                          {dayItems.todos.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#888888] dark:bg-[#FFFFFF] shrink-0"
                              title={`${dayItems.todos.length} To-Do(s)`}
                            />
                          )}
                          {dayItems.projectDeadlines.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0"
                              title={`${dayItems.projectDeadlines.length} Project Milestone(s)`}
                            />
                          )}
                          {dayItems.events.length > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#FFC928] shrink-0"
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
                          ? 'border-[#FFC928] bg-[#FFC928]/15 ring-2 ring-[#FFC928]/50 shadow-xs'
                          : isToday
                          ? 'border-[#E50914] bg-[#E50914]/10'
                          : 'border-[#EAEAEA] dark:border-[#262626] hover:border-[#CCCCCC] dark:hover:border-[#555555] bg-[#FDFDFD] dark:bg-[#141414]'
                      }`}
                    >
                      <span className="text-[10px] text-[#888888] uppercase font-semibold">
                        {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-mono font-bold ${
                          isSelected
                            ? 'text-[#FF7900] dark:text-[#FFC928]'
                            : isToday
                            ? 'text-[#E50914]'
                            : 'text-[#101010] dark:text-white'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayItems.totalCount > 0 ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
                          {dayItems.totalCount > 1 && (
                            <span className="text-[9px] font-mono text-[#888888]">+{dayItems.totalCount - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] text-[#CCCCCC] dark:text-[#555555]">·</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Day View Summary Card */}
            {calendarView === 'day' && (
              <div className="p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#101010] dark:text-white">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                    {selectedDateSchedule.totalCount} active items scheduled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTodayCalendar}
                  className="px-2 py-1 text-[11px] font-semibold text-[#E50914] hover:underline bg-white dark:bg-[#171717] rounded-lg border border-[#E0E0E0] dark:border-[#333333] cursor-pointer"
                >
                  Go to Today
                </button>
              </div>
            )}
          </div>

          {/* Selected Date Schedule Inspection Panel */}
          <div className="pt-2.5 border-t border-[#E0E0E0] dark:border-[#333333] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#101010] dark:text-white">
                <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>
                  Schedule for <span className="font-mono text-[#E50914] dark:text-[#FFC928]">{selectedDateStr}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F0F0F0] dark:bg-[#101010] text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333]">
                {selectedDateSchedule.totalCount} item{selectedDateSchedule.totalCount === 1 ? '' : 's'}
              </span>
            </div>

            {selectedDateSchedule.totalCount === 0 ? (
              <div className="p-3 rounded-xl bg-[#F9F9F9] dark:bg-[#141414] text-center text-xs text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-center gap-2">
                <span>No meetings or deadlines scheduled for this date.</span>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="text-[#E50914] dark:text-[#FFC928] font-bold hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {/* Meetings */}
                {selectedDateSchedule.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[#FF7900]/10 border border-[#FF7900]/30 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-[#FF7900] text-white shrink-0">
                        <Video className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#101010] dark:text-white truncate">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-[#FF7900] font-mono font-medium">
                          {m.startTime} – {m.endTime} · {m.platform}
                        </p>
                      </div>
                    </div>
                    {m.meetingUrl && (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#FF7900] hover:bg-[#e06a00] text-white text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
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
                    className="p-2.5 rounded-xl bg-[#F9F9F9] dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTodoComplete(t.id)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                          t.status === 'Completed'
                            ? 'bg-[#101010] dark:bg-white border-[#101010] dark:border-white text-white dark:text-[#101010]'
                            : 'border-[#CCCCCC] dark:border-[#555555] hover:border-[#E50914]'
                        }`}
                      >
                        {t.status === 'Completed' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            t.status === 'Completed'
                              ? 'line-through text-[#888888]'
                              : 'text-[#101010] dark:text-white'
                          } truncate`}
                        >
                          {t.title}
                        </p>
                        <p className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                          Due: {t.dueDate}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono border border-[#E0E0E0] dark:border-[#333333] text-[#555555] dark:text-[#A3A3A3]">
                      {t.status}
                    </span>
                  </div>
                ))}

                {/* Project Deadlines on selected date */}
                {selectedDateSchedule.projectDeadlines.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-[#E50914] text-white shrink-0">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#101010] dark:text-white truncate">
                          Milestone: {p.title}
                        </p>
                        <p className="text-[10px] text-[#E50914] font-mono font-medium">
                          Client: {p.clientName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#E50914] font-mono shrink-0">Due Today</span>
                  </div>
                ))}

                {/* Custom Calendar Events */}
                {selectedDateSchedule.events.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl bg-[#FFC928]/10 border border-[#FFC928]/30 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#FF7900] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#101010] dark:text-white truncate">
                          {e.title}
                        </p>
                        <p className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                          {e.time} · {e.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCalendarEvent(e.id)}
                      className="p-1 text-[#888888] hover:text-[#E50914] cursor-pointer"
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
        <div className="lg:col-span-5 bg-white dark:bg-[#171717] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3.5 sm:space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] dark:border-[#333333]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101010] dark:text-white">
                  Personal To-Do List
                </h3>
                <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">
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
              className="px-3.5 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Filter Pills & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#F0F0F0] dark:bg-[#101010] p-1 rounded-xl border border-[#E0E0E0] dark:border-[#333333]">
              <button
                onClick={() => setTodoFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  todoFilter === 'all'
                    ? 'bg-[#E50914] text-white font-bold shadow-xs'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                All ({totalTodosCount})
              </button>
              <button
                onClick={() => setTodoFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  todoFilter === 'pending'
                    ? 'bg-[#E50914] text-white font-bold shadow-xs'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                Pending ({pendingTodosCount})
              </button>
              <button
                onClick={() => setTodoFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  todoFilter === 'completed'
                    ? 'bg-[#E50914] text-white font-bold shadow-xs'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                Done ({completedTodosCount})
              </button>
              {overdueTodosCount > 0 && (
                <button
                  onClick={() => setTodoFilter('overdue')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    todoFilter === 'overdue'
                      ? 'bg-[#E50914] text-white font-bold shadow-xs'
                      : 'text-[#E50914] font-bold'
                  }`}
                >
                  Overdue ({overdueTodosCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#555555] dark:text-[#A3A3A3]">
              <span>Sort:</span>
              <button
                onClick={() => setTodoSortBy(todoSortBy === 'dueDate' ? 'priority' : 'dueDate')}
                className="font-bold text-[#E50914] dark:text-[#FFC928] hover:underline cursor-pointer"
              >
                {todoSortBy === 'dueDate' ? 'Due Date' : 'Priority'}
              </button>
            </div>
          </div>

          {/* List of To-Dos */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredTodos.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#CCCCCC] dark:text-[#333333] mx-auto" />
                <p className="text-xs text-[#555555] dark:text-[#A3A3A3] font-medium">No tasks found in this view</p>
                <button
                  onClick={() => setIsAddTodoModalOpen(true)}
                  className="text-xs font-bold text-[#E50914] dark:text-[#FFC928] hover:underline cursor-pointer"
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
                        ? 'bg-[#F9F9F9] dark:bg-[#141414] border-[#E0E0E0] dark:border-[#262626] opacity-75'
                        : isOverdue
                        ? 'bg-[#E50914]/5 dark:bg-[#E50914]/10 border-[#E50914]/40'
                        : 'bg-white dark:bg-[#141414] border-[#E0E0E0] dark:border-[#333333] hover:border-[#E50914]'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodoComplete(todo.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                        todo.status === 'Completed'
                          ? 'bg-[#101010] dark:bg-white border-[#101010] dark:border-white text-white dark:text-[#101010]'
                          : 'border-[#CCCCCC] dark:border-[#555555] hover:border-[#E50914] bg-white dark:bg-[#101010]'
                      }`}
                      aria-label={todo.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {todo.status === 'Completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs sm:text-sm font-semibold leading-snug ${
                            todo.status === 'Completed'
                              ? 'line-through text-[#888888]'
                              : 'text-[#101010] dark:text-white'
                          }`}
                        >
                          {todo.title}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                            priorityColor[todo.priority]
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </div>

                      {todo.description && (
                        <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed line-clamp-2">
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                        <span className={isOverdue ? 'text-[#E50914] font-bold' : ''}>
                          Due: {todo.dueDate} {isOverdue && '(Overdue)'}
                        </span>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditTodo(todo)}
                            className="p-1 text-[#888888] hover:text-[#E50914] cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-1 text-[#888888] hover:text-[#E50914] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-2xl space-y-4 text-[#101010] dark:text-white">
            <h3 className="text-base font-bold text-[#101010] dark:text-white">
              {editingTodo ? 'Edit To-Do Task' : 'Add New Personal Task'}
            </h3>

            <form onSubmit={handleSaveTodo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="e.g. Complete responsive QA pass on dashboard"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={todoDescription}
                  onChange={(e) => setTodoDescription(e.target.value)}
                  placeholder="Key deliverables or notes..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Priority
                  </label>
                  <select
                    value={todoPriority}
                    onChange={(e) => setTodoPriority(e.target.value as ToDoPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsAddTodoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-bold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-2xl space-y-4 text-[#101010] dark:text-white">
            <h3 className="text-base font-bold text-[#101010] dark:text-white">
              Add Calendar Event / Deadline
            </h3>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">
              Scheduled for date: <span className="font-mono font-bold text-[#E50914] dark:text-[#FFC928]">{selectedDateStr}</span>
            </p>

            <form onSubmit={handleCreateCalendarEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Sprint Retrospective Presentation"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] text-[#101010] dark:text-white"
                  >
                    <option value="personal">Personal Deadline</option>
                    <option value="meeting">Team Meeting</option>
                    <option value="project">Project Target</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-bold shadow-xs cursor-pointer"
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
