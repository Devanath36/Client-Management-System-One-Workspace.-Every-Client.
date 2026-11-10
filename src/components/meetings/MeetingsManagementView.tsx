import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Meeting,
  MeetingPlatform,
  MeetingStatus,
  MeetingPostponedInfo,
} from '../../types';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const MeetingsManagementView: React.FC = () => {
  const {
    currentUser,
    users,
    projects,
    meetings,
    scheduleMeeting,
    updateMeeting,
    postponeMeeting,
    cancelMeeting,
    showToast,
  } = useApp();

  // Filter tabs: 'upcoming' | 'today' | 'completed' | 'postponed' | 'all'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'completed' | 'postponed' | 'all'>('upcoming');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule Meeting Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [platform, setPlatform] = useState<MeetingPlatform>('Google Meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [agendaItems, setAgendaItems] = useState<string[]>(['']);

  // Postpone Meeting Modal
  const [postponingMeeting, setPostponingMeeting] = useState<Meeting | null>(null);
  const [newPostponeDate, setNewPostponeDate] = useState('');
  const [newPostponeStartTime, setNewPostponeStartTime] = useState('');
  const [newPostponeEndTime, setNewPostponeEndTime] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

  const todayStr = new Date().toISOString().substring(0, 10);

  // Filter logic
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.attendeeNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = platformFilter === 'all' || m.platform === platformFilter;

    let matchesTab = true;
    if (activeTab === 'today') {
      matchesTab = m.date === todayStr && m.status !== 'Cancelled';
    } else if (activeTab === 'upcoming') {
      matchesTab = (m.date >= todayStr && (m.status === 'Scheduled' || m.status === 'In Progress'));
    } else if (activeTab === 'completed') {
      matchesTab = m.status === 'Completed';
    } else if (activeTab === 'postponed') {
      matchesTab = m.status === 'Postponed';
    }

    return matchesSearch && matchesPlatform && matchesTab;
  });

  // Schedule Form Handler
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Auto-generate URL if left blank
    let generatedUrl = meetingUrl.trim();
    if (!generatedUrl) {
      if (platform === 'Google Meet') {
        generatedUrl = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      } else if (platform === 'Zoom') {
        generatedUrl = `https://zoom.us/j/${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      } else if (platform === 'Microsoft Teams') {
        generatedUrl = `https://teams.microsoft.com/l/meetup-join/cms_meeting_${Date.now()}`;
      }
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const attendeeNames = users
      .filter((u) => selectedAttendeeIds.includes(u.id))
      .map((u) => u.name);

    scheduleMeeting({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      platform,
      meetingUrl: generatedUrl,
      attendeeIds: selectedAttendeeIds,
      attendeeNames,
      projectId: selectedProj?.id,
      projectName: selectedProj?.title,
      agenda: agendaItems.filter((item) => item.trim() !== ''),
      status: 'Scheduled',
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDate(todayStr);
    setStartTime('10:00');
    setEndTime('10:45');
    setMeetingUrl('');
    setSelectedAttendeeIds([]);
    setAgendaItems(['']);
    setIsScheduleModalOpen(false);
  };

  // Postpone Form Handler
  const handlePostponeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponingMeeting || !newPostponeDate || !postponeReason.trim()) return;

    postponeMeeting(
      postponingMeeting.id,
      newPostponeDate,
      newPostponeStartTime || postponingMeeting.startTime,
      newPostponeEndTime || postponingMeeting.endTime,
      postponeReason.trim()
    );

    setPostponingMeeting(null);
    setNewPostponeDate('');
    setNewPostponeStartTime('');
    setNewPostponeEndTime('');
    setPostponeReason('');
  };

  const handleOpenPostpone = (meeting: Meeting) => {
    setPostponingMeeting(meeting);
    setNewPostponeDate(meeting.date);
    setNewPostponeStartTime(meeting.startTime);
    setNewPostponeEndTime(meeting.endTime);
    setPostponeReason('');
  };

  const platformBadge = {
    'Google Meet': 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Microsoft Teams': 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    Zoom: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'In-Person': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const statusBadge = {
    Scheduled: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'In Progress': 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 animate-pulse',
    Completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    Postponed: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold',
    Cancelled: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Meeting Management System
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Coordinate virtual calls, 1-click video links, rescheduling audits, and attendee
            dispatch.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAttendeeIds(users.slice(0, 3).map((u) => u.id));
            setIsScheduleModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Today's Meetings
          </button>
          <button
            onClick={() => setActiveTab('postponed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'postponed'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            Postponed
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({meetings.length})
          </button>
        </div>

        {/* Search & Platform Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="Google Meet">Google Meet</option>
            <option value="Microsoft Teams">Microsoft Teams</option>
            <option value="Zoom">Zoom</option>
            <option value="In-Person">In-Person</option>
          </select>
        </div>
      </div>

      {/* Meeting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Video className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No meetings found for this filter
            </p>
            <p className="text-xs text-slate-400">
              Schedule a new meeting or choose another filter tab.
            </p>
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const isToday = m.date === todayStr;
            const isPostponed = m.status === 'Postponed';

            return (
              <div
                key={m.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                  isPostponed
                    ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : isToday
                    ? 'border-blue-400 dark:border-blue-800 ring-2 ring-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        platformBadge[m.platform]
                      }`}
                    >
                      {m.platform}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        statusBadge[m.status]
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* POSTPONED AUDIT BANNER */}
                  {isPostponed && m.postponedFrom && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Postponed Reschedule Notice</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        Original: <span className="font-mono">{m.postponedFrom.originalDate} ({m.postponedFrom.originalStartTime})</span>
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                        Reason: "{m.postponedFrom.reason}"
                      </p>
                    </div>
                  )}

                  {/* Date, Time & Association */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-mono font-semibold">
                        {m.date} {isToday && '(Today)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-mono">
                        {m.startTime} – {m.endTime}
                      </span>
                    </div>

                    {m.projectName && (
                      <div className="text-[11px] text-slate-500 truncate">
                        Project: <span className="font-medium text-slate-700 dark:text-slate-300">{m.projectName}</span>
                      </div>
                    )}
                  </div>

                  {/* Attendees */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3 h-3 text-slate-400" />
                        Attendees ({m.attendeeNames.length})
                      </span>
                      <span className="font-mono text-[10px]">Organized by {m.organizerName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {m.attendeeNames.slice(0, 4).map((name) => (
                        <span
                          key={name}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {name}
                        </span>
                      ))}
                      {m.attendeeNames.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{m.attendeeNames.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Join Link */}
                  {m.meetingUrl && m.status !== 'Cancelled' ? (
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No active link</span>
                  )}

                  {/* Actions Dropdown / Postpone & Complete Buttons */}
                  <div className="flex items-center gap-1">
                    {m.status !== 'Completed' && m.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleOpenPostpone(m)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-colors cursor-pointer"
                        title="Postpone meeting to new date/time with reason"
                      >
                        Postpone
                      </button>
                    )}

                    {m.status !== 'Completed' && (
                      <button
                        onClick={() => updateMeeting(m.id, { status: 'Completed' })}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {m.status !== 'Cancelled' && (
                      <button
                        onClick={() => cancelMeeting(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Cancel Meeting"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: SCHEDULE MEETING                                   */}
      {/* ========================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg my-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Schedule Virtual or In-Person Meeting
            </h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solutions Architecture Sprint Milestone Review"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, topics, and attendees..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting URL (Auto-generated if empty)
                  </label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associated Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">No Project Association</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Attendees */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Attendees ({selectedAttendeeIds.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  {users.map((u) => {
                    const isSelected = selectedAttendeeIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttendeeIds([...selectedAttendeeIds, u.id]);
                            } else {
                              setSelectedAttendeeIds(selectedAttendeeIds.filter((id) => id !== u.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({u.role})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: POSTPONE MEETING                                    */}
      {/* ========================================================= */}
      {postponingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Postpone & Reschedule Meeting
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Postponing: <span className="font-bold text-slate-800 dark:text-slate-200">{postponingMeeting.title}</span>
            </p>

            <form onSubmit={handlePostponeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Rescheduled Date *
                </label>
                <input
                  type="date"
                  value={newPostponeDate}
                  onChange={(e) => setNewPostponeDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Start Time
                  </label>
                  <input
                    type="time"
                    value={newPostponeStartTime}
                    onChange={(e) => setNewPostponeStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New End Time
                  </label>
                  <input
                    type="time"
                    value={newPostponeEndTime}
                    onChange={(e) => setNewPostponeEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Postponement (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="e.g. Awaiting client test environment credentials and updated API logs..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPostponingMeeting(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Postponement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
