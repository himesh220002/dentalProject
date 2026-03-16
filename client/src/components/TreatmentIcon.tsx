'use client';

import React from 'react';
import {
    FaTooth, FaMagic, FaUserMd, FaNotesMedical, FaRegSmileBeam, FaMedkit,
    FaSyringe, FaShieldAlt, FaStethoscope, FaSmile, FaSearchPlus
} from 'react-icons/fa';
import {
    MdOutlineCleanHands, MdOutlineHealthAndSafety, MdOutlineVisibility,
    MdOutlineLocalHospital
} from 'react-icons/md';

// Map icon strings from backend to React Icons components
export const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    FaTooth,
    FaMagic,
    FaUserMd,
    FaNotesMedical,
    FaRegSmileBeam,
    FaMedkit,
    FaSyringe,
    FaShieldAlt,
    FaStethoscope,
    FaSmile,
    FaSearchPlus,
    MdOutlineCleanHands,
    MdOutlineHealthAndSafety,
    MdOutlineVisibility,
    MdOutlineLocalHospital
};

export const getTreatmentIconName = (name: string, description?: string): string => {
    const text = (name + ' ' + (description || '')).toLowerCase();

    if (text.includes('scaling') || text.includes('cleaning') || text.includes('polish')) return 'FaMagic';
    if (text.includes('extraction') || text.includes('removal')) return 'FaTooth';
    if (text.includes('canal') || text.includes('rct') || text.includes('root')) return 'FaSyringe';
    if (text.includes('filling') || text.includes('cavity') || text.includes('decay')) return 'FaTooth';
    if (text.includes('alignment') || text.includes('braces') || text.includes('invisalign')) return 'FaRegSmileBeam';
    if (text.includes('whitening') || text.includes('aesthetic') || text.includes('cosmetic')) return 'FaMagic';
    if (text.includes('implant') || text.includes('surgery')) return 'FaMedkit';
    if (text.includes('checkup') || text.includes('consultation')) return 'FaStethoscope';
    if (text.includes('x-ray') || text.includes('scan') || text.includes('radiography')) return 'FaSearchPlus';
    if (text.includes('pediatric') || text.includes('kids') || text.includes('child')) return 'FaSmile';
    if (text.includes('crown') || text.includes('bridge') || text.includes('denture') || text.includes('prosthetic')) return 'FaShieldAlt';
    if (text.includes('hygiene') || text.includes('preventive')) return 'MdOutlineHealthAndSafety';

    return 'FaTooth'; // Default icon
};

interface TreatmentIconProps {
    iconName?: string;
    treatmentName?: string;
    treatmentDescription?: string;
    className?: string;
}

const TreatmentIcon: React.FC<TreatmentIconProps> = ({ iconName, treatmentName, treatmentDescription, className }) => {
    // Priority: 
    // 1. A derived icon from name/description (if specific enough)
    // 2. The iconName from backend (if it's not the generic FaTooth)
    // 3. Fallback to FaTooth

    const derivedName = treatmentName ? getTreatmentIconName(treatmentName, treatmentDescription) : null;

    let name = 'FaTooth';

    if (derivedName && derivedName !== 'FaTooth') {
        name = derivedName;
    } else if (iconName && iconName !== 'FaTooth' && iconMap[iconName]) {
        name = iconName;
    } else if (derivedName) {
        name = derivedName;
    } else if (iconName && iconMap[iconName]) {
        name = iconName;
    }

    const IconComponent = iconMap[name] || FaTooth;

    return <IconComponent className={className} />;
};

export default TreatmentIcon;
