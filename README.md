# Client Management System (CMS)

### One Workspace. Every Client.

A centralized web-based platform designed to simplify client management, organize project activities, coordinate teams, and monitor task progress in one place.

---

## 📌 About the Project

The **Client Management System (CMS)** is a web-based application developed to simplify client information management, organize project activities, and improve coordination among team members.

It provides a unified digital workspace where organizations can manage client records, project assignments, task responsibilities, deadlines, and work progress in an organized and efficient manner.

Managing multiple clients and projects can become challenging when information is maintained across different platforms or manual processes. This system addresses these challenges by bringing essential client and project management activities together within a single platform.

The application follows a structured workflow from project creation and team assignment to task execution and progress monitoring.

## 🎯 Project Objectives

- Centralize client information and project records.
- Simplify project creation and assignment.
- Organize task distribution among team members.
- Monitor project and task progress.
- Track upcoming deadlines and overdue activities.
- Improve coordination between different organizational roles.
- Provide a structured and user-friendly workspace.

## ✨ Key Features

### 1. Client Management
- Maintain organized client information.
- Access relevant client records.
- Manage client-related project details.

### 2. Project Management
- Create and manage projects.
- Enter project purpose and descriptions.
- Set project start dates and deadlines.
- Assign projects to registered Team Leads.

### 3. Task Management
- Create and distribute tasks.
- Assign tasks to Team Members.
- Update task statuses.
- Monitor individual task progress.

### 4. Team Management
- Support multiple users with different responsibilities.
- Coordinate work between Managers, Team Leads, and Team Members.
- Provide dedicated dashboards for each user.

### 5. Deadline Tracking
- Monitor project deadlines.
- Track upcoming task due dates.
- Identify pending, ongoing, completed, and overdue work.

### 6. Notification Management
- Receive project assignment updates.
- Get task-related notifications.
- Stay informed about approaching deadlines and status changes.

### 7. Role-Based Access
The system provides four types of user access:

| Role | Responsibilities |
|---|---|
| Administrator | Manage users and overall system access |
| Manager | Manage clients, create projects and assign Team Leads |
| Team Lead | Distribute tasks and monitor Team Members |
| Team Member | Complete assigned tasks and update progress |

## 🔄 System Workflow

1. The Administrator manages user accounts and system access.
2. The Manager creates a project and assigns it to a Team Lead.
3. The Team Lead receives the project and distributes tasks among Team Members.
4. Team Members complete their assigned work and update task statuses.
5. The Team Lead monitors task progress and deadlines.
6. The Manager monitors overall project progress.

## 🛠️ Technology Stack

Update this section according to the technologies actually used in your application.

- **Frontend:** React.js, TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Backend:** Add your actual backend technology
- **Database:** Add your actual database
- **Version Control:** Git and GitHub

## 📂 Project Structure

```text
client-management-system/
│
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Loader.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── clients/
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientList.tsx
│   │   │   └── ClientDetails.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   └── ProjectDetails.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskStatus.tsx
│   │   │
│   │   └── notifications/
│   │       ├── NotificationCenter.tsx
│   │       └── NotificationItem.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   │
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx
│   │   ├── ManagerDashboard.tsx
│   │   ├── TeamLeadDashboard.tsx
│   │   └── TeamMemberDashboard.tsx
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── clientService.ts
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   └── notificationService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── useNotifications.ts
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── client.ts
│   │   ├── project.ts
│   │   └── task.ts
│   │
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── LICENSE
```

*Note: Adjust the folder structure to match your actual repository.*

## ⚙️ Installation and Setup

### Prerequisites
- Node.js
- npm
- Git
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Devanath36/REPOSITORY-NAME.git
```

### Step 2: Navigate to the Project

```bash
cd REPOSITORY-NAME
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open the Application

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🔐 Security and Access

The application uses role-based access to organize user responsibilities. Users should access only the features and information permitted by their assigned roles.


## 🚀 Deployment

