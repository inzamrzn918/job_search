import React from 'react';
import { User, Shield, Sliders, CreditCard } from 'lucide-react';

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
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ] as const;

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-display">
            {/* Header */}
            <header className="px-8 py-5 border-b border-slate-800 bg-[#101922]">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-slate-400">Manage your account preferences and billing</p>
            </header>

            <main className="flex gap-8 p-8 max-w-[1600px] mx-auto">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-shrink-0 hidden lg:block">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
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
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SettingsLayout;
