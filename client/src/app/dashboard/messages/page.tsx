'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import axios from 'axios';
import { FaEnvelopeOpen, FaPhone, FaClock, FaCheckCircle, FaCalendarPlus, FaEnvelope, FaSearch, FaFilter } from 'react-icons/fa';
import QuickScheduler from '@/components/QuickScheduler';

interface Message {
    _id: string; name: string; phone: string; email?: string; message: string; status: string; patientType?: 'new' | 'prev'; appointmentId?: string; emailSent?: boolean; createdAt: string;
}

const FormattedMessage = ({ text, isExpanded }: { text: string; isExpanded: boolean }) => {
    if (!isExpanded) return <span className="line-clamp-2">{text}</span>;
    const lines = text.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                const trimmedLine = line.trim(); if (!trimmedLine) return <div key={i} className="h-1" />;
                const match = trimmedLine.match(/^(\*?)(.*?)(\*?):\s*(.*)$/);
                if (match) {
                    const label = match[2].trim(); const value = match[4].trim();
                    const formattedValue = value.split(/(\*.*?\*)/g).map((part, j) => part.startsWith('*') && part.endsWith('*') ? <strong key={j} className="font-semibold text-[#0a0a0b]">{part.slice(1, -1)}</strong> : part);
                    return <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[13px]"><span className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500 min-w-[90px] shrink-0">{label}</span><span className="text-[#0a0a0b] font-medium leading-tight">{formattedValue}</span></div>;
                }
                const formattedLine = trimmedLine.split(/(\*.*?\*)/g).map((part, j) => part.startsWith('*') && part.endsWith('*') ? <strong key={j} className="font-semibold text-[#0a0a0b]">{part.slice(1, -1)}</strong> : part);
                return <p key={i} className="text-[13px] leading-6 text-neutral-700">{formattedLine}</p>;
            })}
        </div>
    );
};

