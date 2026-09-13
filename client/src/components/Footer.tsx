'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { useClinic } from '../context/ClinicContext';
import { ensureAbsoluteUrl } from '../utils/urlHelper';

export default function Footer() {
    const { clinicData } = useClinic();
    const name = clinicData?.clinicName || 'ToothOp';
    const tagline = clinicData?.tagline || "Your Smile's Guardian";
    const address = clinicData ? `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} - ${clinicData.address.zip}` : 'Dental Clinic Road, Katihar, Bihar - 854105';
    const phone = clinicData?.phone || '+91 98765 43210';
    const email = clinicData?.email || 'care@toothop.com';
    const socials = [
        { icon: <FaFacebookF size={14} />, href: ensureAbsoluteUrl(clinicData?.socialLinks?.facebook || 'https://www.facebook.com/') },
        { icon: <FaTwitter size={14} />, href: ensureAbsoluteUrl(clinicData?.socialLinks?.twitter || 'https://x.com/tweeter?lang=en') },
        { icon: <FaLinkedinIn size={14} />, href: ensureAbsoluteUrl(clinicData?.socialLinks?.linkedin || 'https://www.linkedin.com/') },
        { icon: <FaInstagram size={14} />, href: ensureAbsoluteUrl(clinicData?.socialLinks?.instagram || 'https://www.instagram.com/') },
    ];
    return (
        <footer className="bg-[#0a0a0b] text-white relative overflow-hidden">
            <div className="h-[1px] bg-white/10" />
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
                <div className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-[48px] h-[48px] rounded-[14px] overflow-hidden shrink-0"><Image src="/images/logo.png" alt="Logo" width={200} height={200} className="w-full h-full object-cover rounded-[13px]" /></div>
                        <div>
                            <div className="text-[18px] font-semibold tracking-[-0.02em] leading-none">{name.split(' ')[0]} <span className="font-normal text-white/60">{name.split(' ').slice(1).join(' ')}</span></div>
                            <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/50 mt-1">{tagline}</div>
                        </div>
                    </div>
                    <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[13px] font-medium hover:bg-neutral-100 transition">Book visit →</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 py-10">
                    <div><h4 className="text-[11px] tracking-[0.16em] uppercase font-medium text-white/40 mb-4">Navigate</h4><ul className="space-y-3">{[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }, { name: 'Treatments', href: '/treatments' }, { name: 'Blogs', href: '/blogs' }, { name: 'Contact', href: '/contact' }].map((l) => <li key={l.name}><Link href={l.href} className="text-[13.5px] text-white/75 hover:text-white transition">{l.name}</Link></li>)}</ul></div>
                    <div><h4 className="text-[11px] tracking-[0.16em] uppercase font-medium text-white/40 mb-4">Information</h4><ul className="space-y-3">{[{ name: 'My bookings', href: '/my-bookings' }, { name: 'Timings', href: '/timings' }, { name: 'Privacy', href: '/privacy' }, { name: 'Terms', href: '/terms' }].map((l) => <li key={l.name}><Link href={l.href} className="text-[13.5px] text-white/75 hover:text-white transition">{l.name}</Link></li>)}</ul></div>
                    <div className="col-span-2 lg:col-span-2"><h4 className="text-[11px] tracking-[0.16em] uppercase font-medium text-white/40 mb-4">Get in touch</h4><ul className="space-y-3"><li className="flex gap-3 text-[13.5px] text-white/70"><FaMapMarkerAlt size={12} className="mt-1 text-white/40 shrink-0" /><span className="leading-6">{address}</span></li><li className="flex gap-3 text-[13.5px]"><FaPhoneAlt size={12} className="mt-1 text-white/40 shrink-0" /><a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-white hover:text-white transition font-medium">{phone}</a></li><li className="flex gap-3 text-[13.5px]"><FaEnvelope size={12} className="mt-1 text-white/40 shrink-0" /><a href={`mailto:${email}`} className="text-white/70 hover:text-white transition">{email}</a></li></ul><div className="flex gap-2 mt-6">{socials.map((s, i) => <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center text-white/70 hover:bg-white hover:text-black transition">{s.icon}</a>)}</div></div>
                </div>
                <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3"><p className="text-[11px] tracking-[0.08em] font-medium text-white/40 text-center sm:text-left">© {new Date().getFullYear()} {name}. All rights reserved. · <a href="https://myweb-nine-tawny.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition underline decoration-white/20 underline-offset-4">CypherTech</a></p><div className="flex gap-5 text-[11px] tracking-[0.12em] uppercase font-medium text-white/40"><Link href="/privacy" className="hover:text-white transition">Privacy</Link><Link href="/terms" className="hover:text-white transition">Terms</Link></div></div>
                <div className="pb-8 text-center"><p className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/25">They say no one reads the footer. Now you have.</p></div>
            </div>
        </footer>
    );
}
