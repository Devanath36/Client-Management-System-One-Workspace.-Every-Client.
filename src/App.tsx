/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ManagerDashboard } from './pages/dashboards/ManagerDashboard';
import { TeamLeadDashboard } from './pages/dashboards/TeamLeadDashboard';
import { TeamMemberDashboard } from './pages/dashboards/TeamMemberDashboard';
import { ToastContainer } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ThreeUniverseScene } from './components/three/ThreeUniverseScene';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainApp: React.FC = () => {
  const { currentView, setCurrentView, currentUser } = useApp();

  // Active tab per dashboard (Default: 'workspace' for unified My Workspace view)
  const [adminTab, setAdminTab] = useState('workspace');
  const [managerTab, setManagerTab] = useState('workspace');
  const [leadTab, setLeadTab] = useState('workspace');
  const [memberTab, setMemberTab] = useState('workspace');

  // Route protection: If user is on dashboard but not logged in, redirect to login
  useEffect(() => {
    if (currentView === 'dashboard' && !currentUser) {
      setCurrentView('login');
    }
  }, [currentView, currentUser, setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* View: Full-Bleed Interactive 3D Command Universe (Three.js PBR Studio Scene) */}
      {currentView === '3d-universe' && (
        <main className="w-screen h-screen overflow-hidden">
          <ThreeUniverseScene
            onExit={() => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('landing');
              }
            }}
          />
        </main>
      )}

      {/* View: Landing Page (Phase 1) */}
      {currentView === 'landing' && (
        <>
          <Navbar />
          <main className="flex-1 w-full">
            <ErrorBoundary fallbackTitle="Homepage Recovery">
              <LandingPage />
            </ErrorBoundary>
          </main>
          <Footer />
        </>
      )}

      {/* View: Login Page (Phase 2) */}
      {currentView === 'login' && (
        <main className="flex-1 flex flex-col justify-center">
          <LoginPage />
        </main>
      )}

      {/* View: Role-Based Dashboards (Phase 3) */}
      {currentView === 'dashboard' && currentUser && (
        <div className="flex-1 flex flex-col">
          {currentUser.role === 'admin' && (
            <DashboardLayout
              activeTab={adminTab}
              onTabChange={setAdminTab}
            >
              <AdminDashboard activeTab={adminTab} onTabChange={setAdminTab} />
            </DashboardLayout>
          )}

          {currentUser.role === 'manager' && (
            <DashboardLayout
              activeTab={managerTab}
              onTabChange={setManagerTab}
            >
              <ManagerDashboard activeTab={managerTab} onTabChange={setManagerTab} />
            </DashboardLayout>
          )}

          {currentUser.role === 'team_lead' && (
            <DashboardLayout
              activeTab={leadTab}
              onTabChange={setLeadTab}
            >
              <TeamLeadDashboard activeTab={leadTab} onTabChange={setLeadTab} />
            </DashboardLayout>
          )}

          {currentUser.role === 'team_member' && (
            <DashboardLayout
              activeTab={memberTab}
              onTabChange={setMemberTab}
            >
              <TeamMemberDashboard activeTab={memberTab} onTabChange={setMemberTab} />
            </DashboardLayout>
          )}
        </div>
      )}

      {/* Global Scroll-to-Top Button for landing & login pages */}
      {currentView !== 'dashboard' && <ScrollToTop />}

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
