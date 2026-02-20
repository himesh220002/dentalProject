import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const reviews = [
    {
        name: 'Sarah J.',
        text: 'Dr. Tooth is incredibly gentle. I used to be terrified of the dentist, but now I look forward to my checkups!',
        rating: 5,
        treatment: 'Dental Cleaning'
    },
    {
        name: 'Michael R.',
        text: 'The best clinic in town. Modern equipment, friendly staff, and the treatments are actually painless.',
        rating: 5,
        treatment: 'Root Canal'
    },
    {
        name: 'Priya S.',
        text: "I got my braces done here. The transformation is amazing! Dr. Tooth explained everything clearly at every step.",
        rating: 5,
        treatment: 'Orthodontics'
    },
    {
        name: 'John D.',
        text: "Excellent service and very hygienic. Highly recommended for anyone looking for quality dental care.",
        rating: 5,
        treatment: 'Teeth Whitening'
    }
];

export default function PatientReviews() {
    return (
        <section className="py-12 sm:py-20 bg-blue-50/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-[2rem] sm:rounded-[3rem]">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">What Our Patients Say</h2>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-blue-500 mx-auto rounded-full"></div>
                <p className="text-gray-600 text-base sm:text-lg">Trust is earned through thousands of successful treatments and happy smiles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-blue-50 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                    >
                        <FaQuoteLeft className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 text-7xl sm:text-9xl text-blue-50/50 z-0" />

                        <div className="relative z-10">
                            <div className="flex gap-1 mb-4 sm:mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-yellow-400 text-sm sm:text-base" />
                                ))}
                            </div>
                            <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed italic mb-6 sm:mb-8 font-medium">
                                "{review.text}"
                            </p>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg">
                                    {review.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900 text-sm sm:text-base">{review.name}</h4>
                                    <p className="text-blue-500 text-[10px] sm:text-sm font-bold uppercase tracking-wider">{review.treatment}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 sm:mt-16 text-center">
                <a
                    href="https://google.com/search?q=dr+tooth+dental+clinic+reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-black hover:gap-4 transition-all text-sm sm:text-base"
                >
                    SEE MORE ON GOOGLE <span className="text-lg sm:text-xl">→</span>
                </a>
            </div>
        </section>
    );
}
