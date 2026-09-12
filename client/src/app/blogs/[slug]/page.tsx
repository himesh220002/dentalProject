'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaArrowLeft, FaShareAlt, FaLinkedin, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaClock } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    imageUrl?: string;
    tags: string[];
    createdAt: string;
}

export default function BlogDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const { clinicData, language } = useClinic();

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            setScrollProgress(totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || 'Clinic Insights';

    const handleShare = async (platform?: string) => {
        if (!platform && navigator.share) {
            try { await navigator.share({ title: shareTitle, url: shareUrl }); return; } catch {}
        }
        let url = '';
        switch (platform) {
            case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
            case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`; break;
            case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
            case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`; break;
            case 'copy': navigator.clipboard.writeText(shareUrl); alert('Link copied to clipboard!'); return;
        }
        if (url) window.open(url, '_blank');
        setShowShareMenu(false);
    };

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/${slug}`);
                setBlog(response.data);
            } catch (error) { console.error('Error fetching blog:', error); }
            finally { setLoading(false); }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-2 border-black/10 border-t-[#0a0a0b] rounded-full animate-spin" />
                <span className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Loading insight…</span>
            </div>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-[20px] border border-black/5 p-10 max-w-md w-full">
                <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">Article not found</h1>
                <p className="text-[13px] leading-6 text-neutral-500 mt-2">This insight may have been moved or removed.</p>
                <Link href="/blogs" className="mt-6 inline-flex items-center justify-center gap-2 bg-[#0a0a0b] text-white px-6 py-3 rounded-full text-[13px] font-medium hover:bg-black transition">Back to insights</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-12 sm:pb-16">
            {/* Sticky bar */}
            <div className="sticky top-0 z-40 bg-[#fcfcfc]/80 backdrop-blur-xl border-b border-black/5">
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#0a0a0b] transition-all duration-150 ease-out" style={{ width: `${scrollProgress}%` }} />
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
                    <Link href="/blogs" className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[-0.01em] text-neutral-600 hover:text-[#0a0a0b] transition">
                        <span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center"><FaArrowLeft size={11} /></span>
                        <span className="hidden sm:inline">Back to insights</span><span className="sm:hidden">Back</span>
                    </Link>
                    <div className="relative">
                        <button onClick={() => setShowShareMenu(!showShareMenu)} className="inline-flex items-center gap-2 bg-white border border-black/5 hover:border-black/10 text-neutral-700 px-4 py-2 rounded-full text-[12px] font-medium transition">
                            <FaShareAlt size={11} /> Share
                        </button>
                        {showShareMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                                <div className="absolute right-0 top-full mt-3 bg-white rounded-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.10)] border border-black/5 p-2 min-w-[200px] z-50">
                                    <div className="px-3 py-2 text-[10px] tracking-[0.12em] uppercase font-medium text-neutral-400 border-b border-black/5 mb-1 text-center">Share</div>
                                    {[
                                        { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp size={14} />, cls: 'hover:bg-green-50 hover:text-green-600 text-green-600 bg-green-50' },
                                        { id: 'facebook', label: 'Facebook', icon: <FaFacebook size={14} />, cls: 'hover:bg-blue-50 hover:text-blue-600 text-blue-600 bg-blue-50' },
                                        { id: 'twitter', label: 'X (Twitter)', icon: <FaTwitter size={14} />, cls: 'hover:bg-sky-50 hover:text-sky-500 text-sky-500 bg-sky-50' },
                                        { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin size={14} />, cls: 'hover:bg-blue-50 hover:text-blue-700 text-blue-700 bg-blue-50' },
                                    ].map(item => (
                                        <button key={item.id} onClick={() => handleShare(item.id)} className="flex items-center gap-3 w-full p-2.5 text-[13px] font-medium text-neutral-700 hover:bg-[#f5f5f3] rounded-xl transition">
                                            <span className={`w-7 h-7 rounded-full grid place-items-center ${item.cls.split(' ')[2]} ${item.cls.split(' ')[3]}`}>{item.icon}</span> {item.label}
                                        </button>
                                    ))}
                                    <button onClick={() => handleShare('copy')} className="flex items-center gap-3 w-full p-2.5 text-[13px] font-medium text-neutral-700 hover:bg-[#f5f5f3] rounded-xl transition border-t border-black/5 mt-1">
                                        <span className="w-7 h-7 rounded-full bg-[#f5f5f3] border border-black/5 grid place-items-center text-neutral-500"><FaLink size={12} /></span> Copy link
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <article className="max-w-[840px] mx-auto px-4 sm:px-6 lg:px-0 pt-8 sm:pt-12">
                {/* Meta */}
                <div className="text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        {blog.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white border border-black/5 text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-600">{tag}</span>
                        ))}
                    </div>
                    <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0a0a0b]">{blog.title}</h1>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[12px] font-medium tracking-[-0.01em] text-neutral-500">
                        <span className="inline-flex items-center gap-1.5"><FaCalendarAlt size={11} className="text-neutral-400" />{new Date(blog.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="hidden sm:block w-1 h-1 rounded-full bg-black/10" />
                        <span className="inline-flex items-center gap-1.5"><FaUser size={11} className="text-neutral-400" />{blog.author}</span>
                        <span className="hidden sm:block w-1 h-1 rounded-full bg-black/10" />
                        <span className="inline-flex items-center gap-1.5"><FaClock size={11} className="text-neutral-400" />5 min read</span>
                    </div>
                </div>

                {/* Image */}
                {blog.imageUrl && (
                    <div className="mt-8 rounded-[24px] overflow-hidden border border-black/5 shadow-sm bg-white p-2">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto max-h-[520px] object-cover rounded-[16px]" />
                    </div>
                )}

                {/* Content */}
                <div className="mt-8 bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 lg:p-10 shadow-sm">
                    <div
                        className="prose prose-neutral max-w-none prose-p:text-[15px] prose-p:leading-7 prose-p:text-neutral-700 prose-headings:tracking-[-0.02em] prose-headings:text-[#0a0a0b] prose-a:text-[#0a0a0b] prose-a:underline-offset-4 prose-img:rounded-2xl prose-img:border prose-img:border-black/5"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>

                {/* Author */}
                <div className="mt-8 bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-20 h-20 rounded-full bg-[#f5f5f3] border border-black/5 p-1 overflow-hidden shrink-0">
                        <img src="/images/rendering-anime-doctor-job.jpg" alt="Author" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Written by</div>
                        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0b] mt-1">{clinicData?.doctorName || blog.author}</h3>
                        <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-neutral-400 mt-0.5">{clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief'))?.role || 'Chief Surgeon'}</p>
                        <p className="text-[13px] leading-6 text-neutral-600 mt-3">
                            {language === 'hi' ? `${clinicData?.doctorName} शीर्ष स्तर की देखभाल के लिए प्रतिबद्ध हैं। यह लेख नैदानिक अनुभव से तैयार है।` : `With years of dedicated service, ${clinicData?.doctorName} shares evidence-led guidance from clinical practice.`}
                        </p>
                        <div className="mt-3 flex gap-4 text-[12px] font-medium">
                            <Link href="/about" className="text-[#0a0a0b] hover:underline underline-offset-4">Learn more →</Link>
                            <Link href="/contact" className="text-neutral-500 hover:text-[#0a0a0b]">Book consultation →</Link>
                        </div>
                    </div>
                </div>

                {/* Share row */}
                <div className="mt-8 rounded-[20px] bg-white border border-black/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Share this insight</span>
                    <div className="flex gap-2">
                        {[
                            { id: 'whatsapp', icon: <FaWhatsapp size={14} />, label: 'WhatsApp' },
                            { id: 'linkedin', icon: <FaLinkedin size={14} />, label: 'LinkedIn' },
                            { id: 'twitter', icon: <FaTwitter size={14} />, label: 'Twitter' },
                        ].map(b => (
                            <button key={b.id} onClick={() => handleShare(b.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f3] border border-black/5 text-[12px] font-medium text-neutral-700 hover:bg-[#0a0a0b] hover:text-white hover:border-black transition-colors">
                                {b.icon} <span className="hidden sm:inline">{b.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA — homepage style */}
                <div className="mt-8 rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/[0.04] rounded-full blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">Professional care</div>
                            <h2 className="mt-3 text-[22px] sm:text-[28px] font-semibold tracking-[-0.03em] leading-[1.1]">Ready for a checkup?</h2>
                            <p className="mt-2 text-[13px] leading-6 text-white/60 max-w-[480px]">Direct consultation with {clinicData?.doctorName || 'our team'} — clear plan, transparent costs.</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-[#0a0a0b] px-6 py-3 rounded-full text-[13px] font-medium hover:bg-neutral-100 active:scale-[0.98] transition">Book now</Link>
                            <Link href="/blogs" className="inline-flex items-center justify-center bg-white/10 border border-white/15 text-white px-6 py-3 rounded-full text-[13px] font-medium hover:bg-white/15 transition">More blogs</Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
