'use client';

import { useState } from 'react';
import axios from 'axios';

const AddPatientForm = ({ onPatientAdded }: { onPatientAdded: () => void }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('-__-');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, {
                name,
                age: Number(age),
                gender,
                contact,
                email: email.trim().toLowerCase() || undefined,
                address: address.trim() || '-__-',
                medicalHistory: medicalHistory.split(',').map(item => item.trim())
            });
            setName('');
            setAge('');
            setGender('-__-');
            setContact('');
            setEmail('');
            setAddress('');
            setMedicalHistory('');
            setShowForm(false);
            onPatientAdded();
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Failed to add patient');
        }
    };

    return (
        <div className="mb-6">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    + Add New Patient
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">New Patient Details</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="-__-">-__-</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Contact (10 Digits)</label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setContact(val);
                            }}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline font-bold transition-colors ${contact.length === 10 ? 'text-emerald-600' : contact.length > 0 ? 'text-rose-600' : 'text-gray-700'
                                }`}
                            placeholder="e.g. 9876543210"
                            required
                        />
                        {contact.length > 0 && contact.length < 10 && (
                            <p className="text-[10px] text-rose-500 font-bold mt-1">Must be exactly 10 digits ({contact.length}/10)</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="patient@example.com"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">Used for linking patient to their Google Account automatically.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Medical History (comma separated)</label>
                        <textarea
                            value={medicalHistory}
                            onChange={(e) => setMedicalHistory(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Save Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddPatientForm;
