import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Optimize from './pages/Optimize';
import Coach from './pages/Coach';
import Auth from './pages/Auth';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Preferences from './pages/Preferences';
import SettingsLayout from './components/SettingsLayout';
import { useAuth } from './hooks/useAuth';
import { useJobSync } from './hooks/useJobSync';
import './index.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const [addJobTrigger, setAddJobTrigger] = useState(0);
  const [searchJobTrigger, setSearchJobTrigger] = useState(0);
  const { isAuthenticated, loading, logout } = useAuth();
  const sync = useJobSync(isAuthenticated);

  const handleTriggerAddJob = () => {
    setActiveTab('kanban');
    setAddJobTrigger(prev => prev + 1);
  };

  const handleTriggerSearchJob = () => {
    setActiveTab('kanban');
    setSearchJobTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-[#101922] overflow-hidden font-sans text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto h-full relative">
        {activeTab === 'dashboard' && (
          <Dashboard
            resumeContext={sync.resumeContext}
            jdContext={sync.jdContext}
            matchResult={sync.matchResult}
            loading={sync.loading}
            jobs={sync.jobs}
            handleResumeUpload={sync.handleResumeUpload}
            handleJobExtract={sync.handleJobExtract}
            handleAddJobToTracker={sync.handleAddJobToTracker}
            handleTriggerAddJob={handleTriggerAddJob}
            handleTriggerSearchJob={handleTriggerSearchJob}
            setJdContext={sync.setJdContext}
            setActiveTab={setActiveTab}
            handleDeleteJob={sync.handleDeleteJob}
          />
        )}

        {activeTab === 'kanban' && (
          <Tracker
            jobs={sync.jobs}
            handleUpdateStatus={sync.handleUpdateStatus}
            handleUpdateJob={sync.handleUpdateJob}
            handleDeleteJob={sync.handleDeleteJob}
            setJdContext={sync.setJdContext}
            setActiveTab={setActiveTab}
            handleAddJobToTracker={sync.handleAddJobToTracker}
            handleJobExtract={sync.handleJobExtract}
            addJobTrigger={addJobTrigger}
            searchJobTrigger={searchJobTrigger}
            resumeId={sync.resumeContext?.id}
          />
        )}

        {activeTab === 'optimize' && (
          <Optimize
            resumeContext={sync.resumeContext}
            jdContext={sync.jdContext}
            matchResult={sync.matchResult}
            suggestions={sync.suggestions}
            coverLetter={sync.coverLetter}
            loading={sync.loading}
            handleOptimize={sync.handleOptimize}
          />
        )}

        {activeTab === 'prep' && (
          <Coach
            jdContext={sync.jdContext}
            questions={sync.questions}
            selectedQuestion={sync.selectedQuestion}
            answer={sync.answer}
            loading={sync.loading}
            fetchAnswer={sync.fetchAnswer}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsLayout activeTab={settingsTab} setActiveTab={setSettingsTab}>
            {settingsTab === 'profile' && <Profile logout={logout} />}
            {settingsTab === 'billing' && <Billing />}
            {settingsTab === 'security' && <Security />}
            {settingsTab === 'preferences' && <Preferences />}
          </SettingsLayout>
        )}
      </main>
    </div>
  );
};

export default App;
