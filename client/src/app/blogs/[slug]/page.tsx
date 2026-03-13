'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaArrowLeft, FaShareAlt, FaLinkedin, FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';
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
            <div className="bg-white border-b border-gray-100 sticky top-20 z-40 backdrop-blur-md bg-white/80">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/blogs" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all group font-black uppercase text-[10px] tracking-widest">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>All Blogs</span>
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 px-4 py-2 rounded-xl transition-all border border-gray-100 font-black uppercase text-[10px] tracking-widest"
                        >
                            <FaShareAlt />
                            <span>Share</span>
                        </button>

                        {showShareMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-1 min-w-[180px] z-50 animate-fadeIn scale-100 origin-top-right transition-transform">
                                    <h4 className="px-3 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 mb-1">Share Insight</h4>
                                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><FaWhatsapp /></div>
                                        <span>WhatsApp</span>
                                    </button>
                                    <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><FaFacebook /></div>
                                        <span>Facebook</span>
                                    </button>
                                    <button onClick={() => handleShare('twitter')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-400 rounded-xl transition">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400"><FaTwitter /></div>
                                        <span>Twitter/X</span>
                                    </button>
                                    <button onClick={() => handleShare('linkedin')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700"><FaLinkedin /></div>
                                        <span>LinkedIn</span>
                                    </button>
                                    <div className="border-t border-gray-50 mt-1 pt-1">
                                        <button onClick={() => handleShare('copy')} className="flex items-center gap-3 w-full p-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FaLink /></div>
                                            <span>Copy Link</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 pt-12">
                {/* Meta Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {blog.tags.map(tag => (
                            <span key={tag} className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-gray-400 text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
                            <FaUser className="text-blue-500" />
                            <span>{blog.author}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {blog.imageUrl && (
                    <div className="mb-16 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-500/10 border-8 border-white">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto" />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg prose-blue max-w-none text-gray-700 font-medium leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Share Section */}
                <div className="mt-20 pt-12 border-t border-gray-100">
                    <h3 className="text-center text-gray-400 font-black uppercase tracking-widest text-xs mb-8">Share this insight</h3>
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <FaLinkedin />
                        </button>
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <FaFacebook />
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <FaTwitter />
                        </button>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <FaWhatsapp />
                        </button>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-20 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[40px] p-12 text-center text-white relative overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Ready for a checkup?</h2>
                        <p className="text-blue-100 mb-10 font-medium text-lg">Schedule your appointment today for a healthier smile.</p>
                        <Link href="/contact" className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition shadow-xl">
                            Book Appointment Now
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