export default function DashboardMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Unread' | 'Read' | 'Scheduled'>('all');
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [schedulerSearch, setSchedulerSearch] = useState('');
    const [schedulerName, setSchedulerName] = useState('');
    const [schedulerEmail, setSchedulerEmail] = useState('');
    const [schedulerMessageId, setSchedulerMessageId] = useState('');
    const [schedulerInquiry, setSchedulerInquiry] = useState('');
    const [schedulerAppointmentId, setSchedulerAppointmentId] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);
    const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

    const toggleMessage = (id: string) => setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
    const fetchMessages = async () => {
        try { const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`); setMessages(response.data); } catch (error) { console.error('Error fetching messages:', error); } finally { setLoading(false); }
    };
    useEffect(() => { fetchMessages(); }, []);
    const markAsRead = async (id: string) => { try { await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${id}/read`); fetchMessages(); } catch {} };
    const handleCreateAppointment = (name: string, phone: string, email: string | undefined, messageId: string, messageText: string, appointmentId?: string) => {
        setSchedulerSearch(phone); setSchedulerName(name); setSchedulerEmail(email || ''); setSchedulerMessageId(messageId); setSchedulerInquiry(messageText); setSchedulerAppointmentId(appointmentId || ''); setIsSchedulerOpen(true);
    };
    const unreadCount = useMemo(() => messages.filter(m => m.status === 'Unread').length, [messages]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = statusFilter === 'all' ? messages : messages.filter(m => m.status === statusFilter);
        if (!q) return base;
        return base.filter(m => { const name = (m.name || '').toLowerCase(); const phone = (m.phone || '').toLowerCase(); const email = (m.email || '').toLowerCase(); const msg = (m.message || '').toLowerCase(); return name.includes(q) || phone.includes(q) || email.includes(q) || msg.includes(q); });
    }, [messages, query, statusFilter]);
    const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Messages ]</div>
                    <h1 className="mt-1 text-[24px] sm:text-[28px] font-semibold tracking-[-0.03em] text-[#0a0a0b]">Messages</h1>
                    <p className="text-[13px] leading-6 text-neutral-500">Triage inquiries quickly and convert them into appointments.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 text-[12px] font-medium tracking-[-0.01em] text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Unread: {unreadCount}
                </span>
            </div>

            <div className="bg-white rounded-[20px] border border-black/5 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, email, or message…" className="w-full pl-9 pr-4 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium tracking-[-0.01em] placeholder:text-neutral-400" />
                </div>
                <div className="relative sm:w-[200px]">
                    <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={11} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="appearance-none w-full pl-9 pr-8 h-[42px] rounded-full bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/10 outline-none text-[13px] font-medium text-[#0a0a0b] cursor-pointer">
                        <option value="all">All</option>
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                        <option value="Scheduled">Scheduled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[20px] border border-black/5 shadow-sm overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-[1000px] w-full">
                        <thead className="bg-[#fcfcfc] border-b border-black/5">
                            <tr>
                                {['From', 'Phone', 'Email', 'Message', 'Status', 'Received', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {visible.map((msg) => {
                                const statusCls = msg.status === 'Scheduled' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : msg.status === 'Unread' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-[#f5f5f3] border-black/5 text-neutral-600';
                                const isExpanded = !!expandedMessages[msg._id];
                                return (
                                    <Fragment key={msg._id}>
                                        <tr className={`hover:bg-[#fcfcfc] transition ${isExpanded ? 'bg-[#fcfcfc]' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{msg.name}</div>
                                                {msg.patientType === 'prev' && <span className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-medium">Prev patient</span>}
                                            </td>
                                            <td className="px-4 py-3"><a href={`tel:${msg.phone}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0a0a0b] hover:underline"><FaPhone size={11} className="text-neutral-400" />{msg.phone}</a></td>
                                            <td className="px-4 py-3 max-w-[180px] truncate">
                                                {msg.email ? <a href={`mailto:${msg.email}`} className="inline-flex items-start gap-1.5 text-[13px] text-neutral-700 hover:text-[#0a0a0b]"><FaEnvelope size={11} className="text-neutral-400 mt-0.5 shrink-0" /><span className="break-all leading-tight">{msg.email}</span></a> : <span className="text-neutral-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3 max-w-[220px] cursor-pointer" onClick={() => toggleMessage(msg._id)}>
                                                <div className={`text-[13px] leading-6 text-neutral-700 ${isExpanded ? '' : 'line-clamp-2'}`}><FormattedMessage text={msg.message} isExpanded={isExpanded} /></div>
                                                <div className="text-[11px] text-neutral-400 mt-1 group-hover:opacity-100 opacity-60">{isExpanded ? 'Collapse' : 'Expand'}</div>
                                            </td>
                                            <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${statusCls}`}>{msg.status === 'Scheduled' ? <FaCheckCircle size={10} /> : <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}{msg.status}</span></td>
                                            <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600"><FaClock size={11} className="text-neutral-400" />{new Date(msg.createdAt).toLocaleString()}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    {msg.status === 'Unread' && <button onClick={() => markAsRead(msg._id)} className="px-3 py-1.5 rounded-full bg-[#0a0a0b] text-white text-[11px] font-medium hover:bg-black">Read</button>}
                                                    <button onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message, msg.appointmentId)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${msg.status === 'Scheduled' ? 'bg-white border-black/10 text-neutral-700 hover:bg-[#fcfcfc]' : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'}`}>{msg.status === 'Scheduled' ? 'Reschedule' : 'Create appt'}</button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-6 bg-[#fcfcfc] border-t border-black/5">
                                                    <div className="bg-white rounded-[20px] border border-black/5 p-5 max-w-3xl">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="w-8 h-8 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaEnvelopeOpen size={12} /></span>
                                                            <div>
                                                                <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Patient inquiry</div>
                                                                <div className="text-[12px] font-medium text-[#0a0a0b]">From: {msg.name}</div>
                                                            </div>
                                                        </div>
                                                        <FormattedMessage text={msg.message} isExpanded={true} />
                                                        <div className="mt-4 flex justify-end">
                                                            <button onClick={() => toggleMessage(msg._id)} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[11px] font-medium hover:border-black/10">Collapse</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="py-12 text-center text-[13px] text-neutral-500">No messages found.</div>}
            </div>

            <div className="md:hidden space-y-3">
                {visible.map((msg) => (
                    <div key={msg._id} className={`bg-white rounded-[20px] border p-4 ${msg.status === 'Scheduled' ? 'border-emerald-100' : msg.status === 'Unread' ? 'border-blue-100' : 'border-black/5'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{msg.name}</div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                    <span className={`px-2 py-1 rounded-full border text-[11px] font-medium ${msg.status === 'Scheduled' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : msg.status === 'Unread' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-[#f5f5f3] border-black/5 text-neutral-600'}`}>{msg.status}</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500"><FaClock size={10} />{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                            <a href={`tel:${msg.phone}`} className="inline-flex items-center gap-1.5 font-medium text-[#0a0a0b]"><FaPhone size={11} className="text-neutral-400" />{msg.phone}</a>
                            {msg.email && <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-1.5 text-neutral-600"><FaEnvelope size={11} className="text-neutral-400" />{msg.email}</a>}
                        </div>
                        <div onClick={() => toggleMessage(msg._id)} className={`mt-3 rounded-2xl border p-3 text-[13px] leading-6 break-words ${expandedMessages[msg._id] ? 'bg-white border-black/5' : 'bg-[#fcfcfc] border-black/5 line-clamp-3'}`}>
                            <FormattedMessage text={msg.message} isExpanded={!!expandedMessages[msg._id]} />
                            {!expandedMessages[msg._id] && msg.message.length > 100 && <div className="text-[11px] text-[#0a0a0b] underline underline-offset-4 mt-2">Tap to expand</div>}
                        </div>
                        <div className="mt-3 flex gap-2">
                            {msg.status === 'Unread' && <button onClick={() => markAsRead(msg._id)} className="flex-1 h-9 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium">Read</button>}
                            <button onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message, msg.appointmentId)} className="flex-1 h-9 rounded-full bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600">{msg.status === 'Scheduled' ? 'Reschedule' : 'Create appt'}</button>
                        </div>
                    </div>
                ))}
                {filtered.length > visibleCount && (
                    <div className="flex justify-center pt-2">
                        <button onClick={() => setVisibleCount(prev => prev + 10)} className="px-5 py-2.5 rounded-full bg-white border border-black/10 text-[13px] font-medium hover:border-black/15">Load more</button>
                    </div>
                )}
                {filtered.length === 0 && <div className="py-10 text-center bg-white rounded-[20px] border border-dashed border-black/10 text-[13px] text-neutral-500">No messages found</div>}
            </div>

            <QuickScheduler
                isOpen={isSchedulerOpen}
                onClose={() => setIsSchedulerOpen(false)}
                onSuccess={() => { setIsSchedulerOpen(false); fetchMessages(); }}
                initialSearch={schedulerSearch}
                initialName={schedulerName}
                initialEmail={schedulerEmail}
                messageId={schedulerMessageId}
                inquiryMessage={schedulerInquiry}
                appointmentId={schedulerAppointmentId || undefined}
            />
        </div>
    );
}
