import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaCalendarCheck, FaClock, FaStethoscope, FaShieldAlt, FaTooth, FaRegClock, FaUserMd } from 'react-icons/fa';

type TreatmentDetail = {
    title: string;
    subtitle: string;
    description: string;
    longDescription: string;
    benefits: string[];
    image: string;
    duration: string;
    visits: string;
    anesthesia: string;
    recovery: string;
    indications: string[];
    procedureSteps: { title: string; desc: string }[];
    postCare: string[];
};

const treatmentData: Record<string, TreatmentDetail> = {
    'orthodontics': {
        title: 'Orthodontics — Invisible Aligners',
        subtitle: 'Discreet, removable aligners that straighten teeth without metal braces.',
        description: 'Clear aligner therapy uses a series of custom-moulded, BPA-free polyurethane trays to apply controlled force and gradually move teeth into ideal alignment.',
        longDescription: 'Made from digital intraoral scans, each aligner is worn 20–22 hours daily for 7–14 days before switching to the next stage. Unlike fixed braces, aligners are removable for eating and brushing, and attachments (tooth-coloured buttons) plus interproximal reduction (IPR) may be used for precise movements. Treatment is AI-planned for predictable outcomes and is ideal for mild to moderate crowding, spacing, and relapse cases.',
        benefits: ['Virtually invisible and removable', 'No food restrictions, easy hygiene', 'Fewer emergency visits vs braces', 'Digital preview of final smile'],
        image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1200&auto=format&fit=crop',
        duration: '6–18 months',
        visits: 'Every 6–8 weeks',
        anesthesia: 'None',
        recovery: 'Mild pressure 1–2 days per tray',
        indications: ['Crowding, spacing, mild overbite', 'Relapse after previous braces', 'Adults & teens with full permanent dentition'],
        procedureSteps: [
            { title: 'Scan & Smile Design', desc: 'Intraoral scan, photos, X-rays → 3D ClinCheck showing tooth movements and final alignment.' },
            { title: 'Active Aligners', desc: 'Wear each tray 20–22h/day, change every 1–2 weeks. Attachments/IPR as planned for anchorage.' },
            { title: 'Retention', desc: 'Vivera/Clear retainers full-time 3 months then nightly to prevent relapse.' },
        ],
        postCare: ['Wear retainers as instructed', 'Brush aligners with soft brush, lukewarm water', 'Avoid hot water that warps trays', '6-month retention check-ups']
    },
    'orthodontic-braces': {
        title: 'Orthodontic Braces (Metal & Ceramic)',
        subtitle: 'Fixed braces for precise correction of bite and alignment in all ages.',
        description: 'Fixed orthodontic braces bond brackets to each tooth connected by an archwire. Periodic activation gradually corrects crowding, spacing, deep bite, and crossbite with millimetre accuracy.',
        longDescription: 'Metal braces offer the most efficient mechanics for complex movements; ceramic braces use tooth-coloured brackets for aesthetics. Elastics and springs correct jaw discrepancies. Treatment is monitored via wire changes and is the gold standard for severe malocclusion, extractions, and surgical cases.',
        benefits: ['Most precise for complex malocclusion', 'Works at any age after 7 years', 'No compliance needed (fixed)', 'Cost-effective vs aligners'],
        image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg',
        duration: '12–24 months',
        visits: 'Every 4–6 weeks',
        anesthesia: 'None',
        recovery: 'Soreness 3–5 days after tightening',
        indications: ['Severe crowding, rotations', 'Deep bite, open bite, crossbite', 'Surgical orthodontics preparation'],
        procedureSteps: [
            { title: 'Bonding & Wire Placement', desc: 'Brackets bonded, archwire ligated. Initial light NiTi wire starts alignment.' },
            { title: 'Active Corrections', desc: 'Sequential stainless steel wires, elastics, coils close spaces and correct bite.' },
            { title: 'Debond & Retention', desc: 'Brackets removed, polishing, then fixed + removable retainers.' },
        ],
        postCare: ['Avoid hard/sticky foods', 'Brush around brackets, use interdental brush', 'Wear retainers nightly', 'Regular wire activation']
    },
    'dental-implants': {
        title: 'Dental Implants',
        subtitle: 'Titanium roots that permanently replace missing teeth with natural look and bite.',
        description: 'A dental implant is a Grade-4 titanium screw placed into jawbone that osseointegrates over 8–12 weeks, topped with an abutment and zirconia/PFM crown that looks and chews like a natural tooth.',
        longDescription: 'Implants prevent bone resorption after extraction, restore 90% bite force, and avoid grinding adjacent teeth (unlike bridges). CBCT planning ensures precise placement near nerves/sinus. Suitable for single, multiple, or full-arch (All-on-4/6) rehabilitation. Success rate >95% with strict sterilization.',
        benefits: ['Permanent, no slipping', 'Preserves jawbone & face shape', 'Bite force near natural tooth', 'No damage to neighbour teeth'],
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg',
        duration: '30–60 min per implant',
        visits: '3–4 visits over 3 months',
        anesthesia: 'Local +/− sedation',
        recovery: '2–3 days swelling, soft diet',
        indications: ['Single/multiple missing teeth', 'Full edentulism (All-on-X)', 'Failed root canal with extraction'],
        procedureSteps: [
            { title: 'CBCT Planning & Placement', desc: 'Digital guide, local anaesthesia, implant torqued into bone, cover screw placed.' },
            { title: 'Osseointegration', desc: '3 months healing; bone fuses to implant. Temporary denture/crown if needed.' },
            { title: 'Crown Loading', desc: 'Abutment + custom zirconia crown torqued, bite adjusted, X-ray verification.' },
        ],
        postCare: ['Soft diet 48h, no smoking', 'Chlorhexidine rinse 7 days', 'Avoid chewing on implant 2 weeks', '6-month implant hygiene']
    },
    'general-dentistry': {
        title: 'General & Preventive Dentistry',
        subtitle: 'Comprehensive check-ups, cleanings, and prevention for lifelong oral health.',
        description: 'General dentistry combines 6-month examinations, professional cleanings, fluoride, and early interventions (fillings, sealants, X-rays) to prevent cavities and gum disease.',
        longDescription: 'Includes visual exam, periodontal charting, digital X-rays, oral cancer screening, and personalized hygiene plan. Preventive care reduces future root canals and extractions by 60%. Tailored for families, adults, and seniors.',
        benefits: ['Early cavity & gum disease detection', 'Professional plaque removal', 'Oral cancer screening', 'Personalised hygiene plan'],
        image: '/images/dentalconsult.webp',
        duration: '30–60 min',
        visits: 'Every 6 months',
        anesthesia: 'None',
        recovery: 'None',
        indications: ['Routine 6-month check', 'Bleeding gums, sensitivity', 'Family preventive care'],
        procedureSteps: [
            { title: 'Examination & X-rays', desc: 'Visual + periodontal + bitewing X-rays to spot hidden decay.' },
            { title: 'Cleaning & Fluoride', desc: 'Ultrasonic scaling, polishing, fluoride varnish for enamel strength.' },
            { title: 'Plan & Prevention', desc: 'Home-care demo, sealants/fillings scheduled if needed.' },
        ],
        postCare: ['Brush twice, floss daily', 'Avoid sugary snacks', 'Biannual recall']
    },
    'general-consultation': {
        title: 'General Consultation',
        subtitle: '30-minute comprehensive exam with personalized treatment roadmap.',
        description: 'A full-mouth examination of teeth, gums, bite, and soft tissues with digital X-rays, intraoral photos, and a clear, costed treatment plan.',
        longDescription: 'You receive a prioritized plan (urgent vs elective), cost estimate, and time required. Ideal for second opinions, pain diagnosis, or before starting braces/implants. No treatment forced — transparent options.',
        benefits: ['Full-mouth + bite analysis', 'Intraoral photos for clarity', 'Written plan with costs', 'Second-opinion friendly'],
        image: '/images/dentalconsult.webp',
        duration: '20–30 min',
        visits: '1',
        anesthesia: 'None',
        recovery: 'None',
        indications: ['New patient baseline', 'Tooth pain, swelling', 'Before braces/implant decision'],
        procedureSteps: [
            { title: 'History & Exam', desc: 'Medical/dental history, extra-oral + intraoral exam.' },
            { title: 'Imaging', desc: 'Bitewing/OPG as needed, photos for documentation.' },
            { title: 'Plan', desc: 'Explain findings, options, costs, timelines.' },
        ],
        postCare: ['Follow hygiene advice', 'Schedule recommended treatments']
    },
    'scaling-cleaning': {
        title: 'Scaling & Polishing',
        subtitle: 'Ultrasonic removal of plaque, tartar, and stains for healthy gums.',
        description: 'Scaling uses an ultrasonic scaler to shatter hardened calculus above and below the gumline, followed by AirFlow/polishing to remove extrinsic stains.',
        longDescription: 'Targets biofilm that causes gingivitis, bleeding, and halitosis. Subgingival scaling prevents periodontitis and bone loss. Recommended every 6 months; smokers/ortho patients every 3–4 months. No enamel damage when done with correct tip pressure.',
        benefits: ['Removes hard tartar (not brushable)', 'Stops bleeding & bad breath', 'Prevents gum recession', 'Brightens without bleaching'],
        image: 'https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?q=80&w=687',
        duration: '30–45 min',
        visits: '1',
        anesthesia: 'None (topical if sensitive)',
        recovery: 'Mild sensitivity 24h',
        indications: ['Bleeding gums', 'Bad breath', 'Tartar, tea/coffee stains'],
        procedureSteps: [
            { title: 'Ultrasonic Scaling', desc: 'Piezo tip vibrates at 30kHz to fracture calculus, saline irrigation.' },
            { title: 'Polishing', desc: 'Prophy paste + rubber cup removes remaining stains, smoothens enamel.' },
            { title: 'Fluoride', desc: 'Varnish/gel reduces post-scale sensitivity.' },
        ],
        postCare: ['Avoid coloured foods 24h', 'Warm salt rinse if sore', 'Desensitizing paste if needed']
    },
    'dental-fillings': {
        title: 'Dental Fillings (Composite)',
        subtitle: 'Tooth-coloured composite restorations that stop decay and restore strength.',
        description: 'Decayed enamel is removed with high-speed bur, dentin conditioned, bonding agent applied, and nano-hybrid composite layered and light-cured to match natural shade.',
        longDescription: 'Composite bonds micromechanically, preserving more tooth than amalgam. Shade-matched, mercury-free, and polished to prevent plaque. Indicated for Class I–V cavities, small fractures, and sensitivity. Lasts 5–7 years with hygiene.',
        benefits: ['Mercury-free, tooth-coloured', 'Bonds, preserves tooth', 'Single visit, painless', 'Polished, stain-resistant'],
        image: 'https://images.unsplash.com/photo-1694345215004-837b089f620d?q=80&w=1929',
        duration: '20–40 min per tooth',
        visits: '1',
        anesthesia: 'Local infiltration',
        recovery: 'Numb 1–2h, mild bite highness',
        indications: ['Cavity, black pit', 'Sensitivity to sweet', 'Chipped edge'],
        procedureSteps: [
            { title: 'Decay Removal', desc: 'Local anaesthesia, rubber dam, caries excavated with bur.' },
            { title: 'Bonding & Layering', desc: 'Etch-bond, composite increments cured 20s with LED.' },
            { title: 'Finish & Polish', desc: 'Occlusion checked with articulating paper, polishing discs.' },
        ],
        postCare: ['Avoid chewing until numbness fades', 'Sensitivity 2–3 days normal', 'Night guard if grinding']
    },
    'teeth-whitening': {
        title: 'Professional Teeth Whitening',
        subtitle: 'In-office hydrogen-peroxide whitening that lifts 4–8 shades safely.',
        description: '35% hydrogen peroxide gel is applied to isolated teeth under gingival barrier, activated by LED for 15-min cycles, lifting intrinsic stains from tea, coffee, tobacco, and age.',
        longDescription: 'Whitening oxidation breaks pigment inside dentin without abrading enamel. Isolated with OptraGate + liquid dam to protect gums. Desensitizing potassium nitrate gel used post-op. Avoids over-whitening by shade guide. At-home trays available for maintenance.',
        benefits: ['4–8 shades brighter in 1 hour', 'Enamel-safe pH buffered', 'Even whitening, no streaks', 'Sensitivity-controlled'],
        image: 'https://www.smilecentre.in/assets/images/treatments/tooth-whitening.jpg',
        duration: '45–60 min',
        visits: '1 (touch-up at 6 months)',
        anesthesia: 'None',
        recovery: 'Sensitivity 24–48h',
        indications: ['Yellow/brown extrinsic stains', 'Wedding, interview prep', 'Age-related darkening'],
        procedureSteps: [
            { title: 'Isolation & Shade', desc: 'Lip retractor, gum barrier, Vita shade recorded.' },
            { title: 'Whitening Cycles', desc: '3×15 min gel + LED, suction, reapply.' },
            { title: 'Desensitize', desc: 'Fluoride + KNO3 gel, white diet instructions.' },
        ],
        postCare: ['White diet 48h (no tea/coffee)', 'Sensitive toothpaste 1 week', 'No smoking 48h']
    },
    'root-canal-treatment': {
        title: 'Root Canal Treatment (RCT)',
        subtitle: 'Painless pulpectomy that saves an infected tooth from extraction.',
        description: 'Under rubber dam and local anaesthesia, infected pulp is removed with rotary NiTi files, canals disinfected with NaOCl/EDTA, and obturated with gutta-percha and bioceramic sealer, followed by a crown.',
        longDescription: 'Indicated when decay/trauma reaches pulp causing night pain, swelling, or abscess. Single-visit RCT for anterior, 2 visits for molars. Working length confirmed with apex locator + RVG. Saves natural root, prevents bridge/implant.',
        benefits: ['Stops severe pain & swelling', 'Saves natural tooth', 'Prevents extraction + bone loss', 'High success 85–92%'],
        image: 'https://www.smilecentre.in/assets/images/treatments/root-canal-procedure.jpg',
        duration: '60–90 min per visit',
        visits: '1–2',
        anesthesia: 'Profound local',
        recovery: 'Dull ache 2–3 days',
        indications: ['Prolonged cold sensitivity', 'Night pain, swelling', ' Deep caries on X-ray'],
        procedureSteps: [
            { title: 'Access & Clean', desc: 'Rubber dam, pulp extirpation, rotary shaping, NaOCl irrigation.' },
            { title: 'Fill (Obturation)', desc: 'Gutta-percha + sealer compacted, temporary filling.' },
            { title: 'Crown', desc: 'After 7 days, zirconia/PFM crown for fracture protection.' },
        ],
        postCare: ['Soft diet, no chewing hard', 'Complete crown within 2 weeks', 'Antibiotics/painkillers as prescribed']
    },
    'tooth-extraction': {
        title: 'Tooth Extraction',
        subtitle: 'Atraumatic removal with luxators and local anaesthesia for comfort.',
        description: 'Simple extraction uses elevators/forceps after luxating periodontal ligament; surgical extraction incises gum, removes bone around impacted wisdom tooth, and sutures.',
        longDescription: 'Indicated for non-restorable decay, severe periodontitis, crowding for ortho, and impacted third molars causing pericoronitis. Atraumatic technique preserves buccal plate for future implant. Platelet-rich fibrin (PRF) optional for faster healing.',
        benefits: ['Stops infection spread', 'Relieves crowding/pressure', 'Minimal trauma, fast heal', 'Sutured, PRF option'],
        image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?q=80&w=1631',
        duration: '20–45 min',
        visits: '1',
        anesthesia: 'Local infiltration/block',
        recovery: '2–3 days swelling',
        indications: ['Grossly decayed non-restorable', 'Impacted wisdom', 'Ortho extractions'],
        procedureSteps: [
            { title: 'Anaesthesia & Luxation', desc: 'Block/infiltration, periotome severs ligament.' },
            { title: 'Delivery', desc: 'Forceps or surgical flap + bone guttering, tooth delivered.' },
            { title: 'Closure', desc: 'Socket compressed, gauze pressure, sutures if surgical.' },
        ],
        postCare: ['Bite gauze 30 min, no spitting 24h', 'Cold compress, soft diet', 'No smoking/alcohol 3 days']
    },
    'crowns-bridges': {
        title: 'Crowns & Bridges',
        subtitle: 'Zirconia/PFM/EMAX caps and bridges that restore shape, bite, and aesthetics.',
        description: 'A crown caps a weakened root-canal or fractured tooth; a bridge spans a missing tooth by crowning two neighbours and suspending a pontic between.',
        longDescription: 'Scanned via intraoral scanner, milled zirconia (1300 MPa) or layered EMAX for anteriors, glazed to match shade. Bridges avoid removable dentures. Requires tooth preparation under local, provisionals, then final cementation.',
        benefits: ['Protects RCT tooth from fracture', 'Replaces missing tooth fixed', 'Shade-matched, metal-free option', 'Lasts 10–15 years'],
        image: 'https://www.cyprusfamilydental.com/wp-content/uploads/2022/12/Depositphotos_274172422_L.jpg',
        duration: '60 min per visit',
        visits: '2 (7 days apart)',
        anesthesia: 'Local',
        recovery: 'Mild sensitivity 2 days',
        indications: ['Post-RCT protection', 'Large fracture', 'Missing 1–2 teeth'],
        procedureSteps: [
            { title: 'Prepare & Scan', desc: 'Tooth reduced 1.5mm, retraction cord, digital scan.' },
            { title: 'Provisional', desc: '3D-printed temporary crown cemented for aesthetics.' },
            { title: 'Cementation', desc: 'Try-in, shade verify, adhesive cement, bite polish.' },
        ],
        postCare: ['Avoid sticky on temporary', 'Floss with threader for bridge', 'Night guard if clenching']
    },
    'kid-s-dentistry': {
        title: "Kid's Dentistry",
        subtitle: 'Tell-Show-Do, flavoured materials, and cartoons for a fear-free visit.',
        description: 'Pediatric dentistry manages milk teeth with fluoride varnish, pit-and-fissure sealants, glass-ionomer fillings, pulpotomy, and habit correction (thumb sucking) in a playful setting.',
        longDescription: 'Milk teeth guide permanent teeth; early loss causes crowding. Sealants block 80% fissure caries, fluoride strengthens enamel. Behaviour management includes parental presence, nitrous oxide if needed. First visit by age 1.',
        benefits: ['Prevents early cavities', 'Guides permanent teeth', 'Fear-free, cartoon TV', 'Habit & diet counselling'],
        image: 'https://www.dratuljajoo.com/wp-content/uploads/2018/09/kids-dentistry.jpg',
        duration: '20–40 min',
        visits: '1',
        anesthesia: 'Topical + local if needed',
        recovery: 'None',
        indications: ['Brown pits in milk molar', 'Mouth breathing, thumb habit', 'Cavity in 3–12 years'],
        procedureSteps: [
            { title: 'Acclimatize', desc: 'Ride on chair, cartoon, Tell-Show-Do demo.' },
            { title: 'Treatment', desc: 'Sealant/fluoride/filling/pulpotomy with flavoured materials.' },
            { title: 'Home Care', desc: 'Brushing demo, diet chart, recall 6 months.' },
        ],
        postCare: ['No sticky toffees', 'Brush with pea-sized paste', '6-month sealant check']
    },
    'full-mouth-x-ray': {
        title: 'Full Mouth X-Ray (OPG & CBCT)',
        subtitle: 'Low-dose digital imaging that reveals hidden decay, bone loss, and impactions.',
        description: 'Orthopantomogram (OPG) captures all teeth and jaws in one 14-second exposure; CBCT adds 3D slices for implants, impactions, and cysts at 10× lower dose than medical CT.',
        longDescription: 'Essential before implants, braces, extractions, and full-mouth rehab. Digital sensor cuts radiation 70% vs film, immediate viewing. Reveals interproximal caries, root fractures, bone levels, and sinus proximity missed on visual exam.',
        benefits: ['One shot sees all teeth', '70% less radiation (digital)', 'Guides implants/braces', 'Detects hidden cysts'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjXnsLV9glWBJ77_38thCOxDEeWWN0sqTD3A&s',
        duration: '5–10 min',
        visits: '1',
        anesthesia: 'None',
        recovery: 'None',
        indications: ['Before RCT/implant/braces', 'Wisdom pain, swelling', 'Gum bleeding with deep pockets'],
        procedureSteps: [
            { title: 'Positioning', desc: 'Lead apron, bite on OPG peg, chin rest, Frankfort plane.' },
            { title: 'Exposure', desc: 'Machine rotates 14s around head, 68kVp 8mA digital.' },
            { title: 'Report', desc: 'DICOM viewed, annotated, treatment plan explained.' },
        ],
        postCare: ['No special care', 'Share DICOM for second opinion']
    }
};

async function getTreatmentBySlug(slug: string) {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
            (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api');
        const res = await fetch(`${API_BASE_URL}/treatments`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        const treatments = await res.json();
        return treatments.find((t: any) => t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
    } catch (e) {
        return null;
    }
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const apiTreatment = await getTreatmentBySlug(slug);
    const predefined = treatmentData[slug as keyof typeof treatmentData];
    
    const formattedTitle = (slug || '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const fallback: TreatmentDetail = {
        title: formattedTitle,
        subtitle: `Advanced and compassionate ${formattedTitle.toLowerCase()} tailored for your smile.`,
        description: `Our specialized ${formattedTitle.toLowerCase()} treatment provides the highest standard of dental care. We utilize state-of-the-art technology to ensure optimal results and a comfortable experience.`,
        longDescription: `This treatment is planned after a thorough exam and digital imaging. We explain all options, costs, and timelines upfront so you can decide with clarity. Sterilization follows Class-B autoclave protocols throughout.`,
        benefits: ['Personalized care plan', 'Advanced technology', 'Comfortable and safe', 'Expert specialists'],
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
        duration: '30–60 min',
        visits: '1–2',
        anesthesia: 'As needed',
        recovery: 'Mild sensitivity',
        indications: ['Pain, decay, or aesthetic concern related to ' + formattedTitle.toLowerCase()],
        procedureSteps: [
            { title: 'Consult & Scan', desc: 'Exam + X-ray/scan to confirm diagnosis and options.' },
            { title: 'Treatment', desc: 'Painless procedure with constant comfort checks.' },
            { title: 'Review', desc: 'Polishing, bite check, and home-care instructions.' },
        ],
        postCare: ['Follow hygiene advice', 'Attend follow-up', 'Contact for discomfort']
    };

    const data: TreatmentDetail = {
        title: apiTreatment?.name || predefined?.title || fallback.title,
        subtitle: predefined?.subtitle || fallback.subtitle,
        description: (apiTreatment?.description && apiTreatment.description.trim().toLowerCase() !== 'treatment details provided by clinic.') ? apiTreatment.description : (predefined?.description || fallback.description),
        longDescription: predefined?.longDescription || fallback.longDescription,
        benefits: predefined?.benefits || fallback.benefits,
        image: (apiTreatment?.image && apiTreatment.image !== '/images/dentalgeneralimage.jpeg') ? apiTreatment.image : (predefined?.image || fallback.image),
        duration: predefined?.duration || fallback.duration,
        visits: predefined?.visits || fallback.visits,
        anesthesia: predefined?.anesthesia || fallback.anesthesia,
        recovery: predefined?.recovery || fallback.recovery,
        indications: predefined?.indications || fallback.indications,
        procedureSteps: predefined?.procedureSteps || fallback.procedureSteps,
        postCare: predefined?.postCare || fallback.postCare
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-12 sm:pb-16">
            {/* Hero — homepage minimal dark */}
            <div className="relative bg-[#0a0a0b] text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img src={data.image} alt={data.title} className="w-full h-full object-cover opacity-[0.18]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 to-[#0a0a0b]/30" />
                </div>
                <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] tracking-[0.14em] uppercase font-medium text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Premium Service
                    </div>
                    <h1 className="mt-4 text-[30px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.02] max-w-3xl">
                        {data.title}
                    </h1>
                    <p className="mt-3 text-[15px] sm:text-[16px] leading-7 text-white/60 max-w-2xl">{data.subtitle}</p>
                    <div className="mt-6 flex flex-wrap gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-white/60">
                        <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">⏱ {data.duration}</span>
                        <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">🗓 {data.visits}</span>
                        <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur">💉 {data.anesthesia}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
                    
                    {/* Left */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image + Overview */}
                        <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-sm">
                            <div className="p-2">
                                <div className="h-[280px] sm:h-[380px] rounded-[20px] overflow-hidden relative">
                                    <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </div>
                            <div className="px-6 sm:px-8 pb-8 pt-2 space-y-6">
                                <div>
                                    <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">[ Overview ]</div>
                                    <h2 className="mt-2 text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">About this treatment</h2>
                                    <p className="mt-3 text-[14px] leading-7 text-neutral-600">{data.description}</p>
                                    <p className="mt-3 text-[13px] leading-6 text-neutral-500">{data.longDescription}</p>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-4">
                                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Duration</div>
                                        <div className="text-[13px] font-semibold text-[#0a0a0b] mt-1">{data.duration}</div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-4">
                                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Visits</div>
                                        <div className="text-[13px] font-semibold text-[#0a0a0b] mt-1">{data.visits}</div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-4">
                                        <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-neutral-500">Recovery</div>
                                        <div className="text-[13px] font-semibold text-[#0a0a0b] mt-1">{data.recovery}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">Ideal for</h3>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.indications.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[12px] font-medium text-neutral-600">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Procedure */}
                        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
                            <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">[ Step-by-step ]</div>
                            <h2 className="mt-2 text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">Procedure steps</h2>
                            <div className="mt-6 space-y-4">
                                {data.procedureSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-[#fcfcfc] border border-black/5">
                                        <div className="w-9 h-9 rounded-full bg-[#0a0a0b] text-white grid place-items-center text-[12px] font-bold shrink-0">{idx + 1}</div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0b]">{step.title}</h3>
                                            <p className="text-[13px] leading-6 text-neutral-600 mt-1">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Post Care */}
                        <div className="rounded-[24px] bg-white border border-black/5 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 grid place-items-center"><FaShieldAlt size={14} /></span>
                                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0b]">Post-treatment care</h2>
                            </div>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {data.postCare.map((item, i) => (
                                    <li key={i} className="flex gap-2.5 p-3 rounded-2xl bg-[#fcfcfc] border border-black/5 text-[13px] leading-6 text-neutral-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right — sticky hanging scroll kept intact */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 self-start space-y-5">
                        <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-7">
                                <h3 className="text-[11px] tracking-[0.14em] uppercase font-medium text-neutral-500">Key benefits</h3>
                                <ul className="mt-4 space-y-3">
                                    {data.benefits.map((benefit: string, i: number) => (
                                        <li key={i} className="flex gap-3 p-3 rounded-2xl bg-[#fcfcfc] border border-black/5">
                                            <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 grid place-items-center shrink-0 mt-0.5"><FaCheckCircle size={10} /></span>
                                            <span className="text-[13px] leading-6 font-medium text-neutral-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-3">
                                        <FaClock className="mx-auto text-neutral-400 mb-1" size={12} />
                                        <div className="text-[11px] font-semibold text-[#0a0a0b]">{data.duration}</div>
                                        <div className="text-[10px] tracking-[0.08em] uppercase text-neutral-500">Duration</div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-3">
                                        <FaRegClock className="mx-auto text-neutral-400 mb-1" size={12} />
                                        <div className="text-[11px] font-semibold text-[#0a0a0b]">{data.visits}</div>
                                        <div className="text-[10px] tracking-[0.08em] uppercase text-neutral-500">Visits</div>
                                    </div>
                                    <div className="rounded-2xl bg-[#f5f5f3] border border-black/5 p-3">
                                        <FaUserMd className="mx-auto text-neutral-400 mb-1" size={12} />
                                        <div className="text-[11px] font-semibold text-[#0a0a0b]">{data.anesthesia}</div>
                                        <div className="text-[10px] tracking-[0.08em] uppercase text-neutral-500">Anaesthesia</div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 sm:px-7 pb-6">
                                <Link href={`/contact?treatment=${encodeURIComponent(data.title)}`} className="flex items-center justify-center gap-2 w-full bg-[#0a0a0b] text-white py-3.5 rounded-full text-[14px] font-medium tracking-[-0.01em] hover:bg-black active:scale-[0.98] transition">
                                    <FaCalendarCheck size={12} /> Book Consultation
                                </Link>
                                <p className="text-center text-[11px] leading-5 text-neutral-500 mt-2">Free cost estimate on first visit · No obligation</p>
                            </div>
                        </div>

                        <div className="rounded-[24px] bg-[#0a0a0b] text-white p-6 sm:p-7 relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.04] rounded-full blur-2xl" />
                            <h3 className="text-[18px] font-semibold tracking-[-0.02em] leading-tight relative">Still unsure?</h3>
                            <p className="text-[13px] leading-6 text-white/60 mt-2 relative">Talk to our team — we explain options, costs, and timelines clearly before you decide.</p>
                            <div className="mt-4 flex gap-2 relative">
                                <Link href="/contact" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-[#0a0a0b] py-2.5 rounded-full text-[13px] font-medium hover:bg-neutral-100 transition">Contact <FaStethoscope size={11} /></Link>
                                <Link href="/about" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/10 border border-white/15 text-white py-2.5 rounded-full text-[13px] font-medium hover:bg-white/15 transition">Meet team</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
