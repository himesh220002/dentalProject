'use client';

import { FaTooth, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaFileMedical, FaPrint, FaDownload } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';

interface ReportProps {
    patient: { _id: string; name: string; age?: number; gender?: string; contact?: string; email?: string; address?: string };
    record: { _id: string; treatmentName: string; date: string; cost: number; notes: string; prescription: string; createdAt?: string };
    onClose?: () => void;
}

export default function SuperfineReport({ patient, record, onClose }: ReportProps) {
    const { clinicData } = useClinic();
    const clinicName = clinicData?.clinicName || 'ToothOp';
    const doctorName = clinicData?.doctorName || 'Dr. ToothOp';
    const chiefRole = clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief'))?.role || 'Chief Dental Surgeon';
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Dental Clinic Road, Katihar, Bihar - 854105';
    const phone = clinicData?.phone || '+91 98765 43210';
    const email = clinicData?.email || 'care@toothopdental.in';
    const dateStr = new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const handlePrint = () => window.print();
    const handleDownload = () => window.print();

    return (
        <div className="fixed inset-0 z-[120] bg-[#fcfcfc] flex flex-col overflow-hidden">
            <div className="h-[56px] bg-white border-b border-black/5 flex items-center justify-between px-4 sm:px-6 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#0a0a0b] text-white grid place-items-center"><FaFileMedical size={12} /></span>
                    <div>
                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Treatment Report</div>
                        <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{record.treatmentName}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/5 text-[12px] font-medium hover:border-black/10"><FaPrint size={11} /> Print</button>
                    <button onClick={handleDownload} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium hover:bg-black"><FaDownload size={11} /> PDF</button>
                    {onClose && <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-600 hover:bg-white">✕</button>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#fcfcfc] print:bg-white print:p-0">
                <div className="max-w-[800px] mx-auto bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden print:shadow-none print:border-black/10 print:rounded-none">
                    {/* Clinic Header */}
                    <div className="px-6 sm:px-8 py-6 border-b border-black/5 flex items-start justify-between gap-6">
                        <div className="flex gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#0a0a0b] text-white grid place-items-center shrink-0"><FaTooth size={16} /></span>
                            <div>
                                <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b] leading-none">{clinicName}</div>
                                <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500 mt-1">{clinicData?.tagline || "Your Smile's Guardian"}</div>
                                <div className="text-[11px] leading-5 text-neutral-500 mt-2 max-w-[320px]">{address}</div>
                                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-500">
                                    <span className="inline-flex items-center gap-1"><FaPhoneAlt size={10} className="text-neutral-400" />{phone}</span>
                                    <span className="inline-flex items-center gap-1"><FaEnvelope size={10} className="text-neutral-400" />{email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right shrink-0">
                            <div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Report</div>
                            <div className="text-[11px] font-mono font-medium text-[#0a0a0b] mt-1">#{record._id.slice(-8).toUpperCase()}</div>
                            <div className="text-[11px] text-neutral-500 mt-1">{dateStr}</div>
                        </div>
                    </div>

                    {/* Patient bar */}
                    <div className="px-6 sm:px-8 py-4 bg-[#fcfcfc] border-b border-black/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Patient</div><div className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1">{patient.name}</div><div className="text-[11px] text-neutral-500">ID: {patient._id.slice(-8).toUpperCase()}</div></div>
                        <div><div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Age / Gender</div><div className="text-[13px] font-medium text-[#0a0a0b] mt-1">{patient.age || '—'} {patient.gender ? `· ${patient.gender}` : ''}</div></div>
                        <div><div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Contact</div><div className="text-[13px] font-medium text-[#0a0a0b] mt-1">{patient.contact || '—'}</div><div className="text-[11px] text-neutral-500 truncate">{patient.email || ''}</div></div>
                        <div><div className="text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400">Date</div><div className="text-[13px] font-medium text-[#0a0a0b] mt-1">{dateStr}</div><div className="text-[11px] text-neutral-500">{patient.address ? patient.address.slice(0, 32) : ''}</div></div>
                    </div>

                    {/* Treatment */}
                    <div className="px-6 sm:px-8 py-6">
                        <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500"><FaCalendarAlt size={11} className="text-neutral-400" /> Treatment Summary</div>
                        <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b] leading-tight">{record.treatmentName}</h2>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3 text-center"><div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Amount</div><div className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b] mt-1">₹{record.cost}</div></div>
                            <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3 text-center"><div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Status</div><div className="text-[12px] font-medium text-emerald-700 mt-1">Completed</div></div>
                            <div className="rounded-2xl bg-[#fcfcfc] border border-black/5 p-3 text-center"><div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Doctor</div><div className="text-[12px] font-medium text-[#0a0a0b] mt-1 truncate">{doctorName}</div><div className="text-[10px] text-neutral-500 truncate">{chiefRole}</div></div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="px-6 sm:px-8 pb-6">
                        <div className="rounded-[20px] border border-black/5 bg-[#fcfcfc] p-5">
                            <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Clinical Notes</div>
                            <p className="mt-2 text-[13px] leading-6 text-neutral-700 whitespace-pre-wrap">{record.notes || 'No additional notes.'}</p>
                        </div>
                    </div>

                    {/* Prescription */}
                    <div className="px-6 sm:px-8 pb-6">
                        <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/30 p-5">
                            <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-emerald-700">Prescription & Instructions</div>
                            <div className="mt-2 text-[13px] leading-6 text-neutral-700 whitespace-pre-wrap font-medium">
                                {record.prescription ? record.prescription.split('\n').filter(l => l.trim()).map((line, i) => {
                                    const isClinic = line.toLowerCase().includes('lidocaine') || line.toLowerCase().includes('articaine') || line.toLowerCase().includes('adrenaline');
                                    return <div key={i} className="flex gap-2 py-1 border-b border-emerald-100/50 last:border-0"><span className="text-emerald-600 mt-1">•</span><span className={isClinic ? 'text-violet-700' : 'text-neutral-800'}>{line.replace(/^- /, '')}</span></div>;
                                }) : <span className="text-neutral-500 italic">No medicines prescribed</span>}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-8 py-6 border-t border-black/5 flex flex-col sm:flex-row justify-between gap-6">
                        <div className="text-[11px] leading-5 text-neutral-500">
                            <div className="font-medium text-[#0a0a0b]">{doctorName}</div>
                            <div>{chiefRole}</div>
                            <div className="mt-2 text-[10px] tracking-[0.08em] uppercase">Digitally signed · {new Date().toLocaleDateString('en-IN')}</div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex px-3 py-1.5 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium text-neutral-600">Next recall in 6 months</div>
                            <div className="text-[11px] text-neutral-400 mt-2">For queries: {phone} · {email}</div>
                        </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-4 print:hidden">
                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-[11px] leading-5 text-amber-800">This is a digitally generated report. Please bring it on your next visit. For any discomfort, contact the clinic immediately.</div>
                    </div>
                </div>

                <div className="max-w-[800px] mx-auto mt-4 flex justify-center gap-2 print:hidden">
                    <button onClick={handlePrint} className="px-5 py-2.5 rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium hover:bg-black flex items-center gap-2"><FaPrint size={12} /> Print / Save PDF</button>
                    {onClose && <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-white border border-black/10 text-[13px] font-medium hover:bg-[#fcfcfc]">Close</button>}
                </div>
            </div>

            <style>{`@media print { body * { visibility: hidden; } .print\\:bg-white * { visibility: visible; } header, nav { display: none !important; } }`}</style>
        </div>
    );
}