The **Client Management System** is deployed on Vercel, making the application accessible online through a public URL. The source code is maintained in GitHub for version control and project development.

### 🌐 Live Application

- **Live Demo:** [Client Management System](https://client-management-system-flax.vercel.app/)
- **GitHub Repository:** [View Source Code](https://github.com/Devanath36/Client-Management-System-One-Workspace.-Every-Client)

### ☁️ Hosting Platform

**Vercel**

Vercel is used to build and host the React and Vite frontend application, providing a public URL for accessing the system.

### ⚙️ Deployment Configuration

| Configuration | Value |
|---|---|
| Hosting Platform | Vercel |
| Source Code | GitHub |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Development Command | `npm run dev` |

### 📦 Deployment Process

1. Push the project source code to the GitHub repository.
2. Import the GitHub repository into Vercel.
3. Configure the project framework as Vite.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure required environment variables, if applicable.
7. Deploy the application through Vercel.
8. Access the deployed application using the generated public URL.

### 🔄 Continuous Deployment

When changes are pushed to the connected GitHub deployment branch, Vercel can automatically build and deploy the latest version of the application, provided automatic deployments are enabled.

### ✅ Deployment Status

<badge color="success">Deployed</badge> **Successfully hosted on Vercel**

The application is available through the live demo link above.

---

<div align="center">

**Client Management System**

*One Workspace. Every Client. Every Project.*

[Live Demo](https://client-management-system-flax.vercel.app/) · [GitHub Repository](https://github.com/Devanath36/Client-Management-System-One-Workspace.-Every-Client)

</div>

## 🚀 Future Enhancements

- Advanced project analytics and reporting.
- Improved dashboard insights.
- Additional workflow automation.
- Enhanced notification capabilities.
- Further improvements to mobile accessibility.

*These are potential future enhancements, not claims that they are already implemented.*
👨‍💻 Project Development Team

## 👨‍💻 Project Development Team

This project was collaboratively developed by the following team members:

### 1. Devanath N
**Role:** Software Testing & UI/UX Designer | MCA Student

- **GitHub:** [Devanath36](https://github.com/Devanath36)
- **LinkedIn:** [Devanath N](https://www.linkedin.com/in/devanathn1706/)
- **Portfolio:** [Visit My Portfolio](https://devanath-portfolio.vercel.app/)
- **Email:** devanathdevanath36@gmail.com

### 2. Shiva Shankar P
**Role:** Full-Stack Developer (Frontend & Backend)

- **GitHub:** [Shiva Shankar](https://github.com/shivashankarP2006)
- **LinkedIn:** [Shiva Shankar P](https://www.linkedin.com/in/shivashankar-p-ba0354341/)
- **Portfolio:** [Visit Portfolio](https://shivashankarp2006.github.io/protfolio/)

### 3. Bhuvaneswaran K
**Role:** Project Ideation & Documentation Lead

- **LinkedIn:** [Bhuvaneswaran K](https://www.linkedin.com/in/bhuvaneshwaran-k-590b192a9/)

---

## 🎓 Project Information

The Client Management System was developed as a collaborative academic project to demonstrate the practical application of web development, client information management, project coordination, task assignment, and role-based access control.

The project brings together client records, project activities, team responsibilities, task updates, and deadline tracking in one centralized workspace.

Each team member contributed to different aspects of the project, including development, interface design, testing, project planning, documentation, and implementation.

## 📄 License

This project is developed for academic and educational purposes.

All rights reserved to the project development team unless otherwise specified. For permission to reuse, modify, or distribute this project, please contact the project developers.

---

<div align="center">

### Client Management System

**One Workspace. Every Client. Every Project.**

Designed & Developed by

**Devanath N · Shiva Shankar P · Bhuvaneswaran K**

[GitHub](https://github.com/Devanath36) · [LinkedIn](https://www.linkedin.com/in/devanathn1706/) · [Portfolio](https://devanath-portfolio.vercel.app/)

© 2026 Client Management System. All Rights Reserved.

</div>
