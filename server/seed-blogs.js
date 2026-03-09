const axios = require('axios');

const seedBlogs = async () => {
    const backendUrl = 'http://localhost:5000';
    const sampleBlogs = [
        {
            title: 'The Importance of Professional Teeth Cleaning',
            content: '<h2>Why Scaling is Essential</h2><p>Professional teeth cleaning, also known as scaling, is crucial for maintaining optimal oral health. Even with regular brushing and flossing, plaque and tartar can build up in hard-to-reach areas.</p><h3>Benefits of Regular Cleaning</h3><ul><li>Prevents Gum Disease</li><li>Stops Bad Breath</li><li>Brightens Your Smile</li><li>Early Detection of Dental Issues</li></ul><p>We recommend visiting your dentist every 6 months for a professional cleaning session.</p>',
            author: 'Dr. Amresh',
            status: 'published',
            tags: ['Oral Health', 'Cleaning', 'Prevention'],
            imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070'
        },
        {
            title: 'Modern RCT: A Painless Solution',
            content: '<h2>Is Root Canal Treatment Painful?</h2><p>There is a common myth that RCT is extremely painful. However, with modern anesthesia and advanced techniques, the procedure is as comfortable as getting a filling.</p><h3>When do you need an RCT?</h3><p>An RCT is necessary when the pulp inside your tooth becomes infected due to deep decay or injury. It saves your natural tooth and prevents the need for extraction.</p>',
            author: 'Dr. Tooth Clinic',
            status: 'published',
            tags: ['RCT', 'Treatments', 'Painless'],
            imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2074'
        }
    ];

    for (const blog of sampleBlogs) {
        try {
            const res = await axios.post(`${backendUrl}/api/blogs`, blog);
            console.log(`Seeded blog: ${res.data.title}`);
        } catch (error) {
            console.error(`Error seeding blog: ${error.message}`);
        }
    }
};

seedBlogs();
