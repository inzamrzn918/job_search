import React from 'react';
import { User, Shield, Sliders } from 'lucide-react';

interface SettingsLayoutProps {
    activeTab: 'profile' | 'security' | 'preferences' | 'billing';
    setActiveTab: (tab: 'profile' | 'security' | 'preferences' | 'billing') => void;
    children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ activeTab, setActiveTab, children }) => {
    const navItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Sliders },
        // { id: 'billing', label: 'Billing', icon: CreditCard },
    ] as const;

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-display">
            {/* Header */}
            <header className="px-8 py-5 border-b border-slate-800 bg-[#101922]">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-slate-400">Manage your account preferences and billing</p>
            </header>

            <main className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 max-w-[1600px] mx-auto">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0 overflow-x-auto">
                    <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-blue-500/10 text-blue-500'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <React.Suspense fallback={
                        <div className="flex items-center justify-center h-64 border border-slate-800 rounded-xl bg-[#1a222c]">
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span>Loading settings...</span>
                            </div>
                        </div>
                    }>
                        {children}
                    </React.Suspense>
                </div>
            </main>
        </div>
    );
};

export default SettingsLayout;
