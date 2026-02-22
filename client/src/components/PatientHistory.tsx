'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaFileMedical, FaRupeeSign, FaCalendarAlt, FaNotesMedical, FaPlus, FaTimes, FaStethoscope, FaHistory } from 'react-icons/fa';

interface TreatmentRecord {
    _id: string;
    treatmentName: string;
    date: string;
    cost: number;
    notes: string;
    prescription: string;
}

interface Treatment {
    _id: string;
    name: string;
    price: string;
}

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

const PatientHistory = ({ patientId, records, onRefresh, isEditingProfile }: { patientId: string, records: TreatmentRecord[], onRefresh: () => void, isEditingProfile?: boolean }) => {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [selectedTreatments, setSelectedTreatments] = useState<{ name: string, price: number }[]>([]);
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [additionalCost, setAdditionalCost] = useState(0);

    // Expansion state for records
    const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({});

    // Edit states for individual records
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ treatmentName: string, cost: number, notes: string, prescription: string } | null>(null);

    useEffect(() => {
        if (records.length > 0) {
            // Expand latest record by default if not already interacted with
            setExpandedRecords(prev => ({
                [records[0]._id]: true,
                ...prev
            }));
        }
    }, [records]);

    const toggleExpand = (id: string) => {
        setExpandedRecords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

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

    const fetchTreatments = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatments`);
            setTreatments(response.data);
        } catch (error) {
            console.error('Error fetching treatments:', error);
        }
    };

    const renderPrescriptionLine = (line: string, colorClass: string) => {
        // Extract medicine name (everything before the first parenthesis)
        // This regex handles: - Med Name (instr) OR Med Name (instr)
        const match = line.match(/^([^-]*-?\s*)([^(\n]+)(\(.*\))?$/);
        if (!match) return <p className={`text-sm font-bold ${colorClass} leading-relaxed`}>{line}</p>;

        const prefix = match[1]; // e.g. "- "
        const medName = match[2]; // e.g. "Amoxicillin 500mg "
        const instructions = match[3] || ""; // e.g. "(...)"

        return (
            <p className="text-sm font-bold leading-relaxed">
                <span className="text-gray-400">{prefix}</span>
                <span className={colorClass}>{medName}</span>
                <span className="text-gray-900 font-medium">{instructions}</span>
            </p>
        );
    };

    useEffect(() => {
        fetchTreatments();
    }, [patientId]);

    const handleTreatmentChange = (index: number, selectedName: string) => {
        const selectedTreatment = treatments.find(t => t.name === selectedName);
        const newSelected = [...selectedTreatments];

        if (selectedTreatment) {
            const numericPrice = parseInt(selectedTreatment.price.replace(/[^0-9]/g, '')) || 0;
            newSelected[index] = { name: selectedName, price: numericPrice };
        } else if (selectedName === 'Other / General Consultation') {
            newSelected[index] = { name: selectedName, price: 100 };
        } else {
            newSelected[index] = { name: selectedName, price: 0 };
        }
        setSelectedTreatments(newSelected);
    };

    const addTreatmentRow = () => {
        setSelectedTreatments([...selectedTreatments, { name: '', price: 0 }]);
    };

    const removeTreatmentRow = (index: number) => {
        setSelectedTreatments(selectedTreatments.filter((_, i) => i !== index));
    };

    const totalBasePrice = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
    const totalCost = totalBasePrice + additionalCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalTreatmentName = selectedTreatments
                .map(t => t.name)
                .filter(n => n !== '')
                .join(', ');

            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records`, {
                patientId,
                treatmentName: finalTreatmentName,
                cost: totalCost,
                notes,
                prescription
            });
            setSelectedTreatments([]);
            setAdditionalCost(0);
            setNotes('');
            setPrescription('');
            setShowForm(false);
            onRefresh();
        } catch (error) {
            console.error('Error adding record:', error);
            alert('Failed to add record');
        }
    };

    const handleEditStart = (record: TreatmentRecord) => {
        setEditingRecordId(record._id);
        setEditForm({
            treatmentName: record.treatmentName,
            cost: record.cost,
            notes: record.notes,
            prescription: record.prescription || ''
        });
    };

    const handleEditCancel = () => {
        setEditingRecordId(null);
        setEditForm(null);
    };

    const handleEditSave = async (id: string) => {
        if (!editForm) return;
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records/${id}`, editForm);
            setEditingRecordId(null);
            setEditForm(null);
            onRefresh();
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Failed to update treatment record');
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this treatment record?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/treatment-records/${id}`);
            onRefresh();
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Failed to delete treatment record');
        }
    };

    return (
        <div className="mt-20 sm:mt-32 space-y-12">
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100">
                            <FaHistory />
                        </div>
                        Treatment Journey
                    </h2>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-3 ml-1">Clinical Ledger & Medical Progress</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${showForm
                        ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-900/5'
                        : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40'
                        }`}
                >
                    {showForm ? <><FaTimes size={12} /> Close Form</> : <><FaPlus size={12} /> New Treatment entry</>}
                </button>
            </div>

            {/* Modern Record Form */}
            {showForm && (
                <div className="bg-white p-8 sm:p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-indigo-50 animate-in fade-in slide-in-from-top-6 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4 md:col-span-2">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                                <span className="w-8 h-[2px] bg-indigo-200"></span>
                                Diagnostic & Clinical Input
                            </h3>
                        </div>

                        <div className="space-y-6 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">Procedures Performed</label>

                            <div className="space-y-4">
                                {selectedTreatments.map((treatment, index) => (
                                    <div key={index} className="flex gap-4 items-center animate-in slide-in-from-left-6 duration-500 group">
                                        <div className="relative flex-grow">
                                            <select
                                                value={treatment.name}
                                                onChange={(e) => handleTreatmentChange(index, e.target.value)}
                                                className="w-full bg-gray-50/70 border-2 border-gray-100 rounded-2xl px-6 py-5 text-sm font-black text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm group-hover:border-gray-200"
                                                required
                                            >
                                                <option value="">Select a Clinical Procedure...</option>
                                                {treatments.map((t: Treatment) => (
                                                    <option key={t._id} value={t.name}>{t.name.toUpperCase()} (₹{t.price})</option>
                                                ))}
                                                <option value="Other / General Consultation">GENERAL CONSULTATION / OTHER</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 group-hover:text-indigo-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeTreatmentRow(index)}
                                            className="p-5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-all shadow-sm border border-rose-100 flex-shrink-0 active:scale-90"
                                        >
                                            <FaTimes size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addTreatmentRow}
                                    className="w-full py-5 border-2 border-dashed border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="p-1 bg-white border border-gray-200 rounded-lg group-hover:border-indigo-200 transition-all">
                                        <FaPlus size={10} />
                                    </div>
                                    Append Procedure Row
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-8 sm:p-10 rounded-[2.5rem] border border-indigo-100/50 md:col-span-2 shadow-inner group">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm border border-indigo-100"><FaRupeeSign /></div>
                                    Financial Settlement
                                </h4>
                                <div className="text-4xl font-black text-indigo-900 tracking-tighter group-hover:scale-110 transition-transform origin-right">₹{totalCost.toLocaleString()}</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2 px-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Base Procedure Fee</span>
                                    <div className="font-black text-gray-700 text-xl tracking-tight">₹{totalBasePrice.toLocaleString()}</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        Manual Adjustments <span className="text-gray-300 font-bold">(+/-)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300 font-black">₹</div>
                                        <input
                                            type="number"
                                            value={additionalCost}
                                            onChange={(e) => setAdditionalCost(parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full bg-white border-2 border-indigo-100 rounded-2xl px-12 py-4 text-base font-black text-gray-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm focus:shadow-xl focus:shadow-indigo-600/5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Clinical Assessment
                                    <FaNotesMedical className="text-blue-500" />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setNotes("COMPLAINT: \nPROCEDURE: \nFINDINGS: \nFOLLOW-UP: ")}
                                    className="text-[9px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100 uppercase tracking-widest"
                                >
                                    Load Template
                                </button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Detail the clinical journey, observations, and complications..."
                                className="w-full bg-gray-50/70 border-2 border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[150px] resize-none shadow-sm"
                            />
                        </div>

                        <div className="space-y-6 md:col-span-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Prescription & Pharmacological guidance
                            </label>
                            <textarea
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                placeholder="Enter dosage instructions, timing, and duration..."
                                className="w-full bg-emerald-50/30 border-2 border-emerald-100 rounded-[2rem] px-8 py-6 text-sm font-black text-emerald-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all min-h-[150px] resize-none shadow-sm placeholder:text-emerald-200"
                            />

                            <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 block px-1">🏥 In-Clinic Administration (Instant relief)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CLINIC_DRUGS.map(drug => (
                                            <button
                                                key={drug.name}
                                                type="button"
                                                onClick={() => appendToPrescription(drug)}
                                                className="text-[10px] font-black px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100 shadow-sm hover:shadow-indigo-600/20"
                                            >
                                                + {drug.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 block px-1">📝 Home Recovery Prescription</label>
                                    <div className="flex flex-wrap gap-2">
                                        {HOME_DRUGS.map(drug => (
                                            <button
                                                key={drug.name}
                                                type="button"
                                                onClick={() => appendToPrescription(drug)}
                                                className="text-[10px] font-black px-4 py-2 bg-white text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-emerald-100 shadow-sm hover:shadow-emerald-600/20"
                                            >
                                                + {drug.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-8 flex justify-end">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                            >
                                <FaNotesMedical size={18} /> Publish to timeline
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Activity Feed Timeline */}
            <div className="relative pl-0 sm:pl-12 md:pl-16 space-y-12">
                {/* Timeline Line (Modern Gradient) */}
                <div className="hidden sm:block absolute left-[19px] md:left-[23px] top-8 bottom-8 w-1 bg-gradient-to-b from-blue-600 via-indigo-400 to-gray-200 rounded-full opacity-10"></div>

                {records.length > 0 ? (
                    records.map((record, index) => {
                        const isEditingThis = editingRecordId === record._id;

                        return (
                            <div key={record._id} className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                                {/* Modern Timeline Dot */}
                                <div className="hidden sm:block absolute -left-[45px] md:-left-[55px] top-6 w-9 h-9 rounded-2xl bg-white border-[6px] border-blue-600 shadow-xl shadow-blue-600/20 group-hover:scale-125 group-hover:rotate-45 transition-all duration-500 z-10"></div>

                                {/* Record Card */}
                                <div className={`p-8 md:p-12 rounded-[2.5rem] sm:rounded-[4rem] transition-all duration-500 relative overflow-hidden ${isEditingThis ? 'bg-white shadow-2xl border-2 border-indigo-200 ring-8 ring-indigo-50' : 'bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:bg-white'}`}>

                                    {isEditingThis ? (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Modify Clinical Record</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Procedures Title</label>
                                                    <input
                                                        type="text"
                                                        value={editForm?.treatmentName}
                                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, treatmentName: e.target.value } : null)}
                                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-black text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Settlement Amount (₹)</label>
                                                    <div className="relative">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</div>
                                                        <input
                                                            type="number"
                                                            value={editForm?.cost}
                                                            onChange={(e) => setEditForm(prev => prev ? { ...prev, cost: parseInt(e.target.value) || 0 } : null)}
                                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-12 py-4 text-base font-black text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Progress Notes</label>
                                                <textarea
                                                    value={editForm?.notes}
                                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl px-6 py-5 text-sm font-bold text-gray-600 min-h-[100px] resize-none focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    Prescription Override
                                                </label>
                                                <textarea
                                                    value={editForm?.prescription}
                                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, prescription: e.target.value } : null)}
                                                    className="w-full bg-emerald-50/30 border-2 border-emerald-100 rounded-[2rem] px-8 py-6 text-sm font-black text-emerald-800 min-h-[180px] resize-none focus:outline-none focus:border-emerald-500 transition-all"
                                                />

                                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-indigo-500 uppercase tracking-wider mb-2 block">Quick Injection / LA</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {CLINIC_DRUGS.map(drug => (
                                                                <button
                                                                    key={drug.name}
                                                                    type="button"
                                                                    onClick={() => appendToEditPrescription(drug)}
                                                                    className="text-[9px] font-black px-3 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100 shadow-sm"
                                                                >
                                                                    + {drug.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 pt-3 border-t border-gray-200">
                                                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mb-2 block">Quick Prescription</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {HOME_DRUGS.map(drug => (
                                                                <button
                                                                    key={drug.name}
                                                                    type="button"
                                                                    onClick={() => appendToEditPrescription(drug)}
                                                                    className="text-[9px] font-black px-3 py-1.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-emerald-100 shadow-sm"
                                                                >
                                                                    + {drug.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-4">
                                                <button onClick={handleEditCancel} className="px-8 py-4 text-[10px] font-black text-gray-400 hover:text-rose-600 uppercase tracking-widest transition-all">Discard Changes</button>
                                                <button onClick={() => handleEditSave(record._id)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">Update Record</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                                            <div className="space-y-6 flex-grow w-full">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="inline-flex items-center gap-3 bg-blue-600/5 px-5 py-2 rounded-2xl border border-blue-600/10 text-blue-700">
                                                        <FaCalendarAlt className="text-sm" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="inline-flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100 text-gray-500">
                                                        <FaStethoscope className="text-sm" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Clinical Session</span>
                                                    </div>

                                                    <div className="flex gap-2 ml-auto lg:ml-0 bg-white p-1 rounded-xl shadow-inner border border-gray-50">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditStart(record); }}
                                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                                            title="Edit Entry"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        {isEditingProfile && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record._id); }}
                                                                className="p-3 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-300"
                                                                title="Delete Entry"
                                                            >
                                                                <FaTimes size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => toggleExpand(record._id)}
                                                    className="cursor-pointer group/title"
                                                >
                                                    <h3 className="text-sm sm:text-xl lg:text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter leading-tight flex items-center gap-4 transition-colors group-hover/title:text-blue-600">
                                                        {record.treatmentName}
                                                        <div className={`p-2 bg-gray-50 rounded-xl transition-all duration-500 ${expandedRecords[record._id] ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </h3>

                                                    <div className={`transition-all duration-500 overflow-hidden ${expandedRecords[record._id] ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                            <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-100 transition-colors">
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                    Clinical Narrative
                                                                </h4>
                                                                <p className="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                                    {record.notes || 'No extensive clinical notes provided for this session.'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100/50 hover:border-emerald-200 transition-colors">
                                                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                    Pharmaco-Therapy
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    {(() => {
                                                                        if (!record.prescription) return <p className="text-xs font-bold text-gray-400 italic">No medicinal guidance provided.</p>;

                                                                        const lines = record.prescription.split('\n').filter(l => l.trim());
                                                                        const homeLines: string[] = [];
                                                                        const clinicLines: string[] = [];

                                                                        lines.forEach(line => {
                                                                            const isClinic = CLINIC_DRUGS.some(d => line.toLowerCase().includes(d.name.toLowerCase()));
                                                                            if (isClinic) {
                                                                                clinicLines.push(line);
                                                                            } else {
                                                                                homeLines.push(line);
                                                                            }
                                                                        });

                                                                        const homeSection = homeLines.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                {homeLines.map((line, i) => (
                                                                                    <div key={`home-${i}`}>
                                                                                        {renderPrescriptionLine(line, 'text-emerald-700')}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        );

                                                                        const clinicSection = clinicLines.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                {homeLines.length > 0 && <div className="h-px bg-emerald-100/50 my-4"></div>}
                                                                                {clinicLines.map((line, i) => (
                                                                                    <div key={`clinic-${i}`} className="flex items-center gap-3 flex-wrap">
                                                                                        {renderPrescriptionLine(line, 'text-indigo-600')}
                                                                                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase">In-Clinic</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        );

                                                                        return (
                                                                            <>
                                                                                {homeSection}
                                                                                {clinicSection}
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col items-end lg:items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-[2rem] border border-emerald-100 min-w-[140px] shadow-inner lg:h-full self-stretch">
                                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-2">Clinical Fee</p>
                                                <div className="text-2xl md:text-3xl font-black text-emerald-800 tracking-tighter flex items-center">
                                                    <span className="text-base mr-1">₹</span>
                                                    {record.cost.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-gray-50/50 rounded-[3rem] p-16 border-2 border-dashed border-gray-200 text-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mx-auto mb-6 text-gray-300">
                            <FaHistory size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Records Yet</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">This patient hasn't received any recorded treatments at the clinic yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
