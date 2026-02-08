import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import { APIService } from '../services/api';
import type { JobFeed } from '../types';

export const FeedList: React.FC = () => {
    const [feeds, setFeeds] = useState<JobFeed[]>([]);
    const [loading, setLoading] = useState(true);
    const [newFeedUrl, setNewFeedUrl] = useState('');
    const [newFeedName, setNewFeedName] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFeeds();
    }, []);

    const loadFeeds = async () => {
        try {
            const data = await APIService.getFeeds();
            setFeeds(data);
        } catch (err) {
            console.error("Failed to load feeds", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeedUrl) return;

        setAdding(true);
        setError('');
        try {
            await APIService.addFeed(newFeedUrl, newFeedName || "Custom Feed");
            setNewFeedUrl('');
            setNewFeedName('');
            await loadFeeds();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to add feed");
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            const updated = await APIService.toggleFeed(id, !currentStatus);
            setFeeds(feeds.map(f => f.id === id ? updated : f));
        } catch (err) {
            console.error("Failed to toggle feed", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this source?")) return;
        try {
            await APIService.deleteFeed(id);
            setFeeds(feeds.filter(f => f.id !== id));
        } catch (err) {
            console.error("Failed to delete feed", err);
        }
    };

    if (loading) return <div className="text-slate-400 p-4">Loading sources...</div>;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {feeds.map(feed => (
                    <div key={feed.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                                <Globe size={20} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-medium text-white truncate">{feed.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{feed.url}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => handleToggle(feed.id, feed.is_active)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${feed.is_active
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                            >
                                {feed.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <button
                                onClick={() => handleDelete(feed.id)}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAdd} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Add New RSS Feed</h4>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Feed Name (Optional)"
                        value={newFeedName}
                        onChange={e => setNewFeedName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        type="url"
                        required
                        placeholder="https://example.com/feed.rss"
                        value={newFeedUrl}
                        onChange={e => setNewFeedUrl(e.target.value)}
                        className="flex-[2] bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};
