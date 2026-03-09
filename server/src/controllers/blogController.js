const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all blogs for admin (including drafts)
// @route   GET /api/blogs/admin
// @access  Private (Admin)
const getAdminBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin)
const createBlog = async (req, res) => {
    try {
        const { title, content, author, status, tags, imageUrl } = req.body;
        const newBlog = new Blog({
            title,
            content,
            author,
            status,
            tags,
            imageUrl
        });
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const { title, content, author, status, tags, imageUrl } = req.body;

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.author = author || blog.author;
        blog.status = status || blog.status;
        blog.tags = tags || blog.tags;
        blog.imageUrl = imageUrl || blog.imageUrl;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seed initial blogs
// @route   POST /api/blogs/seed
// @access  Public (for dev)
const seedBlogs = async (req, res) => {
    try {
        await Blog.deleteMany(); // Clear existing data

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

        await Blog.create(sampleBlogs);
        res.json({ message: 'Blogs seeded successfully', count: sampleBlogs.length });
    } catch (error) {
        res.status(500).json({ message: 'Seeding Failed', error: error.message });
    }
};

module.exports = {
    getAllBlogs,
    getAdminBlogs,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    seedBlogs
};
