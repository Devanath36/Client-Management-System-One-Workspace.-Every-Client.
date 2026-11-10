# Client Management System (CMS)
> **One Workspace. Every Client.**

A professional, enterprise-grade Client Management System built with React 19, TypeScript, and Tailwind CSS. The platform coordinates client accounts, contractual service level agreements (SLAs), multi-disciplinary squad workloads, project pipelines, and verified deliverable proof reviews with strict role-based access control.

---

## 🌟 Architecture & Implemented Capabilities

### 1. Updated 11-Section Professional Home Page
The Home Page has been organized into all 11 required sections with smooth-scrolling navigation:
1. **Home** (`#home`): Project introduction, brand name (*Client Management System*), tagline (*"One Workspace. Every Client."*), primary CTAs, trust marks, and a 4-metric strip.
2. **About Us** (`#about`): Detailed rationale on why the system exists, eliminating fragmented spreadsheets, and providing a single source of truth.
3. **Features** (`#features`): 6 core feature cards covering Client Management, Team Management, Project Tracking, Task Assignments & Proofs, Reports & Analytics, and Notifications & Alerts.
4. **How It Works** (`#how-it-works`): 4-stage operational workflow from onboarding and SLA definition to verified deliverable sign-offs and reporting.
5. **Our Objectives** (`#objectives`): Key organizational goals (Zero Missed SLAs, Deliverable Verification & Traceability, Balanced Team Bandwidth, Data-Driven Account Retention).
6. **User Roles** (`#user-roles`): In-depth breakdown of Administrator, Operations Manager, Solutions Team Lead, and Team Member responsibilities.
7. **Help & Support** (`#support`): User guidance, best practice cards, white-glove onboarding info, and support contact triggers.
8. **Frequently Asked Questions (FAQ)** (`#faq`): Interactive accordions addressing RBAC, proof evaluations, 48h SLA warning engines, and broadcast notifications.
9. **Privacy Policy** (`#privacy`): Clear statements on corporate data isolation, SOC 2 / ISO 27001 compliance, audit logging, and data retention rules.
10. **Terms & Conditions** (`#terms`): Acceptable use policy, account responsibilities, 99.98% infrastructure SLA benchmarks, and intellectual property terms.
11. **Contact & Footer** (`#contact`): Interactive inquiry form with client-side validation, department selection, direct office contacts, and comprehensive footer navigation.

---

### 2. Role-Based Access Control (RBAC) System
- **Strict Role Isolation**: Defined via TypeScript interfaces (`UserRole`, `RolePermissions`).
- **Dashboard Section Guards**: Each role is restricted to their specific operational view:
  - **Administrator**: User provisioning, role permissions matrix, system overview, immutable activity audit logs, organization config.
  - **Operations Manager**: Client directory (contract value, health scores, 360° modal), team capacity balancing, projects pipeline, global task allocation, revenue charts, and SLA alerts.
  - **Solutions Team Lead**: Assigned projects, task distribution, sprint burndown, status Kanban board, and the **Deliverable Proof Approvals Queue**.
  - **Team Member**: Focused **My Tasks** board, task details, status updates (To Do → In Progress), proof upload modal, upcoming delivery deadlines, and notification log.
- **Access Guard Enforcement**: If an unauthorized tab is requested, an access restriction card is presented explaining that the role lacks privileges, with a quick return button to permitted workspaces.

---

### 3. Comprehensive Notification System
- **Notification Center**: Slide-out tray displaying read and unread notifications with an unread badge counter on the top-bar bell icon.
- **Categorized Notification Types**:
  - `task_assigned`: New project deliverable assigned
  - `deadline_approaching`: 48-hour approaching deadline warnings
  - `client_update`: Client SLA and contract renewals
  - `proof_review`: Deliverable proof submissions, approvals, and revision requests
  - `system_broadcast`: Organization-wide executive announcements
  - `sla_alert`: Critical contractual SLA risk warnings
- **Notification Dispatch Modal**: Administrators and Managers can broadcast notifications to all workspace users, specific roles, or individual team members.
- **Filtering & Management**: Filter by *All* / *Unread*, mark individual notifications as read, mark all read, or delete notifications.

---

### 4. Complete User Authentication & Registration Flow
- **Sign In**: Email & password authentication with show/hide password toggle, remember workstation option, client-side validation, and trusted role resolution.
- **Sign Up**: New account registration with full name, corporate email, department, job title, requested role, password matching (min 8 chars), and Terms & Conditions acceptance.
- **Email Verification**: Generates a 6-digit confirmation code, displays verification screen with demo code prefilled for testing ease, validates code, and provisions active account.
- **Password Reset Mechanism**: Request reset token via work email, receive authorization token, and set a new password.
- **Protected Routes**: Unauthenticated users visiting dashboard routes are redirected to the Login page.
- **Quick Demo Logins**: 1-click pre-fill cards for all 4 roles:
  - *Administrator*: `admin@cmsworkspace.com` (pw: `password123`)
  - *Manager*: `manager@cmsworkspace.com` (pw: `password123`)
  - *Team Lead*: `teamlead@cmsworkspace.com` (pw: `password123`)
  - *Team Member*: `member@cmsworkspace.com` (pw: `password123`)

---

## 💻 Local Development Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run the local development server (port 3000)
npm run dev

# 3. Compile and build for production
npm run build
```
