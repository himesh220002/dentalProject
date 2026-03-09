const express = require('express');
const router = express.Router();
const {
    getAllBlogs,
    getAdminBlogs,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    seedBlogs
} = require('../controllers/blogController');

// Public routes
router.get('/', getAllBlogs);
router.post('/seed', seedBlogs);
router.get('/:slug', getBlogBySlug);

// Admin routes (In a real app, these would have admin middleware)
router.get('/admin/all', getAdminBlogs);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
