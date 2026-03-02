import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaNotesMedical, FaUser, FaCalendarPlus, FaTrash, FaChevronDown, FaChevronUp, FaWhatsapp } from 'react-icons/fa';

interface MobileAppointmentCardProps {
    apt: any; // Using any for now to match parent usage, or import Appointment interface
    isPastTime: (date: string, time: string) => boolean;
    updateAppointment: (id: string, updates: any) => void;
    handleReschedule: (id: string) => void;
    deleteAppointment: (id: string) => void;
    isHighlighted?: boolean;
}

const MobileAppointmentCard = ({ apt, isPastTime, updateAppointment, handleReschedule, deleteAppointment, isHighlighted }: MobileAppointmentCardProps) => {
    const [isOpen, setIsOpen] = useState(isHighlighted || false);
    const [isBlinking, setIsBlinking] = useState(false);

    const expired = isPastTime(apt.date, apt.time);
    const isReadyForPayment = (apt.status === 'Completed' || apt.isTicked) && apt.paymentStatus !== 'Paid';

    // Blinking logic for Rx button
    useEffect(() => {
        if (apt.paymentStatus === 'Paid') {
            const hasClicked = localStorage.getItem(`rx_clicked_${apt._id}`);
            if (!hasClicked) {
                setIsBlinking(true);
            }
        } else {
            setIsBlinking(false);
        }
    }, [apt.paymentStatus, apt._id]);

    const handleRxClick = () => {
        if (isBlinking) {
            localStorage.setItem(`rx_clicked_${apt._id}`, 'true');
            setIsBlinking(false);
        }
    };

    return (
        <div
            id={`apt-${apt._id}`}
            className={`rounded-2xl border transition-all duration-300 ${isHighlighted
                ? 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                : 'bg-gray-50 border-gray-100 overflow-hidden'
                }`}
        >
            {/* Header (Always Visible) */}
            <div
                className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${expired ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                        <FaClock />
                    </div>
                    <div>
                        <div className="font-black text-gray-900 text-lg">{apt.time}</div>
                        <div className="text-xs font-bold text-gray-400">{new Date(apt.date).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Tablet/Desktop Status Indicators (Visible on collapsed) */}
                {/* Tablet/Desktop Dropdown Indicators (Visible on collapsed) */}
                <div className="hidden sm:flex flex-col-reverse md:flex-row gap-2 items-center gap-3">
                    {/* Payment Status Dropdown */}
                    <div onClick={(e) => e.stopPropagation()} className="relative group">
                        <select
                            value={apt.paymentStatus}
                            onChange={(e) => {
                                const val = e.target.value;
                                const updates: any = { paymentStatus: val };
                                if (val === 'Paid') {
                                    updates.status = 'Completed';
                                    updates.isTicked = true;
                                }
                                updateAppointment(apt._id, updates);
                            }}
                            className={`appearance-none px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${apt.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : apt.paymentStatus === 'Pending'
                                    ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                        >
                            <option value="None">Payment: None</option>
                            <option value="Pending">Payment Pending</option>
                            <option value="Paid">Paid</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-400">
                            <FaChevronDown />
                        </div>
                    </div>

                    {/* Appointment Status Dropdown */}
                    <div onClick={(e) => e.stopPropagation()} className="relative group">
                        {(() => {
                            const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
                            return (
                                <>
                                    <select
                                        value={displayStatus}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const updates: any = {
                                                status: val,
                                                isTicked: val === 'Completed'
                                            };
                                            // Auto-set payment to Pending if marked Completed
                                            if (val === 'Completed' && apt.paymentStatus === 'None') {
                                                updates.paymentStatus = 'Pending';
                                            }
                                            updateAppointment(apt._id, updates);
                                        }}
                                        className={`appearance-none px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${displayStatus === 'Completed'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : displayStatus === 'Operating'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : displayStatus === 'Delayed'
                                                    ? 'bg-amber-500 text-white border-amber-600'
                                                    : 'bg-white text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Delayed">Passed (Delayed)</option>
                                        <option value="Operating">Operating</option>
                                        <option value="Completed">Done</option>
                                    </select>
                                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] ${['Completed', 'Operating', 'Delayed'].includes(displayStatus) ? 'text-white' : 'text-gray-400'}`}>
                                        <FaChevronDown />
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Rx Link - Stop propagation to prevent card toggle */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <Link
                            href={`/patients/${apt.patientId?._id}`}
                            onClick={handleRxClick}
                            className={`w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 transition-all ${isBlinking ? 'animate-pulse ring-2 ring-emerald-400 ring-offset-2' : ''}`}
                        >
                            <FaNotesMedical size={18} />
                        </Link>
                    </div>
                    {/* Toggle Icon */}
                    <div className="text-gray-400">
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                </div>
            </div>

            {/* Collapsible Body */}
            {isOpen && (
                <div className="px-5 pb-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200">
                            <FaUser size={10} />
                        </div>
                        <Link href={`/patients/${apt.patientId?._id}`} className="font-bold text-gray-800 text-sm">
                            {apt.patientId?.name || 'N/A'}
                        </Link>
                    </div>

                    <div className="bg-white p-3 rounded-xl text-sm text-gray-600 border border-gray-100">
                        {apt.reason}
                        {apt.amount && <div className="text-xs font-black text-blue-600 mt-1">₹{apt.amount}</div>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-2">
                        {/* Payment Status Dropdown (Body) */}
                        <div className="relative group min-w-[120px]">
                            <select
                                value={apt.paymentStatus}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const updates: any = { paymentStatus: val };
                                    if (val === 'Paid') {
                                        updates.status = 'Completed';
                                        updates.isTicked = true;
                                    }
                                    updateAppointment(apt._id, updates);
                                }}
                                className={`appearance-none w-full px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${apt.paymentStatus === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : (apt.status === 'Completed' || apt.isTicked)
                                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}
                            >
                                <option value="None">Payment: None</option>
                                <option value="Pending">Payment Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-400">
                                <FaChevronDown />
                            </div>
                        </div>

                        {/* Appointment Status Dropdown (Body) */}
                        <div className="relative group min-w-[120px]">
                            {(() => {
                                const displayStatus = (apt.status === 'Scheduled' && expired) ? 'Delayed' : apt.status;
                                return (
                                    <>
                                        <select
                                            value={displayStatus}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const updates: any = {
                                                    status: val,
                                                    isTicked: val === 'Completed'
                                                };
                                                // Auto-set payment to Pending if marked Completed
                                                if (val === 'Completed' && apt.paymentStatus === 'None') {
                                                    updates.paymentStatus = 'Pending';
                                                }
                                                updateAppointment(apt._id, updates);
                                            }}
                                            className={`appearance-none w-full px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border outline-none cursor-pointer pr-8 ${displayStatus === 'Completed'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : displayStatus === 'Operating'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : displayStatus === 'Delayed'
                                                        ? 'bg-amber-500 text-white border-amber-600'
                                                        : 'bg-white text-gray-500 border-gray-200'
                                                }`}
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Delayed">Passed (Delayed)</option>
                                            <option value="Operating">Operating</option>
                                            <option value="Completed">Done</option>
                                        </select>
                                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] ${['Completed', 'Operating', 'Delayed'].includes(displayStatus) ? 'text-white' : 'text-gray-400'}`}>
                                            <FaChevronDown />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex gap-2 w-full pt-2 border-t border-gray-200">
                        {/* WhatsApp Reminder Button */}
                        <button
                            onClick={() => {
                                const msg = `Reminder: You have an appointment today at ${apt.time}. See you at the clinic!`;
                                const phone = apt.patientId?.contact || '';
                                window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="py-2 px-4 bg-green-50 text-green-600 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                            title="Send WhatsApp Reminder"
                        >
                            <FaWhatsapp />
                        </button>

                        <button
                            onClick={() => handleReschedule(apt._id)}
                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            <FaCalendarPlus /> Reschedule
                        </button>
                        <button
                            onClick={() => deleteAppointment(apt._id)}
                            className="py-2 px-4 bg-rose-50 text-rose-500 rounded-xl text-xs font-black flex items-center justify-center"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileAppointmentCard;
