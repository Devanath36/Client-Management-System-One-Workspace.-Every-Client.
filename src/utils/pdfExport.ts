import { jsPDF } from 'jspdf';
import { Project, Task, Client, User } from '../types';

export interface ProjectAnalyticsReportData {
  projects: Project[];
  tasks: Task[];
  clients?: Client[];
  users?: User[];
  managerName?: string;
  timeframeLabel?: string;
  statusFilter?: string;
}

export const downloadProjectAnalyticsPDF = (data: ProjectAnalyticsReportData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // 1. Header Banner (Brand Red Accent)
  doc.setFillColor(229, 9, 20); // #E50914
  doc.rect(margin, y, contentWidth, 3, 'F');
  y += 8;

  // 2. Organization & Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 16, 16); // #101010
  doc.text('CLIENT MANAGEMENT SYSTEM', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('ONE WORKSPACE. EVERY CLIENT. | EXECUTIVE OPERATIONS & PROJECT ANALYTICS', margin, y);

  // Date and Manager Stamp on Right
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const generatedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${generatedDate} ${generatedTime}`, pageWidth - margin, y - 5, { align: 'right' });
  if (data.managerName) {
    doc.text(`Manager: ${data.managerName}`, pageWidth - margin, y, { align: 'right' });
  }
  y += 8;

  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // 3. Executive KPI Summary Cards
  const totalProjects = data.projects.length;
  const activeProjects = data.projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'New' || p.status === 'Active'
  ).length;
  const completedProjects = data.projects.filter(
    (p) => p.status === 'Done' || p.status === 'Completed'
  ).length;
  const now = Date.now();
  const overdueProjects = data.projects.filter(
    (p) => (p.status !== 'Done' && p.status !== 'Completed') && new Date(p.deadline).getTime() < now
  ).length;

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = data.tasks.filter(
    (t) => (t.status !== 'Done' && t.status !== 'Completed') && new Date(t.deadline).getTime() < now
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeRate = totalTasks > 0 ? Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) : 100;

  // KPI Boxes
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 18;

  const kpis = [
    { label: 'TOTAL PROJECTS', val: `${totalProjects}`, sub: `${activeProjects} Active / ${completedProjects} Done`, color: [16, 16, 16] },
    { label: 'DELIVERABLE PROGRESS', val: `${completionRate}%`, sub: `${completedTasks} of ${totalTasks} Tasks`, color: [229, 9, 20] },
    { label: 'ON-TIME ADHERENCE', val: `${onTimeRate}%`, sub: `${overdueTasks} Overdue Tasks`, color: overdueTasks > 0 ? [255, 121, 0] : [16, 16, 16] },
    { label: 'SLA STATUS', val: overdueProjects === 0 ? 'HEALTHY' : `${overdueProjects} DELAYED`, sub: `${pendingTasks} Pending Actions`, color: overdueProjects > 0 ? [229, 9, 20] : [16, 16, 16] },
  ];

  kpis.forEach((kpi, idx) => {
    const bx = margin + idx * (boxWidth + 3);
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(225, 225, 225);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(kpi.label, bx + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, bx + 3, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.sub, bx + 3, y + 15);
  });

  y += boxHeight + 8;

  // 4. Section: Currently Viewed Project Analytics Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 16, 16);
  doc.text('PROJECT ALLOCATION & PERFORMANCE ROSTER', margin, y);
  
  if (data.statusFilter && data.statusFilter !== 'all') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(229, 9, 20);
    doc.text(`[ Filter: ${data.statusFilter.toUpperCase()} ]`, margin + 95, y);
  }
  y += 5;

  // Table Header
  const colX = [margin, margin + 45, margin + 85, margin + 115, margin + 145];
  const colW = [43, 38, 28, 28, contentWidth - 145];

  doc.setFillColor(16, 16, 16); // Matte Black Header
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CLIENT & PROJECT', colX[0] + 2, y + 4.8);
  doc.text('PURPOSE / SCOPE', colX[1] + 2, y + 4.8);
  doc.text('LEAD & TEAM', colX[2] + 2, y + 4.8);
  doc.text('DEADLINE', colX[3] + 2, y + 4.8);
  doc.text('STATUS / PROGRESS', colX[4] + 2, y + 4.8);
  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  const maxProjectsToDisplay = Math.min(data.projects.length, 18);
  data.projects.slice(0, maxProjectsToDisplay).forEach((project, idx) => {
    // Check if near bottom of page
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
      // Header again
      doc.setFillColor(16, 16, 16);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CLIENT & PROJECT', colX[0] + 2, y + 4.8);
      doc.text('PURPOSE / SCOPE', colX[1] + 2, y + 4.8);
      doc.text('LEAD & TEAM', colX[2] + 2, y + 4.8);
      doc.text('DEADLINE', colX[3] + 2, y + 4.8);
      doc.text('STATUS / PROGRESS', colX[4] + 2, y + 4.8);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y, contentWidth, 7.5, 'F');
    }

    doc.setTextColor(16, 16, 16);
    const clientTitle = project.clientName + (project.companyName ? ` (${project.companyName})` : '');
    doc.text(doc.splitTextToSize(clientTitle, colW[0] - 3)[0] || '', colX[0] + 2, y + 5);

    doc.setTextColor(80, 80, 80);
    const purposeText = doc.splitTextToSize(project.purpose || 'Client initiative', colW[1] - 3)[0] || '';
    doc.text(purposeText, colX[1] + 2, y + 5);

    const leadText = doc.splitTextToSize(project.leadName || 'Unassigned', colW[2] - 3)[0] || '';
    doc.text(leadText, colX[2] + 2, y + 5);

    const deadlineText = project.deadline || 'N/A';
    const isOverdue = (project.status !== 'Done' && project.status !== 'Completed') && new Date(project.deadline).getTime() < now;
    if (isOverdue) {
      doc.setTextColor(229, 9, 20); // Red overdue
      doc.text(`${deadlineText} !`, colX[3] + 2, y + 5);
    } else {
      doc.setTextColor(50, 50, 50);
      doc.text(deadlineText, colX[3] + 2, y + 5);
    }

    // Status / Progress
    if (project.status === 'Done' || project.status === 'Completed') {
      doc.setTextColor(80, 80, 80); // White/Neutral/Black approved
      doc.text('Completed (100%)', colX[4] + 2, y + 5);
    } else if (isOverdue) {
      doc.setTextColor(229, 9, 20); // Primary Red
      doc.text(`Delayed (${project.status})`, colX[4] + 2, y + 5);
    } else {
      doc.setTextColor(255, 121, 0); // Orange
      doc.text(project.status, colX[4] + 2, y + 5);
    }

    y += 7.5;
  });

  if (data.projects.length > maxProjectsToDisplay) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`+ ${data.projects.length - maxProjectsToDisplay} additional projects omitted from summary`, margin + 2, y + 4);
    y += 7;
  }

  y += 5;

  // 5. Section: Critical Deliverable Watchlist (Overdue or Urgent tasks)
  if (y < pageHeight - 35) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 16, 16);
    doc.text('CRITICAL SLA & TASK WATCHLIST', margin, y);
    y += 4;

    const criticalTasks = data.tasks
      .filter((t) => t.status !== 'Done' && t.status !== 'Completed')
      .slice(0, 5);

    if (criticalTasks.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('All deliverables are currently fulfilled or in good standing.', margin, y + 4);
      y += 8;
    } else {
      criticalTasks.forEach((t) => {
        const isTOverdue = new Date(t.deadline).getTime() < now;
        doc.setFillColor(isTOverdue ? 255 : 248, isTOverdue ? 240 : 248, isTOverdue ? 240 : 248);
        doc.rect(margin, y, contentWidth, 6, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(isTOverdue ? 229 : 16, isTOverdue ? 9 : 16, isTOverdue ? 20 : 16);
        doc.text(isTOverdue ? '[OVERDUE]' : '[IN PROGRESS]', margin + 2, y + 4.2);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 16, 16);
        doc.text(doc.splitTextToSize(t.title, 80)[0] || '', margin + 25, y + 4.2);

        doc.setTextColor(100, 100, 100);
        doc.text(`Project: ${doc.splitTextToSize(t.projectTitle, 35)[0] || ''}`, margin + 95, y + 4.2);
        doc.text(`Assignee: ${t.assigneeName}`, margin + 130, y + 4.2);

        y += 6.5;
      });
    }
  }

  // 6. Footer (Confidentiality & Compliance)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text(
      'Client Management System — Confidential Executive Analytics Document',
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save the PDF
  const filename = `CMS-Project-Analytics-Report-${new Date().toISOString().substring(0, 10)}.pdf`;
  doc.save(filename);
};
