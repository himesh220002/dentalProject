const Treatment = require('../models/Treatment');

// @desc    Get all treatments
// @route   GET /api/treatments
// @access  Public
const getAllTreatments = async (req, res) => {
    try {
        const treatments = await Treatment.find({});
        res.json(treatments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seed initial treatments
// @route   POST /api/treatments/seed
// @access  Public (for dev)
const seedTreatments = async (req, res) => {
    try {
        await Treatment.deleteMany(); // Clear existing data

        const sampleTreatments = [
            {
                name: 'Root Canal Treatment',
                description: 'A procedure to save a badly decayed or infected tooth by removing the nerve and pulp, then cleaning and sealing it.',
                whyNeed: 'Stops severe toothache, saves natural tooth, prevents spread of infection.',
                price: '3500',
                image: 'https://www.smilecentre.in/assets/images/treatments/root-canal-procedure.jpg',
                icon: 'FaTooth'
            },
            {
                name: 'Scaling & Cleaning',
                description: 'Professional removal of plaque and tartar deposits. Essential for healthy gums and fresh breath.',
                whyNeed: 'Prevents gum disease, stops bad breath, brightens your smile.',
                price: '800',
                image: 'https://images.unsplash.com/photo-1674775372064-8c75d3f8c757?q=80&w=687',
                icon: 'FaMagic'
            },
            {
                name: 'Crowns & Bridges',
                description: 'Fixed prosthetic devices cemented onto existing teeth or implants to restore shape, size, strength, and appearance.',
                whyNeed: 'Restores broken teeth, replaces missing teeth, improves bite alignment.',
                price: '3500',
                image: 'https://www.cyprusfamilydental.com/wp-content/uploads/2022/12/Depositphotos_274172422_L.jpg',
                icon: 'FaBriefcaseMedical'
            },
            {
                name: 'Dental Implants',
                description: 'A permanent replacement for missing roots, providing a strong foundation for fixed or removable replacement teeth.',
                whyNeed: 'Restores natural smile, improves speech and eating, long-term durable solution.',
                price: '25000',
                image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dental-implant-illustration.jpg',
                icon: 'FaUserMd'
            },
            {
                name: 'Dental Fillings',
                description: 'Tooth-colored fillings used to restore teeth that have small cavities or minor fractures.',
                whyNeed: 'Stops decay, restores tooth structure, looks completely natural.',
                price: '1000',
                image: 'https://images.unsplash.com/photo-1694345215004-837b089f620d?q=80&w=1929',
                icon: 'FaPills'
            },
            {
                name: 'Orthodontic Braces',
                description: 'Orthodontic treatment to correct teeth alignment and bite issues. Options include traditional braces and clear aligners.',
                whyNeed: 'Straightens crooked teeth, corrects jaw issues, improves long-term oral health.',
                price: '15000',
                image: 'https://smilecreations.in/wp-content/uploads/2023/11/understanding-metal-braces.jpg',
                icon: 'FaNotesMedical'
            },
            {
                name: 'Tooth Extraction',
                description: 'Painless removal of a tooth that is damaged beyond repair, infected, or causing crowding.',
                whyNeed: 'Relieves chronic pain, prevents infection spread, prepares for orthodontic work.',
                price: '500',
                image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?q=80&w=1631',
                icon: 'FaMedkit'
            },
            {
                name: 'Teeth Whitening',
                description: 'Professional teeth whitening for a brighter and more confident smile.',
                whyNeed: 'Removes stains, boosts self-confidence, quick and non-invasive procedure.',
                price: '5000',
                image: 'https://www.smilecentre.in/assets/images/treatments/tooth-whitening.jpg',
                icon: 'FaMagic'
            },
            {
                name: "Kid's Dentistry",
                description: 'Specialized dental care for children, focusing on prevention and early treatment.',
                whyNeed: 'Ensures healthy growth, prevents early decay, creates positive dental experiences.',
                price: '500',
                image: 'https://www.dratuljajoo.com/wp-content/uploads/2018/09/kids-dentistry.jpg',
                icon: 'FaRegSmileBeam'
            },
            {
                name: 'Full Mouth X-Ray',
                description: 'Comprehensive digital imaging to assess overall oral health and detect underlying issues.',
                whyNeed: 'Early detection of problems, precise diagnosis, planning complex treatments.',
                price: '500',
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjXnsLV9glWBJ77_38thCOxDEeWWN0sqTD3A&s',
                icon: 'FaTooth'
            },
            {
                name: 'General Consultation',
                description: 'General consultation for any other dental issues.',
                whyNeed: 'Comprehensive checkup and professional advice.',
                price: '300',
                image: 'https://images.unsplash.com/photo-1758691461916-dc7894eb8f94?q=80&w=1632',
                icon: 'FaMedkit'
            },
        ];

        await Treatment.insertMany(sampleTreatments);
        res.json({ message: 'Treatments seeded successfully', count: sampleTreatments.length });
    } catch (error) {
        res.status(500).json({ message: 'Seeding Failed', error: error.message });
    }
};

module.exports = { getAllTreatments, seedTreatments };
