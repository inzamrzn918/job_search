import React, { useState } from 'react';
import { Lock, Shuffle } from 'lucide-react';
import { APIService } from '../services/api';

const Security: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [qrData, setQrData] = useState<{ secret: string, qr_code: string } | null>(null);
    const [code, setCode] = useState('');

    const handleStart2FA = async () => {
        try {
            const data = await APIService.generate2FA();
            setQrData(data);
        } catch (e) {
            alert("Error generating 2FA");
        }
    };

    const handleVerify2FA = async () => {
        if (!qrData || !code) return;
        try {
            await APIService.enable2FA(qrData.secret, code);
            alert("Two-Factor Authentication Enabled!");
            setQrData(null);
            setCode('');
        } catch (e) {
            alert("Invalid code. Please try again.");
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            await APIService.changePassword({ current_password: currentPassword, new_password: newPassword });
            alert("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert("Error updating password. Check current password.");
        }
    };

    return (
        <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="bg-[#1a222c] border border-slate-800 p-8 rounded-xl space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Change Password</h3>
                        <p className="text-sm text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        Update Password
                    </button>
                </div>
            </div>

            <div className="bg-[#1a222c] border border-slate-800 p-8 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-700/30 rounded-lg text-slate-400">
                            <Shuffle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                            <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                </div>

                <div className="pl-16">
                    {!qrData ? (
                        <button
                            onClick={handleStart2FA}
                            className="text-primary font-bold text-sm hover:underline"
                        >
                            Setup 2FA
                        </button>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-white rounded-lg w-fit">
                                <img src={qrData.qr_code} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="space-y-2 max-w-xs">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        className="flex-1 bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                                    />
                                    <button
                                        onClick={handleVerify2FA}
                                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                                    >
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Security;
