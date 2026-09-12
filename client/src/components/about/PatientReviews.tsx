'use client';
import { useMemo } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';
import { translations } from '@/constants/translations';

export default function PatientReviews() {
    const { language, clinicData } = useClinic();
    const t = translations[language as keyof typeof translations];

    const reviews = useMemo(() => {
        const clinicName = clinicData?.clinicName || 'ToothOp';
        const data = {
            en: [
                { name: 'Monika J.', text: `${clinicName} is incredibly gentle. I used to be terrified of the dentist, but now I look forward to my checkups!`, rating: 5, treatment: 'Dental Cleaning' },
                { name: 'Monty R.', text: 'The best clinic in town. Modern equipment, friendly staff, and the treatments are actually painless.', rating: 5, treatment: 'Root Canal' },
                { name: 'Priya S.', text: `I got my braces done here. The transformation is amazing! ${clinicName} explained everything clearly at every step.`, rating: 5, treatment: 'Orthodontics' },
                { name: 'Rahul D.', text: "Excellent service and very hygienic. Highly recommended for anyone looking for quality dental care.", rating: 5, treatment: 'Teeth Whitening' }
            ],
            hi: [
                { name: 'मोनिका जे.', text: `${clinicName} अविश्वसनीय रूप से कोमल हैं। मैं पहले दंत चिकित्सक से बहुत डरती थी, लेकिन अब मैं अपने चेकअप का इंतजार करती हूं!`, rating: 5, treatment: 'दांतों की सफाई' },
                { name: 'मोंटी आर.', text: 'शहर का सबसे अच्छा क्लिनिक। आधुनिक उपकरण, मित्रवत कर्मचारी, और उपचार वास्तव में दर्द रहित हैं।', rating: 5, treatment: 'रूट कैनाल' },
                { name: 'प्रिया एस.', text: `मैंने अपने ब्रेसिज़ यहाँ लगवाए हैं। बदलाव अद्भुत है! ${clinicName} ने हर कदम पर सब कुछ स्पष्ट रूप से समझाया।`, rating: 5, treatment: 'ऑर्थोडॉन्टिक्स' },
                { name: 'राहुल डी.', text: "बेहतरीन सेवा और बहुत स्वच्छ। गुणवत्तापूर्ण दंत चिकित्सा देखभाल की तलाश करने वाले किसी भी व्यक्ति के लिए अत्यधिक अनुशंसित।", rating: 5, treatment: 'दांत चमकाना' }
            ]
        };
        return data[language as keyof typeof data] || data.en;
    }, [language, clinicData]);

    return (
        <section className="py-10 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <div className="text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Patient voices ]</div>
                    <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-none text-[#0a0a0b]">{t.aboutReviews.title}</h2>
                    <p className="mt-2 text-[14px] leading-6 text-neutral-500 max-w-[560px]">{t.aboutReviews.subtitle}</p>
                </div>
                <a href="https://google.com/search?q=dr+tooth+dental+clinic+reviews" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] hover:gap-3 transition-all duration-200"> {t.aboutReviews.seeMore} <span>→</span></a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="group bg-white p-6 sm:p-7 rounded-[20px] border border-black/5 hover:border-black/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden"
                    >
                        <FaQuoteLeft className="absolute -top-1 -right-2 text-6xl text-[#f5f5f3] group-hover:text-black/[0.04] transition-colors" />
                        <div className="relative">
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-[#0a0a0b] text-[12px]" />)}
                            </div>
                            <p className="text-[14px] leading-7 text-neutral-700 font-medium">“{review.text}”</p>
                            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-black/5">
                                <div className="w-9 h-9 rounded-full bg-[#0a0a0b] text-white grid place-items-center text-[13px] font-semibold">{review.name.charAt(0)}</div>
                                <div>
                                    <h4 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{review.name}</h4>
                                    <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-500">{review.treatment}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 sm:hidden text-center">
                <a href="https://google.com/search?q=dr+tooth+dental+clinic+reviews" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0a0a0b]">{t.aboutReviews.seeMore} →</a>
            </div>
        </section>
    );
}
