'use client';

import { useState } from 'react';
import { FaShieldAlt, FaUserShield, FaFileContract, FaLock, FaUserCheck, FaGavel, FaClock, FaLanguage } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function PrivacyPolicy() {
    const { clinicData, language } = useClinic();

    const clinicName = clinicData?.clinicName || 'Dr. Tooth Dental Clinic';
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Bihar, India';
    const phone = clinicData?.phone || '+91 98765 43210';
    const email = clinicData?.email || 'care@drToothdental.in';

    const content = {
        en: {
            title: 'Privacy Policy',
            lastUpdated: 'Last Updated: February 2026',
            noticeTitle: '1. Notice of Collection',
            noticeText: `In compliance with the Digital Personal Data Protection (DPDP) Act, 2023 and the Information Technology Act, 2000, ${clinicName} hereby notifies all patients that we collect Sensitive Personal Data or Information (SPDI) necessary for dental healthcare services.`,
            dataCollected: 'Data Collected Includes:',
            dataItems: ['Identity Information (Name, Age, Address)', 'Contact Information (Phone, Email)', 'Medical History & Dental Radiographs (X-rays)', 'Biometric data (if applicable)'],
            purposeTitle: '2. Purpose of Collection',
            purposeText: 'All data is collected solely for the following purposes:',
            purposeItems: ['Provision of professional dental diagnosis and treatment.', 'Appointment scheduling and clinical record-keeping.', 'Maintenance of medical history as required by the Clinical Establishments Act.', 'Communication regarding treatment follow-ups and clinic alerts.'],
            rightsTitle: '3. Your Rights as a Data Principal',
            rightsText: 'Under the DPDP Act 2023, you have the following rights regarding your digital data:',
            rights: [
                { title: 'Right to Correction', desc: 'You can update or correct inaccurate personal or medical data.' },
                { title: 'Right to Erasure', desc: 'Request deletion of data once processing is no longer necessary.' },
                { title: 'Right to Withdraw Consent', desc: 'You may withdraw your consent for data processing at any time.' },
                { title: 'Right to Nomination', desc: 'Nominate an individual to manage your data in case of incapacity.' }
            ],
            retentionTitle: '4. Data Retention & Storage',
            retentionText: `We retain your clinical records for a minimum period of 3 years as mandated by the Bihar Clinical Establishments Act. Data is stored securely on servers located within the territory of India to ensure maximum protection under local laws.`,
            grievanceTitle: '5. Grievance Redressal',
            grievanceText: 'For any concerns regarding your data or to exercise your rights, please contact our Data Protection Officer (DPO) / Grievance Officer:',
            officerName: 'Officer Name:',
            officerAddress: 'Address:',
            officerContact: 'Contact:',
            grievanceNote: 'In accordance with the DPDP Act 2023, all grievances will be addressed within 30 days of receipt.'
        },
        hi: {
            title: 'गोपनीयता नीति',
            lastUpdated: 'अंतिम अपडेट: फरवरी 2026',
            noticeTitle: '1. संग्रह की सूचना',
            noticeText: `डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, 2023 और सूचना प्रौद्योगिकी अधिनियम, 2000 के अनुपालन में, ${clinicName} सभी रोगियों को सूचित करता है कि हम दंत चिकित्सा सेवाओं के लिए आवश्यक संवेदनशील व्यक्तिगत डेटा या सूचना (SPDI) एकत्र करते हैं।`,
            dataCollected: 'एकत्र किए गए डेटा में शामिल हैं:',
            dataItems: ['पहचान जानकारी (नाम, आयु, पता)', 'संपर्क जानकारी (फोन, ईमेल)', 'चिकित्सा इतिहास और डेंटल एक्स-रे', 'बायोमेट्रिक डेटा (यदि लागू हो)'],
            purposeTitle: '2. संग्रह का उद्देश्य',
            purposeText: 'सारा डेटा पूरी तरह से निम्नलिखित उद्देश्यों के लिए एकत्र किया जाता है:',
            purposeItems: ['पेशेवर दंत निदान और उपचार का प्रावधान।', 'नियुक्ति समय-निर्धारण और नैदानिक रिकॉर्ड रखना।', 'क्लिनिकल एस्टेब्लिशमेंट एक्ट के अनुसार चिकित्सा इतिहास का रखरखाव।', 'उपचार फॉलो-अप और क्लिनिक अलर्ट के बारे में संचार।'],
            rightsTitle: '3. डेटा प्रिंसिपल के रूप में आपके अधिकार',
            rightsText: 'DPDP अधिनियम 2023 के तहत, आपके डिजिटल डेटा के संबंध में आपके पास निम्नलिखित अधिकार हैं:',
            rights: [
                { title: 'सुधार का अधिकार', desc: 'आप गलत व्यक्तिगत या चिकित्सा डेटा को अपडेट या सही कर सकते हैं।' },
                { title: 'मिटाने का अधिकार', desc: 'एक बार प्रोसेसिंग की आवश्यकता नहीं होने पर डेटा को हटाने का अनुरोध करें।' },
                { title: 'सहमति वापस लेने का अधिकार', desc: 'आप किसी भी समय डेटा प्रोसेसिंग के लिए अपनी सहमति वापस ले सकते हैं।' },
                { title: 'नामांकन का अधिकार', desc: 'अक्षमता के मामले में अपने डेटा का प्रबंधन करने के लिए किसी व्यक्ति को नामांकित करें।' }
            ],
            retentionTitle: '4. डेटा प्रतिधारण और भंडारण',
            retentionText: `हम बिहार क्लिनिकल एस्टेब्लिशमेंट एक्ट के आदेशानुसार न्यूनतम 3 वर्षों की अवधि के लिए आपके नैदानिक ​​रिकॉर्ड रखते हैं। स्थानीय कानूनों के तहत अधिकतम सुरक्षा सुनिश्चित करने के लिए डेटा भारत के क्षेत्र में स्थित सर्वरों पर सुरक्षित रूप से संग्रहीत किया जाता है।`,
            grievanceTitle: '5. शिकायत निवारण',
            grievanceText: 'अपने डेटा के संबंध में किसी भी चिंता के लिए या अपने अधिकारों का उपयोग करने के लिए, कृपया हमारे डेटा सुरक्षा अधिकारी (DPO) / शिकायत अधिकारी से संपर्क करें:',
            officerName: 'अधिकारी का नाम:',
            officerAddress: 'पता:',
            officerContact: 'संपर्क:',
            grievanceNote: 'DPDP अधिनियम 2023 के अनुसार, सभी शिकायतों का समाधान प्राप्ति के 30 दिनों के भीतर किया जाएगा।'
        }
    };

    const t = content[language];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative">

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-3xl mb-4">
                    <FaShieldAlt className="text-4xl text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{t.title}</h1>
                <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">{t.lastUpdated}</p>
                <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sm:p-12 space-y-10 leading-relaxed text-gray-700">
                {/* Section 1 */}
                <section className="space-y-4 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaUserShield className="text-blue-500" /> {t.noticeTitle}
                    </h2>
                    <p>{t.noticeText}</p>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <div className="text-blue-600 mt-1"><FaLock /></div>
                        <div>
                            <p className="font-bold text-blue-900 mb-1">{t.dataCollected}</p>
                            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                                {t.dataItems.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="space-y-4 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaFileContract className="text-teal-500" /> {t.purposeTitle}
                    </h2>
                    <p>{t.purposeText}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        {t.purposeItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-4 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaUserCheck className="text-emerald-500" /> {t.rightsTitle}
                    </h2>
                    <p>{t.rightsText}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {t.rights.map((right, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                                <h4 className="font-black text-gray-900 text-sm mb-1">{right.title}</h4>
                                <p className="text-xs text-gray-500 font-medium">{right.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4 */}
                <section className="space-y-4 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaClock className="text-orange-500" /> {t.retentionTitle}
                    </h2>
                    <p>{t.retentionText}</p>
                </section>

                {/* Section 5 */}
                <section className="space-y-4 bg-slate-900 p-8 rounded-[2rem] text-white text-left">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FaGavel className="text-blue-400" /> {t.grievanceTitle}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.grievanceText}</p>
                    <div className="mt-6 space-y-3 font-medium">
                        <p className="flex flex-col sm:flex-row sm:justify-between border-b border-white/10 pb-2 italic">
                            <span className="text-gray-500">{t.officerName}</span>
                            <span>{clinicData?.doctorName || 'Dr. Tooth'}</span>
                        </p>
                        <p className="flex flex-col sm:flex-row sm:justify-between border-b border-white/10 pb-2 italic">
                            <span className="text-gray-500">{t.officerAddress}</span>
                            <span className="sm:text-right">{address}</span>
                        </p>
                        <p className="flex flex-col sm:flex-row sm:justify-between border-b border-white/10 pb-2 italic text-left">
                            <span className="text-gray-500">{t.officerContact}</span>
                            <span>{phone} | {email}</span>
                        </p>
                    </div>
                    <p className="mt-6 text-xs text-gray-500 italic">{t.grievanceNote}</p>
                </section>
            </div>
        </div>
    );
}
