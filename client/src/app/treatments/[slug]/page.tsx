import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaCalendarCheck, FaClock, FaStethoscope, FaShieldAlt } from 'react-icons/fa';

const treatmentData = {
    'orthodontics': {
        title: 'Orthodontics & Invisible Aligners',
        subtitle: 'Straighten your teeth seamlessly and comfortably.',
        description: 'Our modern orthodontic treatments focus on giving you a perfect smile without the traditional hassle. We offer clear invisible aligners that are custom-made for your teeth, gently guiding them into their ideal position over time.',
        benefits: ['Virtually invisible appearance', 'Removable for eating and brushing', 'Fewer clinic visits required', 'Comfortable custom fit'],
        image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg'
    },
    'orthodontic-braces': {
        title: 'Orthodontic Braces',
        subtitle: 'Straighten your teeth seamlessly and comfortably.',
        description: 'Our modern orthodontic treatments focus on giving you a perfect smile. We offer traditional and clear aligners that gently guide teeth into their ideal position over time.',
        benefits: ['Corrects misaligned teeth', 'Improves bite and jaw alignment', 'Long-lasting straight smile', 'Custom fit for comfort'],
        image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg'
    },
    'dental-implants': {
        title: 'Dental Implants',
        subtitle: 'A permanent, natural-looking solution for missing teeth.',
        description: 'Regain your confidence and bite strength with our state-of-the-art dental implants. Designed to look, feel, and function exactly like your natural teeth, our implants provide a permanent foundation that integrates seamlessly with your jawbone.',
        benefits: ['Permanent and durable', 'Prevents bone loss in jaw', 'Matches natural teeth perfectly', 'Restores full chewing power'],
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg'
    },
    'general-dentistry': {
        title: 'General & Preventive Dentistry',
        subtitle: 'Comprehensive care to keep your smile healthy for a lifetime.',
        description: 'From routine check-ups and cleanings to fillings and x-rays, our general dentistry services ensure your oral hygiene is always in top condition. We focus on early detection and pain-free preventive care.',
        benefits: ['Early cavity detection', 'Professional plaque removal', 'Gum disease prevention', 'Customized oral care plans'],
        image: '/images/dentalconsult.webp'
    },
    'general-consultation': {
        title: 'General Consultation',
        subtitle: 'Comprehensive check-up to keep your smile healthy for a lifetime.',
        description: 'Our general consultation involves a thorough examination of your teeth, gums, and mouth. We provide professional advice, early detection of issues, and create a personalized care plan for your dental health.',
        benefits: ['Comprehensive examination', 'Personalized care plan', 'Early issue detection', 'Professional dental advice'],
        image: '/images/dentalconsult.webp'
    },
    'scaling-cleaning': {
        title: 'Scaling & Cleaning',
        subtitle: 'Professional deep cleaning for a healthier, brighter smile.',
        description: 'Professional scaling and cleaning remove stubborn plaque, tartar, and stains that normal brushing cannot. It prevents gum disease, bad breath, and keeps your teeth perfectly clean and healthy.',
        benefits: ['Removes plaque and tartar', 'Prevents gum disease', 'Freshens breath', 'Removes surface stains'],
        image: 'https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?q=80&w=687'
    },
    'dental-fillings': {
        title: 'Dental Fillings',
        subtitle: 'Restore decayed teeth safely and painlessly.',
        description: 'We use high-quality, tooth-colored composite materials to fill cavities. This restores the function and integrity of your tooth while maintaining a completely natural appearance.',
        benefits: ['Stops tooth decay', 'Natural tooth-colored material', 'Restores chewing function', 'Painless procedure'],
        image: 'https://images.unsplash.com/photo-1694345215004-837b089f620d?q=80&w=1929'
    },
    'teeth-whitening': {
        title: 'Advanced Teeth Whitening',
        subtitle: 'Brighten your smile instantly with our professional whitening.',
        description: 'Achieve a dazzling, photo-ready smile safely and quickly. Our advanced cosmetic whitening procedures remove years of stubborn stains from coffee, wine, and aging, all while protecting your enamel and minimizing sensitivity.',
        benefits: ['Instant visible results', 'Safe for tooth enamel', 'Long-lasting brightness', 'Tailored to your sensitivity level'],
        image: 'https://www.smilecentre.in/assets/images/treatments/tooth-whitening.jpg'
    },
    'root-canal-treatment': {
        title: 'Root Canal Treatment',
        subtitle: 'Save your natural tooth and eliminate pain effectively.',
        description: 'A root canal is a highly effective procedure to save a tooth that is severely infected or decayed. We carefully remove the infected pulp, clean the root canal, and seal it to prevent further issues, allowing you to keep your natural tooth.',
        benefits: ['Eliminates severe tooth pain', 'Saves the natural tooth', 'Prevents spread of infection', 'Restores normal biting and chewing'],
        image: 'https://www.smilecentre.in/assets/images/treatments/root-canal-procedure.jpg'
    },
    'tooth-extraction': {
        title: 'Tooth Extraction',
        subtitle: 'Safe, painless removal of problematic teeth.',
        description: 'Whether it is a severely decayed tooth, a crowded mouth, or impacted wisdom teeth, our extractions are performed with the utmost care. We use modern anesthetics to ensure the procedure is as painless and comfortable as possible.',
        benefits: ['Prevents infection spread', 'Relieves severe pain', 'Creates space for orthodontic treatment', 'Painless modern procedure'],
        image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?q=80&w=1631'
    },
    'crowns-bridges': {
        title: 'Crowns & Bridges',
        subtitle: 'Restore missing or damaged teeth beautifully.',
        description: 'Dental crowns and bridges are custom-made restorations used to replace missing teeth or cover damaged ones. They look completely natural and restore your ability to eat and speak normally.',
        benefits: ['Restores tooth shape and size', 'Replaces missing teeth', 'Natural appearance', 'Durable and long-lasting'],
        image: 'https://www.cyprusfamilydental.com/wp-content/uploads/2022/12/Depositphotos_274172422_L.jpg'
    },
    'kid-s-dentistry': {
        title: "Kid's Dentistry",
        subtitle: 'Gentle, friendly dental care for your little ones.',
        description: 'We provide specialized pediatric dentistry in a fun, fear-free environment. From first check-ups to cavity prevention, we ensure your child builds a positive relationship with dental care for life.',
        benefits: ['Child-friendly environment', 'Painless procedures', 'Cavity prevention', 'Habit counseling'],
        image: 'https://www.dratuljajoo.com/wp-content/uploads/2018/09/kids-dentistry.jpg'
    },
    'full-mouth-x-ray': {
        title: 'Full Mouth X-Ray',
        subtitle: 'Comprehensive diagnostic imaging for accurate treatments.',
        description: 'Using safe, low-radiation digital x-rays, we capture a complete view of your teeth, jaw, and bone structure. This allows us to accurately diagnose hidden issues and plan effective treatments.',
        benefits: ['Identifies hidden cavities', 'Shows bone structure', 'Low radiation technology', 'Crucial for accurate diagnosis'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjXnsLV9glWBJ77_38thCOxDEeWWN0sqTD3A&s'
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
    const predefinedData = treatmentData[slug as keyof typeof treatmentData];
    
    const formattedTitle = (slug || '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const defaultData = {
        title: formattedTitle,
        subtitle: `Advanced and compassionate ${formattedTitle.toLowerCase()} tailored for your smile.`,
        description: `Our specialized ${formattedTitle.toLowerCase()} treatment provides the highest standard of dental care globally. We utilize state-of-the-art technology to ensure optimal results and a comfortable experience. Our expert team is dedicated to restoring and enhancing your natural smile with precision and safety.`,
        benefits: ['Personalized care plan', 'Advanced medical technology', 'Comfortable and safe procedure', 'Expert specialists'],
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop'
    };

    const title = apiTreatment?.name || predefinedData?.title || defaultData.title;
    
    // Ignore placeholder API descriptions
    let description = apiTreatment?.description;
    if (!description || description.trim().toLowerCase() === 'treatment details provided by clinic.') {
        description = predefinedData?.description || defaultData.description;
    }
    let image = apiTreatment?.image || predefinedData?.image || defaultData.image;
    
    // Fallback if image is generic from context
    if (image === '/images/dentalgeneralimage.jpeg') {
        image = defaultData.image;
    }

    const benefits = predefinedData?.benefits || defaultData.benefits;
    const subtitle = predefinedData?.subtitle || defaultData.subtitle;

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">
            {/* Treatment Hero */}
            <div className="relative bg-gray-900 text-white py-24 sm:py-32 overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center"
                    style={{ backgroundImage: `url('${image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest">
                        Premium Service
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black tracking-tight drop-shadow-lg">
                        {title}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 font-medium max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Content Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-24">
                <div className="grid lg:grid-cols-3 gap-16 items-start">
                    
                    {/* Left Column: Details & Procedure */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Featured Image & Overview */}
                        <div className="space-y-8">
                            <div className="w-full h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl relative">
                                <img src={image} alt={title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                            </div>
                            
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-6">Treatment Details</h2>
                                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Treatment Procedure */}
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-8">Procedure Steps</h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <FaStethoscope className="text-sm" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">1. Initial Consultation</h3>
                                        <p className="text-gray-500 font-medium text-sm">Comprehensive examination and personalized treatment planning with our specialists.</p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <FaClock className="text-sm" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">2. Preparation & Care</h3>
                                        <p className="text-gray-500 font-medium text-sm">Ensuring maximum comfort using state-of-the-art painless technology.</p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <FaCheckCircle className="text-sm" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">3. Final Polish & Review</h3>
                                        <p className="text-gray-500 font-medium text-sm">Reviewing the results with you and ensuring long-lasting dental health.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Post Care */}
                        <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <FaShieldAlt className="text-xl" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Post-Treatment Care</h2>
                            </div>
                            <ul className="grid sm:grid-cols-2 gap-4 text-gray-600 font-medium">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1">•</span>
                                    Maintain regular oral hygiene routines.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1">•</span>
                                    Attend scheduled follow-up visits.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1">•</span>
                                    Avoid extreme hot or cold foods immediately after.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1">•</span>
                                    Contact our support line for any discomfort.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-32">
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Key Benefits</h3>
                            <ul className="space-y-4">
                                {benefits.map((benefit: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <FaCheckCircle className="text-xs" />
                                        </div>
                                        <span className="text-sm">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10" />
                            <h3 className="text-2xl font-black mb-2 relative z-10">Ready to transform your smile?</h3>
                            <p className="text-gray-300 font-medium mb-8 text-sm relative z-10">Schedule a consultation with our specialists today.</p>
                            
                            <Link 
                                href={`/contact?treatment=${encodeURIComponent(title)}`}
                                className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 px-6 py-4 rounded-2xl font-black shadow-xl hover:bg-gray-50 transition-all active:scale-[0.98] relative z-10"
                            >
                                <FaCalendarCheck />
                                Book Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
