'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import axios from 'axios';
import { FaEnvelopeOpen, FaPhone, FaClock, FaCheckCircle, FaCalendarPlus, FaEnvelope, FaSearch, FaFilter } from 'react-icons/fa';
import QuickScheduler from '@/components/QuickScheduler';

interface Message {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    message: string;
    status: string;
    patientType?: 'new' | 'prev';
    appointmentId?: string;
    emailSent?: boolean;
    createdAt: string;
}

const FormattedMessage = ({ text, isExpanded }: { text: string; isExpanded: boolean }) => {
    if (!isExpanded) {
        return <span>{text}</span>;
    }

    const lines = text.split('\n');
    return (
        <div className="space-y-2 py-1">
            {lines.map((line, i) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return <div key={i} className="h-1" />;

                // Check for "Key: Value" or "*Key:* Value"
                // Support patterns like: Treatment: *Dental Fillings* or *Date:* 2026-04-21
                const match = trimmedLine.match(/^(\*?)(.*?)(\*?):\s*(.*)$/);
                if (match) {
                    const label = match[2].trim();
                    const value = match[4].trim();

                    const formattedValue = value.split(/(\*.*?\*)/g).map((part, j) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <strong key={j} className="font-black text-slate-900">{part.slice(1, -1)}</strong>;
                        }
                        return part;
                    });

                    return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-[13px]">
                            <div className="font-black text-slate-400 uppercase tracking-[0.1em] text-[9px] min-w-[90px] shrink-0">
                                {label}
                            </div>
                            <div className="text-slate-800 font-semibold leading-tight">
                                {formattedValue}
                            </div>
                        </div>
                    );
                }

                // Generic line with bold parsing
                const formattedLine = trimmedLine.split(/(\*.*?\*)/g).map((part, j) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return <strong key={j} className="font-black text-slate-900">{part.slice(1, -1)}</strong>;
                    }
                    return part;
                });

                return (
                    <p key={i} className="text-[13px] text-slate-700 leading-relaxed font-medium">
                        {formattedLine}
                    </p>
                );
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

    const toggleMessage = (id: string) => {
        setExpandedMessages(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${id}/read`);
            fetchMessages();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleCreateAppointment = (name: string, phone: string, email: string | undefined, messageId: string, messageText: string, appointmentId?: string) => {
        setSchedulerSearch(phone);
        setSchedulerName(name);
        setSchedulerEmail(email || '');
        setSchedulerMessageId(messageId);
        setSchedulerInquiry(messageText);
        setSchedulerAppointmentId(appointmentId || '');
        setIsSchedulerOpen(true);
    };

    const unreadCount = useMemo(() => messages.filter(m => m.status === 'Unread').length, [messages]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = statusFilter === 'all' ? messages : messages.filter(m => m.status === statusFilter);
        if (!q) return base;
        return base.filter(m => {
            const name = (m.name || '').toLowerCase();
            const phone = (m.phone || '').toLowerCase();
            const email = (m.email || '').toLowerCase();
            const msg = (m.message || '').toLowerCase();
            return name.includes(q) || phone.includes(q) || email.includes(q) || msg.includes(q);
        });
    }, [messages, query, statusFilter]);

    const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">
                        Triage inquiries quickly and convert them into appointments.
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">
                        Unread: {unreadCount}
                    </span>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, phone, email, or message…"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 font-semibold"
                        />
                    </div>
                    <div className="relative sm:w-[240px]">
                        <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Unread' | 'Read' | 'Scheduled')}
                            className="appearance-none w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                            <option value="Scheduled">Scheduled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {/* Desktop table */}
                <div className="hidden md:block bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">From</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Received</th>
                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visible.map((msg) => {
                                    const statusPill =
                                        msg.status === 'Scheduled'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : msg.status === 'Unread'
                                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                                : 'bg-slate-50 border-slate-200 text-slate-600';

                                    const isExpanded = !!expandedMessages[msg._id];

                                    return (
                                        <Fragment key={msg._id}>
                                            <tr className={`hover:bg-blue-50/30 transition group/row ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                                                <td className="px-4 py-5">
                                                    <div className="font-black text-sm text-slate-900">{msg.name}</div>
                                                    {msg.patientType === 'prev' && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                                                            Prev patient
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <a href={`tel:${msg.phone}`} className="font-black text-slate-900 text-sm hover:text-blue-700 transition inline-flex items-center gap-2">
                                                        <FaPhone className="text-slate-400" /> {msg.phone}
                                                    </a>
                                                </td>
                                                <td className="px-4 py-5">
                                                    {msg.email ? (
                                                        <a href={`mailto:${msg.email}`} className="font-semibold text-slate-700 text-sm hover:text-blue-700 max-w-[200px] transition flex items-start gap-2 group/email">
                                                            <FaEnvelope className="text-slate-400 mt-1 shrink-0 group-hover/email:text-blue-500 transition-colors" />
                                                            <span className="break-all whitespace-normal leading-tight">{msg.email}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 font-semibold">—</span>
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-5 cursor-pointer group/msg"
                                                    onClick={() => toggleMessage(msg._id)}
                                                    title="Click to expand/collapse message"
                                                >
                                                    <div className="text-sm text-slate-700 text-sm font-medium max-w-[200px] line-clamp-2">
                                                        {msg.message}
                                                    </div>
                                                    <div className="mt-1 text-[10px] text-blue-500 font-black uppercase tracking-widest opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                        {isExpanded ? 'Click to collapse' : 'Click to read more'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className={`inline-flex items-center text-sm gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusPill}`}>
                                                        {msg.status === 'Scheduled' ? <FaCheckCircle /> : <span className="w-2 h-2 rounded-full bg-current opacity-40" />}
                                                        {msg.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="text-sm font-black text-slate-900 inline-flex items-center gap-2">
                                                        <FaClock className="text-slate-400" />
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        {msg.status === 'Unread' && (
                                                            <button
                                                                onClick={() => markAsRead(msg._id)}
                                                                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-sm"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message, msg.appointmentId)}
                                                            className={`px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-sm  ${msg.status === 'Scheduled' ? 'bg-blue-600 hover:bg-blue-700' : msg.status === 'Unread' ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                                        >
                                                            {msg.status === 'Scheduled' ? 'Reschedule' : 'Create appt +'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-blue-50/10 border-b border-slate-100">
                                                    <td colSpan={7} className="px-6 py-8">
                                                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/50 max-w-[550px] mx-auto lg:mx-0">
                                                            <div className="flex items-center gap-4 mb-4 pb-2 border-b border-slate-100">
                                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                                                                    <FaEnvelopeOpen />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-slate-900 font-black text-sm uppercase tracking-[0.15em]">Patient Inquiry Details</h4>
                                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">From: {msg.name}</p>
                                                                </div>
                                                            </div>
                                                            <FormattedMessage text={msg.message} isExpanded={true} />
                                                            <div className="mt-8 flex justify-end">
                                                                <button
                                                                    onClick={() => toggleMessage(msg._id)}
                                                                    className="px-4 py-1.5 rounded-xl border-2 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                                                >
                                                                    Collapse Inquiry
                                                                </button>
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

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-slate-500 font-semibold">No messages found.</div>
                    )}
                </div>

                {/* Mobile cards */}
                <div className="md:hidden grid gap-3">
                    {visible.map((msg) => (
                        <div
                            key={msg._id}
                            className={`bg-white p-4 rounded-2xl shadow-sm border transition ${msg.status === 'Scheduled'
                                ? 'border-emerald-200'
                                : msg.status === 'Unread'
                                    ? 'border-blue-200'
                                    : 'border-slate-200'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-black text-slate-900 truncate">{msg.name}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${msg.status === 'Scheduled'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : msg.status === 'Unread'
                                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                                : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}>
                                            {msg.status}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 inline-flex items-center gap-2">
                                            <FaClock className="text-slate-400" />
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                <a href={`tel:${msg.phone}`} className="inline-flex items-center gap-2 font-black text-slate-900">
                                    <FaPhone className="text-slate-400" /> {msg.phone}
                                </a>
                                {msg.email && (
                                    <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                        <FaEnvelope className="text-slate-400" /> {msg.email}
                                    </a>
                                )}
                            </div>

                            <div
                                onClick={() => toggleMessage(msg._id)}
                                className={`mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 leading-relaxed break-words cursor-pointer transition-all duration-300 ${expandedMessages[msg._id] ? 'ring-2 ring-blue-500/20 bg-white' : 'line-clamp-3'}`}
                            >
                                <FormattedMessage text={msg.message} isExpanded={!!expandedMessages[msg._id]} />
                                {!expandedMessages[msg._id] && msg.message.length > 100 && (
                                    <div className="mt-2 text-[10px] text-blue-600 font-black uppercase tracking-widest">
                                        Tap to expand
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex gap-2">
                                {msg.status === 'Unread' && (
                                    <button
                                        onClick={() => markAsRead(msg._id)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition"
                                    >
                                        <FaCheckCircle className="inline mr-2" /> Read
                                    </button>
                                )}
                                <button
                                    onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message, msg.appointmentId)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition"
                                >
                                    <FaCalendarPlus className="inline mr-2" /> {msg.status === 'Scheduled' ? 'Reschedule' : 'Appt'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length > visibleCount && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-blue-200"
                            >
                                Read More Messages
                            </button>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                            <FaEnvelopeOpen className="text-5xl mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-bold">No messages found</p>
                        </div>
                    )}
                </div>
            </div>

            <QuickScheduler
                isOpen={isSchedulerOpen}
                onClose={() => setIsSchedulerOpen(false)}
                onSuccess={() => {
                    setIsSchedulerOpen(false);
                    fetchMessages();
                }}
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
