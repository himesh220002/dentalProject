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
        <div className="mt-16 sm:mt-24 space-y-10">
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FaClipboardList className="text-blue-600" />
                        Treatment Journey
                    </h2>
                    <p className="text-sm text-gray-500 font-medium tracking-tight mt-1">Timeline of clinical treatments and progress notes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${showForm
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                        }`}
                >
                    {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Record</>}
                </button>
            </div>

            {/* Modern Record Form */}
            {showForm && (
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6 md:col-span-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FaFileMedical className="text-indigo-600" />
                                New Treatment Entry
                            </h3>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Treatments Procedures</label>

                            {selectedTreatments.map((treatment, index) => (
                                <div key={index} className="flex gap-3 items-center animate-in slide-in-from-left-4 duration-300">
                                    <div className="relative flex-grow">
                                        <select
                                            value={treatment.name}
                                            onChange={(e) => handleTreatmentChange(index, e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition appearance-none"
                                            required
                                        >
                                            <option value="">Select a Treatment</option>
                                            {treatments.map((t: Treatment) => (
                                                <option key={t._id} value={t.name}>{t.name} ({t.price})</option>
                                            ))}
                                            <option value="Other / General Consultation">Other / General Consultation</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTreatmentRow(index)}
                                        className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition shadow-sm border border-rose-50"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addTreatmentRow}
                                className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                            >
                                <FaPlus /> Add More Treatment
                            </button>
                        </div>

                        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border-2 border-indigo-100/50 md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <FaRupeeSign /> Billing Summary
                                </h4>
                                <span className="text-2xl font-black text-indigo-800 tracking-tight">₹{totalCost.toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1 px-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subtotal (Procedures)</span>
                                    <div className="font-black text-gray-700 text-lg">₹{totalBasePrice.toLocaleString()}</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        Adjustments / Extra
                                    </label>
                                    <input
                                        type="number"
                                        value={additionalCost}
                                        onChange={(e) => setAdditionalCost(parseInt(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="w-full bg-white border-2 border-indigo-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Observation Notes</label>
                                <button
                                    type="button"
                                    onClick={() => setNotes("Procedure: \nObservation: \nMedication: \nFollow-up: ")}
                                    className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition"
                                >
                                    USE TEMPLATE
                                </button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Details about the procedure, next steps, or patient allergies observed..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prescription / Medication</label>
                            <textarea
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                placeholder="List medicines, dosage, and duration..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition min-h-[100px] resize-none"
                            />
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-indigo-500 uppercase tracking-wider mb-2 block">🏥 Treatment Session (In-Clinic Administration)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CLINIC_DRUGS.map(drug => (
                                            <button
                                                key={drug.name}
                                                type="button"
                                                onClick={() => appendToPrescription(drug)}
                                                className="text-[10px] font-black px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition active:scale-95 border border-indigo-100"
                                            >
                                                + {drug.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mb-2 block">📝 Prescription List (Home Use)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {HOME_DRUGS.map(drug => (
                                            <button
                                                key={drug.name}
                                                type="button"
                                                onClick={() => appendToPrescription(drug)}
                                                className="text-[10px] font-black px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition active:scale-95 border border-emerald-100"
                                            >
                                                + {drug.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition active:scale-95 flex items-center gap-2"
                            >
                                <FaNotesMedical /> Finalize Record
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Activity Feed Timeline */}
            <div className="relative pl-4 sm:pl-8 md:pl-10 space-y-10 border-l-2 border-indigo-100/50 sm:border-l-0 ml-1 sm:ml-0">
                {/* Timeline Line (Desktop Gradient) */}
                <div className="hidden sm:block absolute left-[15px] md:left-[19px] top-4 bottom-4 w-1 bg-gradient-to-b from-blue-600 via-indigo-600 to-gray-200 rounded-full opacity-20"></div>

                {records.length > 0 ? (
                    records.map((record, index) => {
                        const isEditingThis = editingRecordId === record._id;

                        return (
                            <div key={record._id} className="relative group">
                                {/* Dot */}
                                <div className="absolute -left-[28px] md:-left-[32px] top-6 w-6 h-6 rounded-full bg-white border-4 border-blue-600 shadow-lg group-hover:scale-125 transition z-10 hidden sm:block"></div>

                                {/* Record Card */}
                                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative">
                                    {isEditingThis ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Treatment Procedures</label>
                                                    <input
                                                        type="text"
                                                        value={editForm?.treatmentName}
                                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, treatmentName: e.target.value } : null)}
                                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={editForm?.cost}
                                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, cost: parseInt(e.target.value) || 0 } : null)}
                                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                                <textarea
                                                    value={editForm?.notes}
                                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-medium text-gray-500 min-h-[60px]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-emerald-600">Prescription</label>
                                                <textarea
                                                    value={editForm?.prescription}
                                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, prescription: e.target.value } : null)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-medium text-emerald-700 min-h-[150px]"
                                                />
                                                <div className="space-y-3 mt-3">
                                                    <div>
                                                        <label className="text-[8px] font-black text-indigo-500 uppercase tracking-wider mb-1 block">In-Clinic Session</label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {CLINIC_DRUGS.map(drug => (
                                                                <button
                                                                    key={drug.name}
                                                                    type="button"
                                                                    onClick={() => appendToEditPrescription(drug)}
                                                                    className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition active:scale-95 border border-indigo-100"
                                                                >
                                                                    + {drug.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-black text-emerald-500 uppercase tracking-wider mb-1 block">Home Prescription</label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {HOME_DRUGS.map(drug => (
                                                                <button
                                                                    key={drug.name}
                                                                    type="button"
                                                                    onClick={() => appendToEditPrescription(drug)}
                                                                    className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-600 hover:text-white transition active:scale-95 border border-emerald-100"
                                                                >
                                                                    + {drug.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button onClick={handleEditCancel} className="px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-600 transition">Cancel</button>
                                                <button onClick={() => handleEditSave(record._id)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition">Update</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                            <div className="space-y-4 flex-grow">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-2">
                                                        <FaCalendarAlt />
                                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-gray-100 flex items-center gap-2">
                                                        <FaStethoscope />
                                                        Treatment Entry
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditStart(record); }}
                                                            className="flex items-center gap-2 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                                            title="Edit Record"
                                                        >
                                                            Edit <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        {isEditingProfile && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record._id); }}
                                                                className="flex items-center gap-2 p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition shadow-sm"
                                                                title="Delete Record"
                                                            >
                                                                Delete <FaTimes size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => toggleExpand(record._id)}
                                                    className="cursor-pointer"
                                                >
                                                    <h3 className="text-md sm:text-xl md:text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight flex items-center gap-3">
                                                        {record.treatmentName}
                                                        <svg
                                                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedRecords[record._id] ? 'rotate-180' : ''}`}
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </h3>

                                                    {expandedRecords[record._id] && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100/50">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Observations</p>
                                                                <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                                                                    {record.notes || 'No specific clinical notes were recorded.'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100/50">
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Prescription & Medication</p>
                                                                <div className="space-y-3">
                                                                    {(() => {
                                                                        if (!record.prescription) return <p className="text-sm font-medium text-gray-400 italic">No medicines prescribed.</p>;

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

                                                                        const renderPrescriptionLine = (line: string, colorClass: string) => {
                                                                            // Extract medicine name (everything before the first parenthesis)
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

                                                                        const homeSection = homeLines.length > 0 && (
                                                                            <div className="space-y-1.5">
                                                                                {homeLines.map((line, i) => (
                                                                                    <div key={`home-${i}`}>
                                                                                        {renderPrescriptionLine(line, 'text-emerald-600')}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        );

                                                                        const clinicSection = clinicLines.length > 0 && (
                                                                            <div className="space-y-1.5">
                                                                                {homeLines.length > 0 && <hr className="border-emerald-100/50 my-3" />}
                                                                                {clinicLines.map((line, i) => (
                                                                                    <div key={`clinic-${i}`} className="flex items-center gap-2 flex-wrap">
                                                                                        {renderPrescriptionLine(line, 'text-indigo-600')}
                                                                                        <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">(used in treatment)</span>
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
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 self-start md:self-center">
                                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Total Fee</p>
                                                <p className="text-xl md:text-2xl font-black text-emerald-700 flex items-center gap-1">
                                                    <FaRupeeSign className="text-sm md:text-lg" />
                                                    {record.cost.toLocaleString()}
                                                </p>
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
