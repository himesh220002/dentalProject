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
            setScrollProgress((currentScroll / totalScroll) * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || 'Clinic Insights';

    const handleShare = async (platform?: string) => {
        if (!platform && navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl
                });
                return;
            } catch (err) {
                console.log('Share failed:', err);
            }
        }

        let url = '';
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
                return;
        }

        if (url) window.open(url, '_blank');
        setShowShareMenu(false);
    };

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/${slug}`);
                setBlog(response.data);
            } catch (error) {
                console.error('Error fetching blog:', error);
                // router.push('/blogs');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Insights...</span>
            </div>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
            <p className="text-gray-500 font-bold mb-8">Oops! This article doesn't seem to exist.</p>
            <Link href="/blogs" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200">
                Back to Blogs
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Navigation Header */}
            <div className="bg-white/90 border-b border-gray-100 sticky top-20 z-40 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/blogs" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all group font-black uppercase text-[10px] tracking-widest">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Insights</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 px-4 py-2 rounded-xl transition-all border border-gray-100 font-black uppercase text-[10px] tracking-widest"
                            >
                                <FaShareAlt />
                                <span className="hidden sm:inline">Share</span>
                            </button>

                            {showShareMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)}></div>
                                    <div className="absolute right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-1 min-w-[200px] z-50 animate-fadeIn origin-top-right transition-transform">
                                        <h4 className="px-3 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 mb-1 text-center">Spread the Insight</h4>
                                        <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><FaWhatsapp size={14} /></div>
                                            <span>WhatsApp</span>
                                        </button>
                                        <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><FaFacebook size={14} /></div>
                                            <span>Facebook</span>
                                        </button>
                                        <button onClick={() => handleShare('twitter')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-400 rounded-xl transition">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400"><FaTwitter size={14} /></div>
                                            <span>X (Twitter)</span>
                                        </button>
                                        <button onClick={() => handleShare('linkedin')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700"><FaLinkedin size={14} /></div>
                                            <span>LinkedIn</span>
                                        </button>
                                        <button onClick={() => handleShare('copy')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition border-t border-gray-50 mt-1">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FaLink size={14} /></div>
                                            <span>Copy Link</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Reading Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[3px] bg-blue-600 transition-all duration-150 ease-out z-50" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <article className="max-w-4xl mx-auto px-4 md:px-0 pt-16">
                {/* Meta Header */}
                <div className="text-center mb-16 px-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                        {blog.tags.map(tag => (
                            <span key={tag} className="bg-blue-600/5 text-blue-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-100/50">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-10 leading-[1.05] tracking-tighter">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{new Date(blog.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l pl-8 border-gray-200 hidden sm:flex">
                            <FaUser className="text-blue-500" />
                            <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l pl-8 border-gray-200">
                            <FaClock className="text-blue-500" />
                            <span>5 MIN READ</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {blog.imageUrl && (
                    <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10 border-4 sm:border-8 border-white group">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg prose-blue max-w-none text-gray-700 font-medium leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Author Bio Section */}
                <div className="mt-24 p-8 sm:p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-50 p-2 overflow-hidden shrink-0 shadow-inner">
                        <img src="/images/rendering-anime-doctor-job.jpg" alt="Author" className="w-full h-full object-cover rounded-full shadow-lg" />
                    </div>
                    <div className="flex-grow text-center md:text-left space-y-4">
                        <div>
                            <span className="text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] mb-2 block">Written By</span>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{clinicData?.doctorName || blog.author}</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{clinicData?.consultants.find(c => c.role.toLowerCase().includes('chief'))?.role || 'Chief Surgeon'}</p>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed max-w-2xl">
                            {language === 'hi'
                                ? `${clinicData?.doctorName} शीर्ष स्तर की दंत चिकित्सा देखभाल प्रदान करने के लिए प्रतिबद्ध हैं। यह लेख उनके वर्षों के अनुभव और रोगियों के प्रति समर्पण का परिणाम है।`
                                : `With years of dedicated service in dentistry, ${clinicData?.doctorName} is committed to providing top-tier care. This insight is crafted from clinical experience and a passion for oral health education.`}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <Link href="/about" className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline underline-offset-4">Learn More About {clinicData?.doctorName}</Link>
                            <span className="text-gray-200 hidden sm:inline">|</span>
                            <Link href="/contact" className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline underline-offset-4">Book Consultation</Link>
                        </div>
                    </div>
                </div>

                {/* Share Section */}
                <div className="mt-24 pt-16 border-t border-gray-100">
                    <h3 className="text-center text-gray-400 font-black uppercase tracking-widest text-[10px] mb-10">Share this clinical insight</h3>
                    <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-green-600 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1 font-bold text-xs"
                        >
                            <FaWhatsapp /> <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-blue-700 hover:bg-blue-700 hover:text-white transition-all transform hover:-translate-y-1 font-bold text-xs"
                        >
                            <FaLinkedin /> <span className="hidden sm:inline">LinkedIn</span>
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-sky-500 hover:bg-sky-500 hover:text-white transition-all transform hover:-translate-y-1 font-bold text-xs"
                        >
                            <FaTwitter /> <span className="hidden sm:inline">Twitter</span>
                        </button>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-24 bg-gray-900 rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-16 text-center text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-teal-500/10 opacity-50"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border border-blue-500/20">
                            Professional Care
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">Ready for a<br className="sm:hidden" /> Professional Checkup?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto font-medium text-base sm:text-lg">Take the first step towards a healthier, brighter smile. Direct consultation with {clinicData?.doctorName} available.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact" className="w-full sm:w-auto bg-white text-gray-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                                Book Appointment Now
                            </Link>
                            <Link href="/blogs" className="w-full sm:w-auto bg-gray-800 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-700 transition-all active:scale-95">
                                Read More Blogs
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
