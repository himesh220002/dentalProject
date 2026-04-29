'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch } from 'react-icons/fa';
import { useClinic } from '@/context/ClinicContext';
import { translations } from '@/constants/translations';

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
    const t = translations[language];
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                        Clinic <span className="text-blue-400">Insights</span>
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Expert dental advice, latest treatments, and oral health tips from our specialized doctors.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filters */}
                <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search blogs or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-600 font-bold"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
                                <div className="h-8 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <Link href={`/blogs/${blog.slug}`} key={blog._id} className="group">
                                <article className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                                    <div className="relative h-56 overflow-hidden">
                                        {blog.imageUrl ? (
                                            <img
                                                src={blog.imageUrl}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                                <span className="text-4xl">🦷</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {blog.tags.map(tag => (
                                                <span key={tag} className="bg-white/90 backdrop-blur-md text-blue-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 mb-4 text-gray-400 text-xs font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-blue-500" />
                                                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                                                <FaUser className="text-blue-500" />
                                                <span className="truncate max-w-[100px]">{blog.author}</span>
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 mb-4 transition-colors leading-tight">
                                            {blog.title}
                                        </h2>

                                        <div
                                            className="blog-card-preview text-gray-500 mb-6 font-medium text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: blog.content }}
                                        />

                                        <div className="mt-auto flex items-center text-blue-600 font-black text-xs uppercase tracking-tighter group-hover:gap-4 gap-2 transition-all">
                                            <span>Read Article</span>
                                            <FaArrowRight />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900">No blogs found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
}
