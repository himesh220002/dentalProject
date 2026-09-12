'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaRupeeSign, FaCalendarAlt, FaNotesMedical, FaPlus, FaTimes, FaStethoscope, FaHistory, FaPrint, FaEye } from 'react-icons/fa';
import { parseAppointmentReason, cleanNotes } from '@/utils/appointmentUtils';
import TreatmentIcon from './TreatmentIcon';
import SuperfineReport from './reports/SuperfineReport';

interface TreatmentRecord { _id: string; treatmentName: string; date: string; cost: number; notes: string; prescription: string; }
interface Treatment { _id: string; name: string; price: string; }

const CLINIC_DRUGS = [
    { name: 'Lidocaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Articaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Mepivacaine (LA)', instruction: 'Administered in-clinic for numbing' },
    { name: 'Adrenaline w/ Anesthetic', instruction: 'Administered to reduce bleeding/prolong anesthesia' },
    { name: 'Ketorol-DT (In-Clinic)', instruction: 'Single dose for immediate pain relief' },
    { name: 'Amoxicillin (Prophylactic)', instruction: 'Single 2g dose administered pre-procedure' },
    { name: 'Augmentin (Prophylactic)', instruction: 'Single 1.2g dose administered pre-procedure' },
    { name: 'Diclofenac Injection', instruction: 'Administered for severe swelling' }
];
const HOME_DRUGS = [
    { name: 'Amoxicillin 500mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Ibuprofen 400mg', instruction: '1 Morning, 1 Night (After food) - Take only if pain persists' },
    { name: 'Paracetamol 500mg', instruction: '1 Morning, 1 Afternoon, 1 Night - Take only if needed' },
    { name: 'Metronidazole 400mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Chlorhexidine Mouthwash', instruction: 'Rinse 10ml twice daily for 7 days (Do not swallow)' },
    { name: 'Zerodol-SP', instruction: '1 Morning, 1 Night (After food) for 3 days' },
    { name: 'Augmentin 625mg', instruction: '1 Morning, 1 Night (After food) for 5 days' },
    { name: 'Ketorol-DT', instruction: 'Dissolve 1 tablet in half cup water (Only for severe pain)' },
    { name: 'Azee 500mg', instruction: '1 Morning (1 hour before food) for 3 days' },
    { name: 'Pantoprazole 40mg', instruction: '1 Morning (Empty stomach) for 5 days' },
    { name: 'Limcee 500mg', instruction: 'Chew 1 tablet daily for 15 days' }
];

