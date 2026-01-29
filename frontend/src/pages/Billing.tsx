import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Star, Rocket, CheckCircle, XCircle, CreditCard, Edit2, Calendar } from 'lucide-react';
import { APIService } from '../services/api';

const Billing: React.FC = () => {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [currentPlan, setCurrentPlan] = useState('free');
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const data = await APIService.getPlan();
                setCurrentPlan(data.plan);
                setBillingPeriod(data.billing_cycle);
                if (data.next_billing_date) {
                    setNextBillingDate(new Date(data.next_billing_date).toLocaleDateString());
                }
            } catch (err) {
                console.error("Failed to load plan", err);
            }
        };

        const loadBillingData = async () => {
            try {
                const [history, methods] = await Promise.all([
                    APIService.getBillingHistory(),
                    APIService.getPaymentMethods()
                ]);
                setBillingHistory(history);
                setPaymentMethods(methods);
            } catch (err) {
                console.error("Failed to load billing data", err);
            }
        };

        loadPlan();
        loadBillingData();
    }, []);

    const handleUpgrade = async (plan: string) => {
        try {
            await APIService.updatePlan(plan, billingPeriod);
            setCurrentPlan(plan);
            alert(`Successfully upgraded to ${plan} plan!`);
            // Refresh billing data as upgrading might add a history item
            const [history, data] = await Promise.all([APIService.getBillingHistory(), APIService.getPlan()]);
            setBillingHistory(history);
            if (data.next_billing_date) {
                setNextBillingDate(new Date(data.next_billing_date).toLocaleDateString());
            }

        } catch (err) {
            alert('Error updating plan');
        }
    };

    const handleAddCard = async () => {
        // Mock adding a card for now
        const mockCard = {
            card_number: "4242424242424242",
            expiry_month: 12,
            expiry_year: 2028,
            cvc: "123"
        };
        try {
            await APIService.addPaymentMethod(mockCard);
            const methods = await APIService.getPaymentMethods();
            setPaymentMethods(methods);
            alert("Payment method added!");
        } catch (err) {
            alert("Failed to add payment method");
        }
    }

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-white">Billing & Subscription</h2>
                    <p className="text-slate-400">Manage your plan, payment methods, and billing history.</p>
                </div>
                <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                    <span>Manage Subscription</span>
                </button>
            </div>

            {/* Mobile App Promo Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" /> New Mobile App
                        </div>
                        <h2 className="text-3xl font-bold leading-tight">Take your job search anywhere.</h2>
                        <p className="text-blue-100 max-w-md text-sm leading-relaxed">Download our new mobile app to track applications, practice interviews, and get real-time notifications on the go.</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                            <button className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg">
                                <Smartphone size={18} /> App Store
                            </button>
                            <button className="bg-black/30 hover:bg-black/40 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors backdrop-blur-sm border border-white/10">
                                <Download size={18} /> Google Play
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Plan Card */}
            <div className="bg-[#1a222c] rounded-xl shadow-sm border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Rocket size={32} />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Current Plan</p>
                        <h3 className="text-2xl font-bold text-white capitalize">{currentPlan} Plan</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Calendar size={14} /> {nextBillingDate ? `Next renewal on ${nextBillingDate}` : 'No active subscription'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                    {currentPlan !== 'free' && (
                        <button onClick={() => handleUpgrade('free')} className="px-4 py-2 rounded-lg bg-[#101922] text-slate-300 text-sm font-bold border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors">Cancel Plan</button>
                    )}
                    {currentPlan !== 'executive' && (
                        <button onClick={() => handleUpgrade('executive')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Upgrade Plan</button>
                    )}
                </div>
            </div>

            {/* Pricing Toggle & Plans */}
            <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-white text-2xl font-bold">Subscription Plans</h2>
                    <div className="flex items-center gap-1 p-1 bg-[#0f151b] rounded-full border border-slate-800">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-[#1a222c] text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'yearly' ? 'bg-[#1a222c] text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Yearly <span className="ml-1 text-emerald-400 text-xs font-bold">(-20%)</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className="bg-[#1a222c] border border-slate-800 rounded-xl p-6 flex flex-col hover:border-slate-600 transition-all hover:-translate-y-1 duration-300">
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-white">Free</h4>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Perfect for personal use and casual interviewers.</p>
                        </div>
                        <div className="flex-1 space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">5 interviews per month</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Basic candidate portal</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-50">
                                <XCircle size={20} className="text-slate-600" />
                                <span className="text-sm text-slate-500">No advanced analytics</span>
                            </div>
                        </div>
                        <button className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors">Current Status</button>
                    </div>
                    {/* Pro Plan (Active) */}
                    <div className="bg-[#1a222c] border-2 border-blue-500 rounded-xl p-6 flex flex-col relative shadow-2xl shadow-blue-900/20 transform md:-translate-y-4">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-md">Popular</div>
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-white">Pro</h4>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black text-white">${billingPeriod === 'monthly' ? '29' : '24'}</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">For growing teams needing more control.</p>
                        </div>
                        <div className="flex-1 space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Unlimited interviews</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Advanced analytics</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Priority email support</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Custom feedback forms</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUpgrade('pro')}
                            className={`w-full py-2.5 rounded-lg font-bold text-sm shadow-md transition-colors ${currentPlan === 'pro' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                        </button>
                    </div>
                    {/* Executive Plan */}
                    <div className="bg-[#1a222c] border border-slate-800 rounded-xl p-6 flex flex-col hover:border-slate-600 transition-all hover:-translate-y-1 duration-300">
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-white">Executive</h4>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black text-white">${billingPeriod === 'monthly' ? '99' : '79'}</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Enterprise-grade features for large firms.</p>
                        </div>
                        <div className="flex-1 space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Full API access</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">Dedicated account manager</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">SAML/SSO authentication</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <span className="text-sm text-slate-300">White-labeling options</span>
                            </div>
                        </div>
                        <button className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-colors">Upgrade Plan</button>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#1a222c] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">Payment Method</h3>
                    <button onClick={handleAddCard} className="text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">Add New Card</button>
                </div>
                <div className="p-6">
                    {paymentMethods.length > 0 ? paymentMethods.map((method: any) => (
                        <div key={method.id} className="flex items-center justify-between p-4 bg-[#101922] rounded-lg border border-slate-800/50 mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center">
                                    <CreditCard className="text-blue-800" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{method.card_brand} ending in **** {method.card_last4}</p>
                                    <p className="text-xs text-slate-500">Expires {method.expiry_month}/{method.expiry_year}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                <Edit2 size={14} />
                                Edit
                            </button>
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 py-4">
                            No payment methods added.
                        </div>
                    )}
                </div>
            </div>

            {/* Billing History */}
            <div className="bg-[#1a222c] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="font-bold text-white">Billing History</h3>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#131b24] text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {billingHistory.length > 0 ? billingHistory.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-white">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-slate-300">{item.amount}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-full transition-colors">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    No billing history available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="p-4 bg-[#101922]/50 text-center border-t border-slate-800">
                    <button className="text-sm font-bold text-slate-500 hover:text-white transition-colors">View All Transactions</button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
