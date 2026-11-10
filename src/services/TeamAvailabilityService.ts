import { Task, MemberWorkloadInfo } from '../types';

export type AvailabilityLevel = 'Available' | 'Moderate' | 'Busy' | 'Unavailable';

export interface MemberAvailabilityMetrics extends MemberWorkloadInfo {
  availabilityScore: number; // 0 to 100 (100 = completely available, 0 = overloaded/blocked)
  capacityPercentage: number; // 0% to 100%+ load
  remainingWorkHours: number;
  recommendedForAssignment: boolean;
  activeDeadlines: {
    taskId: string;
    taskTitle: string;
    deadline: string;
    daysRemaining: number;
    isOverdue: boolean;
  }[];
}

/**
 * TeamAvailabilityService
 * Calculates real-time member availability based on current task load,
 * deadline proximity, overdue deliverables, and remaining work hours.
 */
export class TeamAvailabilityService {
  /**
   * Evaluates availability metrics for a given member based on active tasks and deadlines.
   */
  static calculateMemberAvailability(
    memberId: string,
    allTasks: Task[],
    memberName = 'Team Member'
  ): MemberAvailabilityMetrics {
    const memberTasks = allTasks.filter((t) => t.assigneeId === memberId);
    const now = Date.now();

    // Partition tasks into active vs completed
    const activeTasks = memberTasks.filter(
      (t) => t.status !== 'Done' && t.status !== 'Completed'
    );
    const completedTasks = memberTasks.filter(
      (t) => t.status === 'Done' || t.status === 'Completed'
    );

    let overdueTasksCount = 0;
    let upcomingDeadlinesCount = 0;
    let remainingWorkHours = 0;

    const activeDeadlines: MemberAvailabilityMetrics['activeDeadlines'] = [];

    activeTasks.forEach((t) => {
      // Remaining work hours
      const est = t.estimatedHours || 8;
      const logged = t.loggedHours || 0;
      remainingWorkHours += Math.max(0, est - logged);

      if (t.deadline) {
        const deadlineTime = new Date(t.deadline).getTime();
        const diffMs = deadlineTime - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const isOverdue = diffMs < 0;
        if (isOverdue) {
          overdueTasksCount += 1;
        } else if (diffDays <= 3) {
          upcomingDeadlinesCount += 1;
        }

        activeDeadlines.push({
          taskId: t.id,
          taskTitle: t.title,
          deadline: t.deadline,
          daysRemaining: diffDays,
          isOverdue,
        });
      }
    });

    // Sort deadlines ascending (most urgent first)
    activeDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const activeTasksCount = activeTasks.length;
    const completedTasksCount = completedTasks.length;

    // Availability Scoring Logic (0 - 100)
    // Baseline: 100 points
    // - 20 points per active task
    // - 25 points per overdue task
    // - 15 points per upcoming deadline within 72h
    // - 1 point per 2 remaining work hours
    let score = 100;
    score -= activeTasksCount * 20;
    score -= overdueTasksCount * 30;
    score -= upcomingDeadlinesCount * 15;
    score -= Math.floor(remainingWorkHours / 4);

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Capacity Percentage: 0% (free) to 100% (full capacity = 40 hours or 4 tasks)
    const capacityByHours = (remainingWorkHours / 40) * 100;
    const capacityByTasks = (activeTasksCount / 4) * 100;
    const capacityPercentage = Math.min(
      100,
      Math.max(0, Math.round(Math.max(capacityByHours, capacityByTasks)))
    );

    // Determine status based on actual task load and deadlines, not just status flags
    let availabilityStatus: AvailabilityLevel;
    let availabilityLabel: string;
    let recommendedForAssignment: boolean;

    if (overdueTasksCount > 0) {
      availabilityStatus = 'Unavailable';
      availabilityLabel = `Blocked by ${overdueTasksCount} overdue deliverable${
        overdueTasksCount > 1 ? 's' : ''
      }`;
      recommendedForAssignment = false;
    } else if (activeTasksCount >= 4 || remainingWorkHours >= 32) {
      availabilityStatus = 'Unavailable';
      availabilityLabel = `At maximum capacity (${activeTasksCount} active tasks, ${remainingWorkHours}h load)`;
      recommendedForAssignment = false;
    } else if (activeTasksCount >= 2 || upcomingDeadlinesCount >= 2 || remainingWorkHours >= 16) {
      availabilityStatus = 'Busy';
      availabilityLabel = `High workload (${activeTasksCount} active tasks, ${upcomingDeadlinesCount} deadline${
        upcomingDeadlinesCount > 1 ? 's' : ''
      } in 72h)`;
      recommendedForAssignment = false;
    } else if (activeTasksCount === 1 || upcomingDeadlinesCount === 1) {
      availabilityStatus = 'Moderate';
      availabilityLabel = `Moderate workload (1 active task, ${remainingWorkHours}h remaining)`;
      recommendedForAssignment = true;
    } else {
      availabilityStatus = 'Available';
      availabilityLabel = 'Fully available (0 active tasks, high capacity)';
      recommendedForAssignment = true;
    }

    return {
      memberId,
      memberName,
      activeTasksCount,
      completedTasksCount,
      upcomingDeadlinesCount,
      overdueTasksCount,
      availabilityStatus,
      availabilityLabel,
      availabilityScore: score,
      capacityPercentage,
      remainingWorkHours,
      recommendedForAssignment,
      activeDeadlines,
    };
  }

  /**
   * Sorts members by availability score (most available first)
   */
  static sortMembersByAvailability(
    memberIds: string[],
    allTasks: Task[],
    getUserName: (id: string) => string
  ): MemberAvailabilityMetrics[] {
    return memberIds
      .map((id) => this.calculateMemberAvailability(id, allTasks, getUserName(id)))
      .sort((a, b) => b.availabilityScore - a.availabilityScore);
  }
}
