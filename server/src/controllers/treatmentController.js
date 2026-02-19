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
                name: 'Root Canal Treatment (RCT)',
                description: 'A procedure to save a badly decayed or infected tooth by removing the nerve and pulp, then cleaning and sealing it.',
                whyNeed: 'Stops severe toothache, saves natural tooth, prevents spread of infection.',
                price: 'Start from ₹2500',
                icon: 'FaTooth'
            },
            {
                name: 'Teeth Cleaning (Scaling)',
                description: 'Professional removal of plaque and tartar deposits. Essential for healthy gums and fresh breath.',
                whyNeed: 'Prevents gum disease, stops bad breath, brightens your smile.',
                price: 'Start from ₹800',
                icon: 'FaMagic'
            },
            {
                name: 'Dental Crowns & Bridges',
                description: 'Fixed prosthetic devices cemented onto existing teeth or implants to restore shape, size, strength, and appearance.',
                whyNeed: 'Restores broken teeth, replaces missing teeth, improves bite alignment.',
                price: 'Start from ₹3500',
                icon: 'FaBriefcaseMedical'
            },
            {
                name: 'Dental Implants',
                description: 'A permanent replacement for missing roots, providing a strong foundation for fixed or removable replacement teeth.',
                whyNeed: 'Restores natural smile, improves speech and eating, long-term durable solution.',
                price: 'Start from ₹15,000',
                icon: 'FaUserMd'
            },
            {
                name: 'Composite Fillings',
                description: 'Tooth-colored fillings used to restore teeth that have small cavities or minor fractures.',
                whyNeed: 'Stops decay, restores tooth structure, looks completely natural.',
                price: 'Start from ₹1000',
                icon: 'FaPills'
            },
            {
                name: 'Braces & Aligners',
                description: 'Orthodontic treatment to correct teeth alignment and bite issues. Options include traditional braces and clear aligners.',
                whyNeed: 'Straightens crooked teeth, corrects jaw issues, improves long-term oral health.',
                price: 'Start from ₹15,000',
                icon: 'FaNotesMedical'
            },
            {
                name: 'Full & Partial Dentures',
                description: 'Removable replacements for missing teeth and surrounding tissues, custom-made to fit your mouth.',
                whyNeed: 'Restores ability to chew and speak, supports facial muscles, cost-effective replacement.',
                price: 'Start from ₹8000',
                icon: 'FaTeeth'
            },
            {
                name: 'Tooth Extraction',
                description: 'Painless removal of a tooth that is damaged beyond repair, infected, or causing crowding.',
                whyNeed: 'Relieves chronic pain, prevents infection spread, prepares for orthodontic work.',
                price: 'Start from ₹500',
                icon: 'FaMedkit'
            },
            {
                name: 'Other / General Consultation',
                description: 'General consultation for any other dental issues.',
                whyNeed: 'General consultation for any other dental issues.',
                price: 'Start from ₹100',
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
