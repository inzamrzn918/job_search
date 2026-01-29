import React from 'react';
import { Layout, Clipboard, FileText, Play, Settings, LogOut, User, Hexagon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'kanban', label: 'Job Tracker', icon: Clipboard },
        { id: 'optimize', label: 'Optimize', icon: FileText },
        { id: 'prep', label: 'Preparation', icon: Play },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-[#101922] border-r border-[#1e293b] flex flex-col flex-shrink-0">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Hexagon className="text-white" size={20} fill="currentColor" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    JobSync AI
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:bg-[#1a222c] hover:text-white'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Section (Bottom) */}
            <div className="p-4 border-t border-[#1e293b]">
                <div className="bg-[#1a222c] rounded-xl p-3 flex items-center gap-3 hover:bg-[#252f3d] transition-colors cursor-pointer group relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                        <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); logout(); }}
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
