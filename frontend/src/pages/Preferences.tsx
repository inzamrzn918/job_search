import React, { useState, useEffect } from 'react';
import { Bell, Moon, Mail, Briefcase } from 'lucide-react';
import { APIService } from '../services/api';

const Preferences: React.FC = () => {
    const [preferences, setPreferences] = useState({
        email_notifications: true,
        job_alerts: true,
        dark_mode: true,
        marketing_emails: false
    });

    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const user = await APIService.getMe();
                if (user.preferences) {
                    setPreferences(prev => ({ ...prev, ...user.preferences }));
                }
            } catch (err) {
                console.error("Error loading preferences", err);
            }
        };
        loadPrefs();
    }, []);

    const toggle = async (key: keyof typeof preferences) => {
        const newVal = !preferences[key];
        const newPrefs = { ...preferences, [key]: newVal };
        setPreferences(newPrefs);

        try {
            await APIService.updatePreferences({ [key]: newVal });
        } catch (err) {
            console.error("Error saving preference", err);
            // Revert on error
            setPreferences(prev => ({ ...prev, [key]: !newVal }));
        }
    };

    const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? 'bg-blue-500' : 'bg-slate-700'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    );

    return (
        <div className="max-w-3xl space-y-8 animate-fade-in">
            <div className="bg-[#1a222c] border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Application Settings</h3>
                    <p className="text-sm text-slate-400">Manage how the application behaves and communicates with you.</p>
                </div>

                <div className="divide-y divide-slate-800">
                    {/* Dark Mode */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Moon size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Dark Mode</h4>
                                <p className="text-xs text-slate-500">Use the dark theme for the application interface.</p>
                            </div>
                        </div>
                        <ToggleSwitch active={preferences.dark_mode} onClick={() => toggle('dark_mode')} />
                    </div>

                    {/* Job Alerts */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Job Alerts</h4>
                                <p className="text-xs text-slate-500">Receive notifications when new matched jobs are found.</p>
                            </div>
                        </div>
                        <ToggleSwitch active={preferences.job_alerts} onClick={() => toggle('job_alerts')} />
                    </div>
                </div>
            </div>

            <div className="bg-[#1a222c] border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Email Notifications</h3>
                    <p className="text-sm text-slate-400">Control which emails you receive from us.</p>
                </div>

                <div className="divide-y divide-slate-800">
                    {/* General Emails */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Activity Notifications</h4>
                                <p className="text-xs text-slate-500">Updates about your tracked jobs and interview reminders.</p>
                            </div>
                        </div>
                        <ToggleSwitch active={preferences.email_notifications} onClick={() => toggle('email_notifications')} />
                    </div>

                    {/* Marketing */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Product Updates</h4>
                                <p className="text-xs text-slate-500">News about new features and improvements.</p>
                            </div>
                        </div>
                        <ToggleSwitch active={preferences.marketing_emails} onClick={() => toggle('marketing_emails')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
