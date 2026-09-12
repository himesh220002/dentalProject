'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch } from 'react-icons/fa';
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

export default function BlogListPage() {
    const { language } = useClinic();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState<string>('All');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`);
                setBlogs(response.data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const allTags = useMemo(() => {
        const s = new Set<string>();
        blogs.forEach(b => b.tags.forEach(t => s.add(t)));
        return ['All', ...Array.from(s)];
    }, [blogs]);

    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog => {
            const matchesSearch = !searchTerm || blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesTag = activeTag === 'All' || blog.tags.includes(activeTag);
            return matchesSearch && matchesTag;
        });
    }, [blogs, searchTerm, activeTag]);

    return (
        <div className="min-h-screen bg-[#fcfcfc]">
            {/* Header — homepage minimal */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium text-neutral-500">[ Insights ]</div>
                    <h1 className="mt-3 text-[32px] sm:text-[42px] lg:text-[48px] font-semibold tracking-[-0.03em] leading-[1.02] text-[#0a0a0b]">
                        Clinic <span className="font-serif italic font-normal text-neutral-400">insights</span>
                        <span className="block text-[18px] sm:text-[22px] font-medium tracking-[-0.01em] text-neutral-500 mt-1">— expert, practical.</span>
                    </h1>
                    <p className="mt-4 text-[14px] leading-7 text-neutral-600 max-w-[560px]">
                        Evidence-led dental advice, treatment explainers, and hygiene tips from our clinicians — written for clarity, not jargon.
                    </p>
                </div>

                {/* Search + tags — Ballance pills */}
                <div className="mt-8 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <div className="relative flex-1 max-w-[480px]">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search blogs or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 h-[42px] rounded-full bg-white border border-black/5 focus:border-black/15 outline-none text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0b] placeholder:text-neutral-400 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allTags.slice(0, 8).map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-full text-[12px] font-medium tracking-[-0.01em] border transition-all duration-200 ${activeTag === tag ? 'bg-[#0a0a0b] text-white border-black shadow-sm' : 'bg-white text-neutral-600 border-black/5 hover:border-black/10 hover:text-[#0a0a0b]'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-[12px] text-neutral-500">
                    <span className="h-px w-8 bg-black/10 hidden sm:block" />
                    <span>{filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} {searchTerm || activeTag !== 'All' ? 'found' : 'available'}</span>
                    {(searchTerm || activeTag !== 'All') && (
                        <button onClick={() => { setSearchTerm(''); setActiveTag('All'); }} className="ml-2 px-3 py-1 rounded-full bg-white border border-black/5 text-[11px] font-medium hover:border-black/10 transition">Clear filters</button>
                    )}
                </div>
            </section>

            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[20px] border border-black/5 p-3 animate-pulse">
                                <div className="h-48 bg-[#f5f5f3] rounded-[16px] mb-4"></div>
                                <div className="px-2 pb-2 space-y-3">
                                    <div className="h-3 bg-black/5 rounded-full w-1/3"></div>
                                    <div className="h-5 bg-black/5 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-black/5 rounded-full w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {filteredBlogs.map((blog) => (
                            <Link href={`/blogs/${blog.slug}`} key={blog._id} className="group">
                                <article className="bg-white rounded-[20px] border border-black/5 overflow-hidden hover:border-black/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col h-full">
                                    <div className="relative h-52 overflow-hidden m-2 rounded-[16px] bg-[#f5f5f3] border border-black/5">
                                        {blog.imageUrl ? (
                                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center text-neutral-400"><span className="text-3xl">🦷</span></div>
                                        )}
                                        {blog.tags.length > 0 && (
                                            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[85%]">
                                                {blog.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="bg-white/95 backdrop-blur-md text-[#0a0a0b] text-[10px] font-medium tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-black/5 shadow-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-3 text-[11px] font-medium tracking-[0.04em] text-neutral-500">
                                            <span className="inline-flex items-center gap-1.5"><FaCalendarAlt size={10} className="text-neutral-400" />{new Date(blog.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="w-1 h-1 rounded-full bg-black/10" />
                                            <span className="inline-flex items-center gap-1.5 truncate"><FaUser size={10} className="text-neutral-400" />{blog.author}</span>
                                        </div>

                                        <h2 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] leading-[1.35] text-[#0a0a0b] group-hover:text-black transition-colors line-clamp-2">
                                            {blog.title}
                                        </h2>

                                        <div
                                            className="blog-card-preview mt-2 text-[13px] leading-6 text-neutral-600 line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: blog.content }}
                                        />

                                        <div className="mt-5 flex items-center gap-2 text-[12px] font-medium tracking-[-0.01em] text-[#0a0a0b] group-hover:gap-3 transition-all duration-200">
                                            Read article <span className="w-7 h-7 rounded-full bg-[#0a0a0b] text-white grid place-items-center group-hover:bg-black transition-colors"><FaArrowRight size={10} /></span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[20px] border border-black/5 p-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#f5f5f3] border border-black/5 grid place-items-center mx-auto text-neutral-500">🔍</div>
                        <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">No blogs found</h3>
                        <p className="mt-1 text-[13px] text-neutral-500">Try adjusting your search terms</p>
                    </div>
                )}
            </section>
        </div>
    );
}
