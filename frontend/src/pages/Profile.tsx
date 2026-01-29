import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { APIService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface ProfileProps {
    logout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ logout }) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [remoteWork, setRemoteWork] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [minSalary, setMinSalary] = useState<number>(0);
    const [industries, setIndustries] = useState<string[]>([]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = await APIService.getMe();
                setName(user.full_name || "");
                setEmail(user.email || "");
                setPhone(user.phone_number || "");
                setLocation(user.location || "");
                setRemoteWork(user.is_remote ?? true);
                setMinSalary(user.min_salary || 0);
                setIndustries(user.industries || []);
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        try {
            await APIService.updateProfile({
                full_name: name,
                phone_number: phone,
                location: location,
                is_remote: remoteWork,
                min_salary: minSalary,
                industries: industries
            });
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Error updating profile");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const file = e.target.files[0];
                await APIService.uploadProfilePhoto(file);
                // Force reload or update context (simplified for now by just alerting but ideally update user context)
                // alert("Photo uploaded! Please refresh to see changes.");
                window.location.reload();
            } catch (error) {
                alert("Error uploading photo");
                setUploading(false);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-[#1a222c] border border-slate-800 p-6 rounded-xl">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {uploading ? (
                            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center animate-pulse">
                                <span className="text-xs text-white">Uploading...</span>
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-300 shadow-inner">
                                {user?.profile_photo_url ? (
                                    <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    name ? name.substring(0, 2).toUpperCase() : 'ME'
                                )}
                            </div>
                        )}

                        <label htmlFor="photo-upload" className={`absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-blue-600 border-2 border-[#1a222c] cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                            <Edit2 size={12} />
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Profile Photo</h3>
                        <p className="text-xs text-slate-500 mt-1">JPG, GIF or PNG. Recommended size 400x400px.</p>
                        <div className="flex gap-4 mt-3 text-xs">
                            <label htmlFor="photo-upload" className={`text-primary font-medium hover:underline cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                {uploading ? 'Processing...' : 'Upload Now'}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a222c] border border-slate-800 p-8 rounded-xl space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <input type="text" value={email} disabled className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-[#1a222c] border border-slate-800 p-8 rounded-xl space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-6">Career Preferences</h3>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="font-semibold text-white">Open to Remote Work</h4>
                        <p className="text-xs text-slate-500 mt-1">Visible to recruiters looking for remote talent.</p>
                    </div>
                    <button
                        onClick={() => setRemoteWork(!remoteWork)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${remoteWork ? 'bg-blue-500' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${remoteWork ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-white">Minimum Salary</span>
                        <span className="text-primary font-bold">${minSalary.toLocaleString()} / year</span>
                    </div>
                    <input
                        type="range"
                        min="50000"
                        max="300000"
                        step="5000"
                        value={minSalary}
                        onChange={e => setMinSalary(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>$50k</span>
                        <span>$300k+</span>
                    </div>
                </div>

                <div className="pt-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preferred Industries</p>
                    <div className="flex flex-wrap gap-2">
                        {industries.map(tag => (
                            <span key={tag} className="bg-[#101922] text-blue-400 border border-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2">
                                {tag} <button onClick={() => setIndustries(prev => prev.filter(i => i !== tag))} className="hover:text-white">×</button>
                            </span>
                        ))}
                        <button
                            onClick={() => {
                                const newIndustry = prompt("Enter industry:");
                                if (newIndustry) setIndustries(prev => [...prev, newIndustry]);
                            }}
                            className="bg-[#101922] text-slate-400 border border-slate-700 border-dashed px-3 py-1 rounded-md text-xs font-medium hover:text-white hover:border-slate-500"
                        >
                            + Add Industry
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button className="text-slate-400 hover:text-white text-sm font-medium" onClick={logout}>Log out</button>
                <button onClick={handleSave} className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Profile;
