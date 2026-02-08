import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tracker = React.lazy(() => import('./pages/Tracker'));
const Optimize = React.lazy(() => import('./pages/Optimize'));
const Coach = React.lazy(() => import('./pages/Coach'));
const Auth = React.lazy(() => import('./pages/Auth'));
// const Billing = React.lazy(() => import('./pages/Billing'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Security = React.lazy(() => import('./pages/Security'));
const Preferences = React.lazy(() => import('./pages/Preferences'));
import JobDetailsPanel from './components/JobDetailsPanel';
import type { JobDetails } from './types';
import SettingsLayout from './components/SettingsLayout';
import { useAuth } from './hooks/useAuth';
import { useJobSync } from './hooks/useJobSync';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');



  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const [addJobTrigger, setAddJobTrigger] = useState(0);
  const [searchJobTrigger, setSearchJobTrigger] = useState(0);
  const [previewJob, setPreviewJob] = useState<JobDetails | null>(null);
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
      <ToastProvider>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto h-full relative">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Loading component...</div>}>
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
                handleUpdateJob={sync.handleUpdateJob}
                onPreviewJob={setPreviewJob}
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
                onPreviewJob={setPreviewJob}
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
                {/* {settingsTab === 'billing' && <Billing />} */}
                {settingsTab === 'security' && <Security />}
                {settingsTab === 'preferences' && <Preferences />}
              </SettingsLayout>
            )}
          </React.Suspense>
        </main>

        {/* Global Job Details Modal */}
        <JobDetailsPanel
          job={previewJob}
          jobId={previewJob?.id?.toString()}
          onUpdateJob={sync.handleUpdateJob}
          onClose={() => setPreviewJob(null)}
          onAction={(action, job) => {
            setPreviewJob(null);
            sync.setJdContext(job);
            if (action === 'optimize') setActiveTab('optimize');
            if (action === 'prep') setActiveTab('prep');
          }}
        />
      </ToastProvider>
    </div>
  );
};

export default App;
