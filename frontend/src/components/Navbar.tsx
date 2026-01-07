import { Layout, Clipboard, FileText, Play, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="nav-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="logo">JOBSYNC AI</div>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
                <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <Layout size={18} /> Dashboard
                </button>
                <button className={`nav-link ${activeTab === 'kanban' ? 'active' : ''}`} onClick={() => setActiveTab('kanban')}>
                    <Clipboard size={18} /> Tracker
                </button>
                <button className={`nav-link ${activeTab === 'optimize' ? 'active' : ''}`} onClick={() => setActiveTab('optimize')}>
                    <FileText size={18} /> Optimize
                </button>
                <button className={`nav-link ${activeTab === 'prep' ? 'active' : ''}`} onClick={() => setActiveTab('prep')}>
                    <Play size={18} /> Interview Prep
                </button>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{user?.full_name || user?.email}</span>
                    <button
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0, textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <LogOut size={10} /> Logout
                    </button>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="white" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
