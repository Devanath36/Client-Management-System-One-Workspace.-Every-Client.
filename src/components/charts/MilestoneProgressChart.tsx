import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Project, Task } from '../../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface MilestoneProgressChartProps {
  projects: Project[];
  tasks: Task[];
  title?: string;
  subtitle?: string;
}

export const MilestoneProgressChart: React.FC<MilestoneProgressChartProps> = ({
  projects,
  tasks,
  title = 'Milestone Progress vs. Deadlines',
  subtitle = 'Tracks deliverable milestone completion against schedule timeline elapsed',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'behind'>('all');

  const now = Date.now();

  // Prepare chart data for each project
  const chartData = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.projectId === p.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(
      (t) => t.status === 'Done' || t.status === 'Completed'
    ).length;

    // Actual progress percentage
    const actualProgress =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : p.status === 'Done' || p.status === 'Completed'
        ? 100
        : p.progress || 0;

    // Schedule elapsed percentage based on start date and deadline
    let scheduleElapsed = 0;
    let daysRemaining = 0;
    let isOverdue = false;

    if (p.startDate && p.deadline) {
      const startTime = new Date(p.startDate).getTime();
      const deadlineTime = new Date(p.deadline).getTime();
      const totalSpan = Math.max(1, deadlineTime - startTime);
      const elapsedSpan = now - startTime;

      scheduleElapsed = Math.min(100, Math.max(0, Math.round((elapsedSpan / totalSpan) * 100)));
      daysRemaining = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));
      isOverdue = daysRemaining < 0 && actualProgress < 100;
    }

    // Health Assessment
    let health: 'Completed' | 'Ahead' | 'On Track' | 'Behind' | 'Overdue';
    if (actualProgress === 100) {
      health = 'Completed';
    } else if (isOverdue) {
      health = 'Overdue';
    } else if (actualProgress >= scheduleElapsed) {
      health = 'On Track';
    } else if (scheduleElapsed - actualProgress <= 15) {
      health = 'On Track';
    } else {
      health = 'Behind';
    }

    const shortLabel =
      p.clientName.length > 14
        ? p.clientName.substring(0, 12) + '...'
        : p.clientName;

    return {
      id: p.id,
      name: shortLabel,
      fullName: p.clientName + (p.companyName ? ` (${p.companyName})` : ''),
      purpose: p.purpose || p.title,
      leadName: p.leadName,
      startDate: p.startDate,
      deadline: p.deadline,
      duration: p.duration,
      actualProgress,
      scheduleElapsed,
      daysRemaining,
      isOverdue,
      health,
      completedTasks,
      totalTasks,
    };
  });

  const filteredData = chartData.filter((item) => {
    if (filter === 'active') return item.actualProgress < 100;
    if (filter === 'behind') return item.health === 'Behind' || item.health === 'Overdue';
    return true;
  });

  const totalProjects = chartData.length;
  const onTrackCount = chartData.filter(
    (c) => c.health === 'On Track' || c.health === 'Completed'
  ).length;
  const behindCount = chartData.filter((c) => c.health === 'Behind').length;
  const overdueCount = chartData.filter((c) => c.health === 'Overdue').length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101010] text-white p-3.5 rounded-2xl border border-[#333333] shadow-2xl text-xs space-y-2 max-w-xs">
          <div>
            <p className="font-bold text-sm text-[#FFC928]">{data.fullName}</p>
            <p className="text-[11px] text-[#A3A3A3] italic mt-0.5">&ldquo;{data.purpose}&rdquo;</p>
          </div>

          <div className="pt-1.5 border-t border-[#333333] grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-[#A3A3A3] block font-sans text-[10px]">Actual Progress</span>
              <span className="font-bold text-[#E50914]">{data.actualProgress}%</span>
              <span className="text-[#A3A3A3] text-[10px] block">
                ({data.completedTasks}/{data.totalTasks} Tasks)
              </span>
            </div>
            <div>
              <span className="text-[#A3A3A3] block font-sans text-[10px]">Timeline Elapsed</span>
              <span className="font-bold text-[#FFC928]">{data.scheduleElapsed}%</span>
              <span className="text-[#A3A3A3] text-[10px] block">Duration: {data.duration}d</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#333333] flex items-center justify-between text-[11px]">
            <span className="text-[#A3A3A3]">Deadline:</span>
            <span className={`font-mono font-bold ${data.isOverdue ? 'text-[#E50914]' : 'text-white'}`}>
              {data.deadline} ({data.daysRemaining >= 0 ? `${data.daysRemaining}d left` : `${Math.abs(data.daysRemaining)}d overdue`})
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#A3A3A3]">Assigned Lead:</span>
            <span className="text-white font-medium">{data.leadName}</span>
          </div>

          <div className="pt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                data.health === 'Completed' || data.health === 'On Track'
                  ? 'bg-[#FFC928]/20 text-[#FFC928] border border-[#FFC928]/40'
                  : data.health === 'Behind'
                  ? 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40'
                  : 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
              }`}
            >
              Milestone Status: {data.health}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#171717] rounded-3xl border border-[#333333] p-6 space-y-6 shadow-xs text-white">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E50914]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#A3A3A3] mt-0.5">{subtitle}</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <div className="inline-flex rounded-xl p-0.5 bg-[#101010] border border-[#333333] text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#E50914] text-white shadow-xs font-bold'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              All ({totalProjects})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-[#E50914] text-white shadow-xs font-bold'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('behind')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'behind'
                  ? 'bg-[#E50914] text-white shadow-xs font-bold'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Behind / Alert ({behindCount + overdueCount})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-[#101010] border border-[#333333] flex items-center justify-between">
          <span className="text-[#A3A3A3] font-sans">Total Tracked</span>
          <strong className="text-white font-bold text-sm">
            {totalProjects}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-[#101010] border border-[#333333] flex items-center justify-between">
          <span className="text-[#FFC928] font-sans flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>On Track</span>
          </span>
          <strong className="text-[#FFC928] font-bold text-sm">
            {onTrackCount}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-[#101010] border border-[#333333] flex items-center justify-between">
          <span className="text-[#FF7900] font-sans flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Behind Sched.</span>
          </span>
          <strong className="text-[#FF7900] font-bold text-sm">
            {behindCount}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-[#101010] border border-[#333333] flex items-center justify-between">
          <span className="text-[#E50914] font-sans flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </span>
          <strong className="text-[#E50914] font-bold text-sm">
            {overdueCount}
          </strong>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      {filteredData.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#333333] rounded-2xl space-y-2">
          <BarChart3 className="w-8 h-8 text-[#A3A3A3] mx-auto" />
          <p className="text-xs font-bold text-white">
            No projects to visualize
          </p>
          <p className="text-[11px] text-[#A3A3A3]">
            {filter === 'behind'
              ? 'All projects are currently on track with their milestone deadlines!'
              : 'Create or assign projects to start tracking milestone completion.'}
          </p>
        </div>
      ) : (
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 20, right: 20, bottom: 25, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.6} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
                tickLine={false}
                axisLine={{ stroke: '#333333' }}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
                tickLine={false}
                axisLine={{ stroke: '#333333' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <ReferenceLine
                y={100}
                stroke="#FFC928"
                strokeDasharray="4 4"
                label={{ value: '100% Target', position: 'top', fill: '#FFC928', fontSize: 10 }}
              />

              {/* Bar: Actual Milestone Progress in Primary Red */}
              <Bar
                dataKey="actualProgress"
                name="Milestone Progress (%)"
                fill="#E50914"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />

              {/* Line: Schedule Timeline Elapsed in Yellow */}
              <Line
                type="monotone"
                dataKey="scheduleElapsed"
                name="Timeline Elapsed (%)"
                stroke="#FFC928"
                strokeWidth={3}
                dot={{ r: 4, fill: '#FFC928' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend & Guidance Note */}
      <div className="pt-2 border-t border-[#333333] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A3A3A3]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#E50914] rounded-xs inline-block" />
            <span className="text-white">Red Bar: Completed Deliverables & Milestone Work</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#FFC928] inline-block" />
            <span className="text-white">Yellow Line: Timeline Elapsed Toward Deadline</span>
          </span>
        </div>
        <span className="italic text-[#A3A3A3]">
          Tip: Progress exceeding Timeline Elapsed indicates ahead of deadline schedule.
        </span>
      </div>
    </div>
  );
};