const PatientHistory = ({ patientId, records, onRefresh, isEditingProfile, patient }: { patientId: string, records: TreatmentRecord[], onRefresh: () => void, isEditingProfile?: boolean, patient?: any }) => {
    const [reportView, setReportView] = useState<{ patient: any, record: any } | null>(null);
    const [reportPatient, setReportPatient] = useState<any>(patient || null);
    useEffect(() => { if (patient) setReportPatient(patient); }, [patient]);
    const handleViewReport = async (record: TreatmentRecord) => {
        let pat = reportPatient || patient;
        if (!pat) {
            try { const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients/${patientId}`); pat = res.data; setReportPatient(pat); } catch { pat = { _id: patientId, name: 'Patient' }; }
        }
        setReportView({ patient: pat, record });
    };
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedTreatments, setSelectedTreatments] = useState<{ name: string, price: number }[]>([]);
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [additionalCost, setAdditionalCost] = useState(0);
    const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ treatmentName: string, cost: number, notes: string, prescription: string } | null>(null);

    useEffect(() => { if (records.length > 0) setExpandedRecords(prev => ({ [records[0]._id]: true, ...prev })); }, [records]);
    const toggleExpand = (id: string) => setExpandedRecords(prev => ({ ...prev, [id]: !prev[id] }));
    const appendToPrescription = (med: { name: string, instruction: string }) => {
        const fullPresc = `${med.name} (${med.instruction})`;
        setPrescription(prev => {
            const current = prev.trim();
            if (!current) return `- ${fullPresc}`;
            if (current.toLowerCase().includes(med.name.toLowerCase())) return current;
            return `${current}\n- ${fullPresc}`;
        });
    };
    const appendToEditPrescription = (med: { name: string, instruction: string }) => {
        const fullPresc = `${med.name} (${med.instruction})`;
        setEditForm(prev => {
            if (!prev) return null;
            const current = (prev.prescription || '').trim();
            if (!current) return { ...prev, prescription: `- ${fullPresc}` };
            if (current.toLowerCase().includes(med.name.toLowerCase())) return prev;
            return { ...prev, prescription: `${current}\n- ${fullPresc}` };
        });
    };
    const fetchTreatments = async () => { try { const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`); setTreatments(response.data); } catch {} };
    const renderPrescriptionLine = (line: string, colorClass: string) => {
        const match = line.match(/^([^-]*-?\s*)([^(\n]+)(\(.*\))?$/);
        if (!match) return <p className={`text-[13px] font-medium ${colorClass} leading-relaxed`}>{line}</p>;
        const prefix = match[1]; const medName = match[2]; const instructions = match[3] || "";
        return <p className="text-[13px] font-medium leading-relaxed"><span className="text-neutral-400">{prefix}</span><span className={colorClass}>{medName}</span><span className="text-[#0a0a0b]">{instructions}</span></p>;
    };
    useEffect(() => { fetchTreatments(); }, [patientId]);
    const handleTreatmentChange = (index: number, selectedName: string) => {
        const selectedTreatment = treatments.find(t => t.name === selectedName);
        const newSelected = [...selectedTreatments];
        if (selectedTreatment) { const numericPrice = parseInt(selectedTreatment.price.replace(/[^0-9]/g, '')) || 0; newSelected[index] = { name: selectedName, price: numericPrice }; }
        else if (selectedName === 'Other / General Consultation') newSelected[index] = { name: selectedName, price: 100 };
        else newSelected[index] = { name: selectedName, price: 0 };
        setSelectedTreatments(newSelected);
    };
    const addTreatmentRow = () => setSelectedTreatments([...selectedTreatments, { name: '', price: 0 }]);
    const removeTreatmentRow = (index: number) => setSelectedTreatments(selectedTreatments.filter((_, i) => i !== index));
    const totalBasePrice = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
    const totalCost = totalBasePrice + additionalCost;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalTreatmentName = selectedTreatments.map(t => t.name).filter(n => n !== '').join(', ');
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records`, { patientId, treatmentName: finalTreatmentName, cost: totalCost, notes, prescription });
            setSelectedTreatments([]); setAdditionalCost(0); setNotes(''); setPrescription(''); setShowForm(false); onRefresh();
        } catch { alert('Failed to add record'); }
    };
    const handleEditStart = (record: TreatmentRecord) => { setEditingRecordId(record._id); setEditForm({ treatmentName: record.treatmentName, cost: record.cost, notes: record.notes, prescription: record.prescription || '' }); };
    const handleEditCancel = () => { setEditingRecordId(null); setEditForm(null); };
    const handleEditSave = async (id: string) => {
        if (!editForm) return;
        try { await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records/${id}`, editForm); setEditingRecordId(null); setEditForm(null); onRefresh(); } catch { alert('Failed to update treatment record'); }
    };
    const handleDeleteRecord = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this treatment record?')) return;
        try { await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records/${id}`); onRefresh(); } catch { alert('Failed to delete treatment record'); }
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0b] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-700"><FaHistory size={12} /></span> Treatment Journey</h2>
                    <p className="text-[12px] tracking-[0.08em] uppercase font-medium text-neutral-500 mt-1">Clinical ledger & progress</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[-0.01em] border transition ${showForm ? 'bg-white border-black/10 text-neutral-700 hover:bg-[#fcfcfc]' : 'bg-[#0a0a0b] text-white border-black hover:bg-black'}`}>
                    {showForm ? <><FaTimes size={11} /> Close</> : <><FaPlus size={11} /> New Entry</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 mb-3">Procedures Performed</div>
                            <div className="space-y-3">
                                {selectedTreatments.map((treatment, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex-1 flex items-center gap-2 bg-[#fcfcfc] border border-black/5 rounded-full px-3 py-1">
                                            <TreatmentIcon treatmentName={treatment.name} className="text-neutral-600 text-[16px] shrink-0" />
                                            <select value={treatment.name} onChange={(e) => handleTreatmentChange(index, e.target.value)} required className="flex-1 bg-transparent outline-none text-[13px] font-medium text-[#0a0a0b] py-2">
                                                <option value="">Select procedure...</option>
                                                {treatments.map((t: Treatment) => <option key={t._id} value={t.name}>{t.name.toUpperCase()} (₹{t.price})</option>)}
                                                <option value="Other / General Consultation">GENERAL CONSULTATION / OTHER</option>
                                            </select>
                                        </div>
                                        <button type="button" onClick={() => removeTreatmentRow(index)} className="w-9 h-9 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50 hover:border-rose-100 transition shrink-0"><FaTimes size={11} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addTreatmentRow} className="w-full h-10 rounded-full border border-dashed border-black/10 bg-[#fcfcfc] text-[12px] font-medium tracking-[-0.01em] text-neutral-600 hover:bg-white hover:border-black/15 transition flex items-center justify-center gap-2"><FaPlus size={10} /> Add procedure</button>
                            </div>
                        </div>

                        <div className="bg-[#fcfcfc] border border-black/5 rounded-[20px] p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500"><FaRupeeSign size={11} className="text-neutral-400" /> Financial Settlement</div>
                                <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">₹{totalCost.toLocaleString()}</div>
                            </div>
                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                <div><div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Base Fee</div><div className="text-[13px] font-semibold text-[#0a0a0b] mt-1">₹{totalBasePrice.toLocaleString()}</div></div>
                                <div>
                                    <label className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Adjustment (+/-)</label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px]">₹</span>
                                        <input type="number" value={additionalCost} onChange={(e) => setAdditionalCost(parseInt(e.target.value) || 0)} placeholder="0" className="w-full h-9 pl-7 pr-3 rounded-full bg-white border border-black/5 outline-none text-[13px] font-medium focus:border-black/15" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500 flex items-center gap-1.5"><FaNotesMedical size={11} className="text-neutral-400" /> Clinical Assessment</label>
                                <button type="button" onClick={() => setNotes("COMPLAINT: \nPROCEDURE: \nFINDINGS: \nThe procedure was completed with proper measures. No immediate complications were observed.\nFOLLOW-UP: Routine checkup advised in a week.")} className="text-[11px] font-medium tracking-[-0.01em] text-[#0a0a0b] underline underline-offset-4">Load Template</button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {['Checkup', 'Severe Pain', 'Swelling', 'Sensitive Teeth', 'Bleeding Gums', 'Broken Tooth', 'Alignment Issue'].map(label => (
                                    <button key={label} type="button" onClick={() => setNotes(prev => prev.includes('COMPLAINT:') ? prev.replace('COMPLAINT:', `COMPLAINT: ${label}`) : `${prev}\nCOMPLAINT: ${label}`.trim())} className="px-2.5 py-1 rounded-full bg-white border border-black/5 text-[11px] font-medium text-neutral-600 hover:border-black/10 hover:text-[#0a0a0b] transition">{label}</button>
                                ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {[
                                    { label: 'Nerve Damaged', finding: 'Nerve damage detected in molar.', procedure: 'Nerve canal cleaning and gum treatment.' },
                                    { label: 'Deep Decay', finding: 'Deep cavity reaching the pulp.', procedure: 'Root Canal Treatment (RCT) and filling.' },
                                    { label: 'Calculus Build-up', finding: 'Significant tartar and plaque.', procedure: 'Full mouth scaling and polishing.' }
                                ].map(item => (
                                    <button key={item.label} type="button" onClick={() => setNotes(prev => { const newEntry = `\nFINDINGS: ${item.finding}\nPROCEDURE: ${item.procedure}`; if (prev.includes(item.finding) && prev.includes(item.procedure)) return prev; return (prev + newEntry).trim(); })} className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-medium hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition">+ {item.label}</button>
                                ))}
                            </div>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detail the clinical journey..." rows={4} className="mt-3 w-full p-4 rounded-[20px] bg-[#fcfcfc] border border-black/5 focus:bg-white focus:border-black/15 outline-none text-[13px] leading-6 resize-none" />
                        </div>

                        <div>
                            <label className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Prescription & Guidance</label>
                            <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Enter dosage, timing, duration..." rows={4} className="mt-2 w-full p-4 rounded-[20px] bg-emerald-50/50 border border-emerald-100 focus:bg-white focus:border-emerald-200 outline-none text-[13px] leading-6 resize-none" />
                            <div className="mt-3 bg-[#fcfcfc] border border-black/5 rounded-2xl p-4 space-y-3">
                                <div>
                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">In-Clinic (Instant)</div>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {CLINIC_DRUGS.map(drug => <button key={drug.name} type="button" onClick={() => appendToPrescription(drug)} className="px-2.5 py-1 rounded-full bg-white border border-black/5 text-[11px] font-medium text-neutral-600 hover:border-black/10 hover:text-[#0a0a0b]">+ {drug.name}</button>)}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-black/5">
                                    <div className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">Home Recovery</div>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {HOME_DRUGS.map(drug => <button key={drug.name} type="button" onClick={() => appendToPrescription(drug)} className="px-2.5 py-1 rounded-full bg-white border border-black/5 text-[11px] font-medium text-neutral-600 hover:border-black/10 hover:text-[#0a0a0b]">+ {drug.name}</button>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0a0b] text-white text-[13px] font-medium tracking-[-0.01em] hover:bg-black active:scale-[0.98] transition"><FaNotesMedical size={12} /> Publish to timeline</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {records.length ? records.map((record, index) => {
                    const isEditingThis = editingRecordId === record._id;
                    return (
                        <div key={record._id} className={`bg-white rounded-[20px] border p-5 sm:p-6 transition ${isEditingThis ? 'border-black/15 shadow-sm ring-1 ring-black/5' : 'border-black/5 hover:border-black/10 hover:shadow-sm'}`}>
                            {isEditingThis ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500"><span className="w-1 h-4 bg-[#0a0a0b] rounded-full" /> Edit Record</div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <input value={editForm?.treatmentName} onChange={e => setEditForm(prev => prev ? { ...prev, treatmentName: e.target.value } : null)} placeholder="Procedures" className="h-10 px-4 rounded-full bg-[#fcfcfc] border border-black/5 outline-none text-[13px] font-medium focus:bg-white" />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px]">₹</span>
                                            <input type="number" value={editForm?.cost} onChange={e => setEditForm(prev => prev ? { ...prev, cost: parseInt(e.target.value) || 0 } : null)} className="w-full h-10 pl-7 pr-4 rounded-full bg-[#fcfcfc] border border-black/5 outline-none text-[13px] font-medium focus:bg-white" />
                                        </div>
                                    </div>
                                    <textarea value={editForm?.notes} onChange={e => setEditForm(prev => prev ? { ...prev, notes: e.target.value } : null)} rows={3} className="w-full p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 outline-none text-[13px] leading-6 focus:bg-white resize-none" />
                                    <textarea value={editForm?.prescription} onChange={e => setEditForm(prev => prev ? { ...prev, prescription: e.target.value } : null)} rows={4} className="w-full p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 outline-none text-[13px] leading-6 focus:bg-white resize-none" />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleEditCancel} className="px-4 py-2 rounded-full bg-white border border-black/5 text-[12px] font-medium hover:bg-[#fcfcfc]">Cancel</button>
                                        <button onClick={() => handleEditSave(record._id)} className="px-5 py-2 rounded-full bg-[#0a0a0b] text-white text-[12px] font-medium hover:bg-black">Update</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f5f5f3] border border-black/5 text-[11px] font-medium tracking-[-0.01em] text-neutral-600">
                                                <FaCalendarAlt size={11} className="text-neutral-400" />{new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b] flex items-center gap-2">
                                                <TreatmentIcon treatmentName={parseAppointmentReason(record.treatmentName).treatmentName} className="text-[#0a0a0b] text-[16px]" />
                                                {parseAppointmentReason(record.treatmentName).treatmentName}
                                                <button onClick={() => toggleExpand(record._id)} className={`w-6 h-6 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-500 transition ${expandedRecords[record._id] ? 'rotate-180' : ''}`}>⌄</button>
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">₹{record.cost}</span>
                                            <button onClick={() => handleViewReport(record)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-neutral-700 grid place-items-center hover:bg-[#fcfcfc] hover:border-black/10 transition" title="View Report"><FaEye size={11} /></button>
                                            <button onClick={() => handleEditStart(record)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-neutral-600 grid place-items-center hover:bg-black hover:text-white hover:border-black transition"><FaPlus size={10} className="rotate-45" /></button>
                                            {isEditingProfile && <button onClick={() => handleDeleteRecord(record._id)} className="w-8 h-8 rounded-full bg-white border border-black/5 text-rose-500 grid place-items-center hover:bg-rose-50 hover:border-rose-100 transition"><FaTimes size={10} /></button>}
                                        </div>
                                    </div>
                                    {expandedRecords[record._id] && (
                                        <div className="mt-4 grid md:grid-cols-2 gap-4 pt-4 border-t border-black/5">
                                            <div className="bg-[#fcfcfc] rounded-2xl border border-black/5 p-4">
                                                <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Clinical Narrative</div>
                                                <p className="text-[13px] leading-6 text-neutral-700 mt-2 whitespace-pre-wrap">{cleanNotes(record.notes) || 'No extensive clinical notes provided.'}</p>
                                            </div>
                                            <div className="bg-[#fcfcfc] rounded-2xl border border-black/5 p-4">
                                                <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Prescription</div>
                                                <div className="mt-2 space-y-1">
                                                    {record.prescription ? record.prescription.split('\n').filter(l => l.trim()).map((line, i) => {
                                                        const isClinic = CLINIC_DRUGS.some(d => line.toLowerCase().includes(d.name.toLowerCase()));
                                                        return <div key={i} className="flex gap-2 text-[13px]">{renderPrescriptionLine(line, isClinic ? 'text-violet-600' : 'text-emerald-600')}{isClinic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 font-medium shrink-0">clinic</span>}</div>;
                                                    }) : <span className="text-[13px] text-neutral-400 italic">No medicines prescribed</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white rounded-[20px] border border-dashed border-black/10 p-10 text-center">
                        <span className="w-10 h-10 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-400"><FaClipboardList size={14} /></span>
                        <div className="text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] mt-3">No treatment records yet</div>
                        <div className="text-[12px] text-neutral-500 mt-1">Add a new entry to start the timeline.</div>
                    </div>
                )}
            </div>
            {reportView && <SuperfineReport patient={reportView.patient} record={reportView.record} onClose={() => setReportView(null)} />}
        </div>
    );
};

export default PatientHistory;
