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
    'Google Meet': 'bg-[#171717] text-[#FFC928] border border-[#333333]',
    'Microsoft Teams': 'bg-[#171717] text-[#FF7900] border border-[#333333]',
    Zoom: 'bg-[#171717] text-white border border-[#333333]',
    'In-Person': 'bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333]',
  };

  const statusBadge = {
    Scheduled: 'bg-[#171717] text-[#FF7900] border border-[#FF7900]/40',
    'In Progress': 'bg-[#171717] text-[#FFC928] border border-[#FFC928]/40 animate-pulse',
    Completed: 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333]',
    Postponed: 'bg-[#171717] text-[#FFC928] border border-[#FFC928]/40 font-bold',
    Cancelled: 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] text-[#E50914] border border-[#E0E0E0] dark:border-[#333333]">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] dark:text-white">
              Meeting Management System
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-[#A3A3A3] mt-1">
            Coordinate virtual calls, 1-click video links, rescheduling audits, and attendee
            dispatch.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAttendeeIds(users.slice(0, 3).map((u) => u.id));
            setIsScheduleModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-2xs">
        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
            }`}
          >
            Today's Meetings
          </button>
          <button
            onClick={() => setActiveTab('postponed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'postponed'
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'text-[#FFC928] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
            }`}
          >
            Postponed
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#E50914] text-white shadow-xs'
                : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
            }`}
          >
            All ({meetings.length})
          </button>
        </div>

        {/* Search & Platform Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] text-xs text-[#333333] dark:text-[#D4D4D4] focus:outline-none"
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
          <div className="col-span-full py-16 bg-white dark:bg-[#141414] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] text-center space-y-2">
            <Video className="w-10 h-10 text-[#A3A3A3] dark:text-[#444444] mx-auto" />
            <p className="text-sm font-semibold text-[#333333] dark:text-[#D4D4D4]">
              No meetings found for this filter
            </p>
            <p className="text-xs text-[#888888] dark:text-[#A3A3A3]">
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
                className={`bg-white dark:bg-[#141414] rounded-3xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                  isPostponed
                    ? 'border-[#FFC928] bg-[#FFC928]/5 dark:bg-[#171717]'
                    : isToday
                    ? 'border-[#E50914] ring-2 ring-[#E50914]/10'
                    : 'border-[#E0E0E0] dark:border-[#333333]'
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
                    <h4 className="text-base font-bold text-[#101010] dark:text-white leading-snug">
                      {m.title}
                    </h4>
                    <p className="text-xs text-[#555555] dark:text-[#A3A3A3] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* POSTPONED AUDIT BANNER */}
                  {isPostponed && m.postponedFrom && (
                    <div className="p-3 rounded-2xl bg-[#171717] border border-[#FFC928]/40 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#FFC928]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FFC928]" />
                        <span>Postponed Reschedule Notice</span>
                      </div>
                      <p className="text-[11px] text-[#FFC928]">
                        Original: <span className="font-mono">{m.postponedFrom.originalDate} ({m.postponedFrom.originalStartTime})</span>
                      </p>
                      <p className="text-[11px] text-[#A3A3A3] italic">
                        Reason: "{m.postponedFrom.reason}"
                      </p>
                    </div>
                  )}

                  {/* Date, Time & Association */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E0E0E0] dark:border-[#333333] text-xs">
                    <div className="flex items-center gap-2 text-[#555555] dark:text-[#A3A3A3]">
                      <Calendar className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                      <span className="font-mono font-semibold text-[#101010] dark:text-white">
                        {m.date} {isToday && '(Today)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#555555] dark:text-[#A3A3A3]">
                      <Clock className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                      <span className="font-mono">
                        {m.startTime} – {m.endTime}
                      </span>
                    </div>

                    {m.projectName && (
                      <div className="text-[11px] text-[#555555] dark:text-[#A3A3A3] truncate">
                        Project: <span className="font-medium text-[#101010] dark:text-white">{m.projectName}</span>
                      </div>
                    )}
                  </div>

                  {/* Attendees */}
                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
                    <div className="flex items-center justify-between text-[11px] text-[#555555] dark:text-[#A3A3A3] mb-1.5">
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3 h-3 text-[#555555] dark:text-[#A3A3A3]" />
                        Attendees ({m.attendeeNames.length})
                      </span>
                      <span className="font-mono text-[10px]">Organized by {m.organizerName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {m.attendeeNames.slice(0, 4).map((name) => (
                        <span
                          key={name}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] font-medium"
                        >
                          {name}
                        </span>
                      ))}
                      {m.attendeeNames.length > 4 && (
                        <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                          +{m.attendeeNames.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between gap-2">
                  {/* Join Link */}
                  {m.meetingUrl && m.status !== 'Cancelled' ? (
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">No active link</span>
                  )}

                  {/* Actions Dropdown / Postpone & Complete Buttons */}
                  <div className="flex items-center gap-1">
                    {m.status !== 'Completed' && m.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleOpenPostpone(m)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#FFC928] bg-[#171717] border border-[#FFC928]/40 hover:bg-[#202020] transition-colors cursor-pointer"
                        title="Postpone meeting to new date/time with reason"
                      >
                        Postpone
                      </button>
                    )}

                    {m.status !== 'Completed' && (
                      <button
                        onClick={() => updateMeeting(m.id, { status: 'Completed' })}
                        className="p-1.5 text-[#555555] dark:text-[#A3A3A3] hover:text-[#FFC928] rounded-lg transition-colors cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {m.status !== 'Cancelled' && (
                      <button
                        onClick={() => cancelMeeting(m.id)}
                        className="p-1.5 text-[#555555] dark:text-[#A3A3A3] hover:text-[#E50914] rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg my-6 bg-white dark:bg-[#141414] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
              Schedule Virtual or In-Person Meeting
            </h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solutions Architecture Sprint Milestone Review"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, topics, and attendees..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Meeting Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                    Meeting URL (Auto-generated if empty)
                  </label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Associated Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white"
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
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1">
                  Required Attendees ({selectedAttendeeIds.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] space-y-1">
                  {users.map((u) => {
                    const isSelected = selectedAttendeeIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EFEFEF] dark:hover:bg-[#202020] cursor-pointer text-xs"
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
                          className="rounded border-[#333333] accent-[#E50914]"
                        />
                        <span className="font-semibold text-[#101010] dark:text-white">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">({u.role})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#FF7900]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#101010] dark:text-white">
                Postpone & Reschedule Meeting
              </h3>
            </div>

            <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
              Postponing: <span className="font-bold text-[#101010] dark:text-white">{postponingMeeting.title}</span>
            </p>

            <form onSubmit={handlePostponeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                  New Rescheduled Date *
                </label>
                <input
                  type="date"
                  value={newPostponeDate}
                  onChange={(e) => setNewPostponeDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                    New Start Time
                  </label>
                  <input
                    type="time"
                    value={newPostponeStartTime}
                    onChange={(e) => setNewPostponeStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                    New End Time
                  </label>
                  <input
                    type="time"
                    value={newPostponeEndTime}
                    onChange={(e) => setNewPostponeEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                  Reason for Postponement (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="e.g. Awaiting client test environment credentials and updated API logs..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setPostponingMeeting(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7900] hover:bg-[#e06a00] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
