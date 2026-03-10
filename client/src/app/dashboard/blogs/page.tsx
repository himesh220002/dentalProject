'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaCheck, FaImage } from 'react-icons/fa';
import Link from 'next/link';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    status: 'draft' | 'published';
    tags: string[];
    imageUrl?: string;
    createdAt: string;
}

interface ContentBlock {
    id: string;
    type: 'h2' | 'h3' | 'p' | 'ul';
    content: string;
}

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [blocks, setBlocks] = useState<ContentBlock[]>([
        { id: Math.random().toString(), type: 'p', content: '' }
    ]);
    const [formData, setFormData] = useState({
        title: '',
        author: 'Dr. Tooth Dental Clinic',
        status: 'published',
        tags: '',
        imageUrl: ''
    });

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/admin/all`);
            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const blocksToHtml = (blocks: ContentBlock[]) => {
        return blocks
            .filter(block => block.content.trim() !== '')
            .map(block => {
                if (block.type === 'ul') {
                    const items = block.content.split('\n').filter(i => i.trim() !== '');
                    if (items.length === 0) return '';
                    return `<ul>${items.map(i => `<li>${i.trim()}</li>`).join('')}</ul>`;
                }
                return `<${block.type}>${block.content.trim()}</${block.type}>`;
            })
            .join('');
    };

    const htmlToBlocks = (html: string): ContentBlock[] => {
        if (typeof window === 'undefined') return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const result: ContentBlock[] = [];

        doc.body.childNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const type = el.tagName.toLowerCase();
                if (['h2', 'h3', 'p', 'ul'].includes(type)) {
                    let content = el.innerHTML;
                    if (type === 'ul') {
                        content = Array.from(el.querySelectorAll('li'))
                            .map(li => li.innerText)
                            .join('\n');
                    }
                    result.push({ id: Math.random().toString(), type: type as any, content });
                }
            }
        });

        return result.length > 0 ? result : [
            { id: Math.random().toString(), type: 'h2', content: '' },
            { id: Math.random().toString(), type: 'h3', content: '' },
            { id: Math.random().toString(), type: 'p', content: '' },
            { id: Math.random().toString(), type: 'ul', content: '' }
        ];
    };

    const handleOpenModal = (blog: Blog | null = null) => {
        if (blog) {
            setEditingBlog(blog);
            setFormData({
                title: blog.title,
                author: blog.author,
                status: blog.status,
                tags: blog.tags.join(', '),
                imageUrl: blog.imageUrl || ''
            });
            setBlocks(htmlToBlocks(blog.content));
        } else {
            setEditingBlog(null);
            setFormData({
                title: '',
                author: 'Dr. Tooth Dental Clinic',
                status: 'published',
                tags: '',
                imageUrl: ''
            });
            setBlocks([
                { id: Math.random().toString(), type: 'h2', content: '' },
                { id: Math.random().toString(), type: 'h3', content: '' },
                { id: Math.random().toString(), type: 'p', content: '' },
                { id: Math.random().toString(), type: 'ul', content: '' }
            ]);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/${id}`);
                fetchBlogs();
            } catch (error) {
                console.error('Error deleting blog:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            content: blocksToHtml(blocks),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        };

        try {
            if (editingBlog) {
                await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/${editingBlog._id}`, payload);
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`, payload);
            }
            setIsModalOpen(false);
            fetchBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
        }
    };

    const addBlock = (type: 'h2' | 'h3' | 'p' | 'ul') => {
        setBlocks([...blocks, { id: Math.random().toString(), type, content: '' }]);
    };

    const updateBlock = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const removeBlock = (id: string) => {
        if (blocks.length > 1) {
            setBlocks(blocks.filter(b => b.id !== id));
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Blog Management</h1>
                    <p className="text-gray-500 font-bold text-sm">Create, edit and manage clinic blog posts</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex mr-2 items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-all w-fit"
                >
                    <FaPlus />
                    <span>Create New Blog</span>
                </button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="relative flex-grow">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search blogs by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 focus:border-blue-500 outline-none font-bold text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Blog Details</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date Created</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                                            <div className="h-3 bg-gray-50 rounded w-1/4"></div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : filteredBlogs.length > 0 ? (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    {blog.imageUrl ? (
                                                        <img src={blog.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">🦷</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">{blog.title}</div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{blog.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${blog.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {blog.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-600">
                                                {new Date(blog.createdAt).toLocaleDateString('en-GB')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                    title="View Publicly"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenModal(blog)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                                                    title="Edit Blog"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blog._id)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                                                    title="Delete Blog"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <p className="text-gray-400 font-bold">No blogs found. Start by creating your first article!</p>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/seed`);
                                                        fetchBlogs();
                                                    } catch (error) {
                                                        console.error('Error seeding blogs:', error);
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="bg-blue-50 text-blue-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                Seed Sample Blogs
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-8 border-b border-gray-50 flex items-center justify-between z-20">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                                    {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                                </h2>
                                <p className="text-gray-400 font-bold text-xs">Fill in the details to publish your insight</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 hover:rotate-180 transition cursor-pointer">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Blog Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Why RCT is better than tooth extraction?"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Author Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold appearance-none"
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Dental, Care, RCT, Tips"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Image URL</label>
                                <div className="flex gap-4">
                                    <div className="flex-grow relative">
                                        <FaImage className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="text"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition font-bold text-sm"
                                        />
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                            <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-gray-50">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">Article Content</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Fill the fields below. Empty sections will be automatically hidden.</p>
                                </div>

                                <div className="space-y-6">
                                    {blocks.map((block, index) => (
                                        <div key={block.id} className="relative group/block transition-all">
                                            <div className="flex items-center justify-between mb-2 ml-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${block.type === 'h2' || block.type === 'h3' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                        {block.type === 'h2' ? 'Main Heading' : block.type === 'h3' ? 'Secondary Heading' : block.type === 'p' ? 'Story / Paragraph' : 'Key Highlights (List)'}
                                                    </span>
                                                    {index > 3 && (
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Custom Block</span>
                                                    )}
                                                </div>
                                                {index > 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBlock(block.id)}
                                                        className="p-1 px-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                                    >
                                                        <FaTrash size={10} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all focus-within:bg-white focus-within:border-blue-100 focus-within:ring-4 focus-within:ring-blue-500/5`}>
                                                {block.type === 'ul' ? (
                                                    <textarea
                                                        value={block.content}
                                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                                        placeholder="Add each point on a new line (e.g. Benefits of regular scaling...)"
                                                        className="w-full bg-transparent border-none outline-none font-bold text-sm resize-none"
                                                        rows={4}
                                                    />
                                                ) : (
                                                    <textarea
                                                        value={block.content}
                                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                                        placeholder={block.type === 'h2' ? 'Enter main informative heading...' : block.type === 'h3' ? 'Enter sub-topic heading...' : 'Share detailed insights and expert advice...'}
                                                        className={`w-full bg-transparent border-none outline-none font-bold resize-none ${block.type === 'h2' ? 'text-lg text-blue-900' : 'text-sm'}`}
                                                        rows={block.type === 'p' ? 4 : 1}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <div className="h-px bg-gray-100 flex-grow"></div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => addBlock('h2')} className="p-2 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition group/btn" title="Add another heading">
                                            <span className="text-[10px] font-black uppercase px-1">Add H2</span>
                                        </button>
                                        <button type="button" onClick={() => addBlock('p')} className="p-2 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition group/btn" title="Add another paragraph">
                                            <span className="text-[10px] font-black uppercase px-1">Add PARA</span>
                                        </button>
                                        <button type="button" onClick={() => addBlock('ul')} className="p-2 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition group/btn" title="Add another list">
                                            <span className="text-[10px] font-black uppercase px-1">Add LIST</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 text-sm font-black text-gray-400 hover:text-gray-900 transition uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-all uppercase tracking-widest text-sm"
                                >
                                    <FaCheck />
                                    <span>{editingBlog ? 'Update Blog' : 'Publish Blog'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
