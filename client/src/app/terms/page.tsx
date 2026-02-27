'use client';

import { useState } from 'react';
import { FaFileSignature, FaMoneyCheckAlt, FaVideo, FaClinicMedical, FaBalanceScale, FaMapMarkerAlt, FaFileMedicalAlt, FaLanguage } from 'react-icons/fa';
import { useClinic } from '../../context/ClinicContext';

export default function TermsOfService() {
    const { clinicData, language } = useClinic();

    const clinicName = clinicData?.clinicName || 'Dr. Tooth Dental Clinic';
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Bihar, India';
    const city = clinicData?.address.city || 'Katihar';

    const content = {
        en: {
            title: 'Terms of Service',
            subtitle: 'Agreement for Clinical Services',
            intro: `Welcome to ${clinicName}. By accessing our website or utilizing our clinical services, you agree to be bound by these terms, which comply with the Indian Contract Act and local clinical regulations.`,
            sec1Title: '1. Clinical Establishment Compliance',
            sec1Text: `${clinicName} is a registered entity under the Bihar Clinical Establishments (Registration and Regulation) Act. We adhere strictly to the standards of healthcare quality and patient safety mandated by the State Government of Bihar.`,
            sec2Title: '2. Pricing & Transparency',
            sec2Text: 'As per the mandates of the Bihar State Health Department, we maintain full transparency in our pricing:',
            sec2Items: [
                'A standard "Schedule of Charges" for all dental procedures is available for physical inspection at the clinic front desk.',
                'Estimates provided during consultation are subject to change based on the clinical complexity.',
                "Payments must be settled as per the clinic's billing policy at the time of service."
            ],
            sec3Title: '3. Digital Consent & IT Act',
            sec3Text: 'In accordance with the Information Technology Act, 2000:',
            sec3Items: [
                'The use of One-Time Passwords (OTP) for login constitutes a valid electronic signature.',
                'Digital records and consent forms are legally binding and stored as per Indian encryption standards.'
            ],
            sec4Title: '4. Tele-consultation Guidelines',
            sec4Text: 'Any remote or video consultations provided through this platform follow the Telemedicine Practice Guidelines (2020). Tele-consultation is intended for follow-ups and preliminary advice; it is not a substitute for clinical physical examination.',
            sec5Title: '5. Professional Conduct & Ethics',
            sec5Text: 'Our practitioners are registered with the Bihar State Dental Council and the Dental Council of India (DCI).',
            sec5Note: 'Note: This website is for informational purposes only. In compliance with DCI ethics, we do not claim "guaranteed cures" or post misleading advertisements.',
            sec6Title: '6. Jurisdiction & Governing Law',
            sec6Text: 'These terms shall be governed by and construed in accordance with the laws of India and the State of Bihar.',
            jurisdictionNote: `Any legal disputes or claims arising out of the use of this website or our services shall be settled exclusively in the courts of ${city} / Patna, Bihar.`,
            footerNote: `© ${new Date().getFullYear()} ${clinicName}. All Rights Reserved. Compliant with Bihar Clinical Establishments Act.`
        },
        hi: {
            title: 'सेवा की शर्तें',
            subtitle: 'नैदानिक ​​सेवाओं के लिए समझौता',
            intro: `${clinicName} में आपका स्वागत है। हमारी वेबसाइट पर जाकर या हमारी नैदानिक ​​सेवाओं का उपयोग करके, आप इन शर्तों से बंधने के लिए सहमत होते हैं, जो भारतीय अनुबंध अधिनियम और स्थानीय नैदानिक ​​विनियमों का पालन करती हैं।`,
            sec1Title: '1. क्लिनिकल एस्टेब्लिशमेंट अनुपालन',
            sec1Text: `${clinicName} बिहार क्लिनिकल एस्टेब्लिशमेंट (पंजीकरण और विनियमन) अधिनियम के तहत एक पंजीकृत इकाई है। हम बिहार सरकार द्वारा आदेशित स्वास्थ्य देखभाल गुणवत्ता और रोगी सुरक्षा के मानकों का सख्ती से पालन करते हैं।`,
            sec2Title: '2. मूल्य निर्धारण और पारदर्शिता',
            sec2Text: 'बिहार राज्य स्वास्थ्य विभाग के आदेशानुसार, हम अपने मूल्य निर्धारण में पूर्ण पारदर्शिता बनाए रखते हैं:',
            sec2Items: [
                'सभी दंत प्रक्रियाओं के लिए एक मानक "शुल्क अनुसूची" क्लिनिक फ्रंट डेस्क पर भौतिक निरीक्षण के लिए उपलब्ध है।',
                'परामर्श के दौरान दिए गए अनुमान नैदानिक ​​जटिलता के आधार पर परिवर्तन के अधीन हैं।',
                'भुगतान सेवा के समय क्लिनिक की बिलिंग नीति के अनुसार किया जाना चाहिए।'
            ],
            sec3Title: '3. डिजिटल सहमति और आईटी अधिनियम',
            sec3Text: 'सूचना प्रौद्योगिकी अधिनियम, 2000 के अनुसार:',
            sec3Items: [
                'लॉगिन के लिए वन-टाइम पासवर्ड (OTP) का उपयोग एक वैध इलेक्ट्रॉनिक हस्ताक्षर माना जाता है।',
                'डिजिटल रिकॉर्ड और सहमति पत्र कानूनी रूप से बाध्यकारी हैं और भारतीय एन्क्रिप्शन मानकों के अनुसार संग्रहीत किए जाते हैं।'
            ],
            sec4Title: '4. टेली-परामर्श दिशानिर्देश',
            sec4Text: 'इस प्लेटफॉर्म के माध्यम से प्रदान किया गया कोई भी रिमोट या वीडियो परामर्श टेलीमेडिसिन प्रैक्टिस गाइडलाइंस (2020) का पालन करता है। टेली-परामर्श फॉलो-अप और प्रारंभिक सलाह के लिए है; यह नैदानिक ​​शारीरिक परीक्षण का विकल्प नहीं है।',
            sec5Title: '5. पेशेवर आचरण और नैतिकता',
            sec5Text: 'हमारे चिकित्सक बिहार राज्य दंत चिकित्सा परिषद और भारतीय दंत चिकित्सा परिषद (DCI) के साथ पंजीकृत हैं।',
            sec5Note: 'नोट: यह वेबसाइट केवल सूचनात्मक उद्देश्यों के लिए है। DCI नैतिकता के अनुपालन में, हम "गारंटीकृत इलाज" का दावा नहीं करते हैं या भ्रामक विज्ञापन पोस्ट नहीं करते हैं।',
            sec6Title: '6. क्षेत्राधिकार और शासी कानून',
            sec6Text: 'ये शर्तें भारत और बिहार राज्य के कानूनों के अनुसार शासित और व्याख्यायित की जाएंगी।',
            jurisdictionNote: `इस वेबसाइट या हमारी सेवाओं के उपयोग से उत्पन्न होने वाले किसी भी कानूनी विवाद या दावों का निपटारा विशेष रूप से ${city} / पटना, बिहार की अदालतों में किया जाएगा।`,
            footerNote: `© ${new Date().getFullYear()} ${clinicName}। सर्वाधिकार सुरक्षित। बिहार क्लिनिकल एस्टेब्लिशमेंट एक्ट के अनुपालन में।`
        }
    };

    const t = content[language];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative text-left">

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-3xl mb-4">
                    <FaFileSignature className="text-4xl text-indigo-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{t.title}</h1>
                <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">{t.subtitle}</p>
                <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sm:p-12 space-y-10 leading-relaxed text-gray-700">
                <p className="text-sm font-medium italic border-l-4 border-indigo-500 pl-4 bg-indigo-50 py-3 rounded-r-xl">
                    {t.intro}
                </p>

                {/* Section 1 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaClinicMedical className="text-indigo-500" /> {t.sec1Title}
                    </h2>
                    <p>{t.sec1Text}</p>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaMoneyCheckAlt className="text-emerald-500" /> {t.sec2Title}
                    </h2>
                    <p>{t.sec2Text}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        {t.sec2Items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaFileMedicalAlt className="text-blue-500" /> {t.sec3Title}
                    </h2>
                    <p>{t.sec3Text}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        {t.sec3Items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaVideo className="text-rose-500" /> {t.sec4Title}
                    </h2>
                    <p>{t.sec4Text}</p>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaBalanceScale className="text-slate-700" /> {t.sec5Title}
                    </h2>
                    <p>{t.sec5Text}</p>
                    <p className="bg-gray-50 p-4 rounded-xl text-xs font-medium border-l-4 border-gray-300">
                        <strong>{t.sec5Note}</strong>
                    </p>
                </section>

                {/* Section 6 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-left">
                        <FaMapMarkerAlt className="text-red-500" /> {t.sec6Title}
                    </h2>
                    <p>{t.sec6Text}</p>
                    <div className="bg-slate-900 p-6 rounded-2xl text-white">
                        <p className="text-sm font-bold opacity-90">
                            {t.jurisdictionNote}
                        </p>
                    </div>
                </section>
            </div>

            {/* Footer Note */}
            <div className="text-center text-gray-400 text-xs py-8">
                <p>{t.footerNote}</p>
            </div>
        </div>
    );
}
