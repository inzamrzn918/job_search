import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Optimize from './pages/Optimize';
import Coach from './pages/Coach';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { useJobSync } from './hooks/useJobSync';
import './index.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, loading } = useAuth();
  const sync = useJobSync(isAuthenticated);

  if (loading) {
    return <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
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
          />
        )}

        {activeTab === 'optimize' && (
          <Optimize
            resumeContext={sync.resumeContext}
            jdContext={sync.jdContext}
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
      </main>
    </div>
  );
};

export default App;
