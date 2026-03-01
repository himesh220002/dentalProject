'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEnvelopeOpen, FaPhone, FaClock, FaCheckCircle, FaCalendarPlus, FaEnvelope, FaTimes } from 'react-icons/fa';
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

export default function DashboardMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [schedulerSearch, setSchedulerSearch] = useState('');
    const [schedulerName, setSchedulerName] = useState('');
    const [schedulerEmail, setSchedulerEmail] = useState('');
    const [schedulerMessageId, setSchedulerMessageId] = useState('');
    const [schedulerInquiry, setSchedulerInquiry] = useState('');
    const [schedulerAppointmentId, setSchedulerAppointmentId] = useState('');
    const [resendingId, setResendingId] = useState<string | null>(null);

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

    const handleResendEmail = async (appointmentId: string, contactId: string) => {
        if (!appointmentId) return;
        setResendingId(contactId);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/resend`, {
                contactId: contactId
            });
            alert('Confirmation email resent successfully!');
            fetchMessages();
        } catch (error) {
            console.error('Error resending email:', error);
            alert('Failed to resend email. Please check server logs.');
        } finally {
            setResendingId(null);
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Inquiries & Messages</h1>
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm">
                    {messages.filter(m => m.status === 'Unread').length} New
                </span>
            </div>

            <div className="grid gap-6">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`bg-white p-4 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm border-l-4 transition ${msg.status === 'Scheduled'
                            ? 'border-emerald-500 shadow-emerald-500/5'
                            : msg.status === 'Unread'
                                ? 'border-blue-500 shadow-md'
                                : 'border-gray-200 opacity-75'
                            }`}
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4">
                            <div className="space-y-2 sm:space-y-4 flex-grow">
                                <div className="flex flex-col-reverse sm:flex-row gap-2 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{msg.name}</h3>
                                        {msg.patientType === 'prev' && (
                                            <span className="bg-blue-100 text-blue-700 font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-md border border-blue-200 shadow-sm shadow-blue-500/10">
                                                Prev
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {msg.status === 'Scheduled' && (
                                            <span className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <FaCheckCircle /> <span className="hidden sm:inline">Scheduled</span>
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm font-medium">
                                            <FaClock />
                                            <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium text-xs sm:text-base">
                                    <a href={`tel:${msg.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                                        <FaPhone /> {msg.phone}
                                    </a>
                                    {msg.email ? (
                                        <a href={`mailto:${msg.email}`} className="flex items-center gap-2 hover:text-indigo-600">
                                            <FaEnvelope /> {msg.email}
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                                            <FaPhone className="text-[8px]" /> Call Confirmation Needed
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl text-gray-700 text-xs sm:text-base leading-relaxed border border-gray-100 break-words">
                                    {msg.message}
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-3 mt-2 md:mt-0">
                                {msg.status !== 'Scheduled' && (
                                    <>
                                        {msg.status === 'Unread' && (
                                            <button
                                                onClick={() => markAsRead(msg._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-base flex items-center gap-2 shadow-lg transition transform hover:scale-105 justify-center"
                                            >
                                                <FaCheckCircle /> Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-base flex items-center gap-2 shadow-lg transition transform hover:scale-105 justify-center"
                                        >
                                            <FaCalendarPlus /> Create Appt
                                        </button>
                                    </>
                                )}
                                {msg.status === 'Scheduled' && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col items-center gap-1 bg-emerald-50 px-4 py-3 sm:px-6 sm:py-3 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-500/5">
                                            <div className="text-emerald-600 font-bold flex items-center justify-center gap-2 text-xs sm:text-base">
                                                <FaCheckCircle className="text-lg sm:text-xl" /> Appt Fixed
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCreateAppointment(msg.name, msg.phone, msg.email, msg._id, msg.message, msg.appointmentId)}
                                            className="text-indigo-600 hover:text-indigo-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-xl transition"
                                        >
                                            <FaCalendarPlus /> Reschedule
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                        <FaEnvelopeOpen className="text-5xl mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-bold">No messages received yet</p>
                    </div>
                )}
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
        </div >
    );
}
