const request = require('supertest');
const { app } = require('../index');
const Blog = require('../models/Blog');

describe('Blog API & CRUD Logic', () => {
    it('should create a blog and generate a slug automatically', async () => {
        const blogData = {
            title: 'Modern Dental Care 2026',
            content: 'Content about modern dental care.',
            author: 'Dr. Tooth',
            status: 'published'
        };

        const res = await request(app)
            .post('/api/blogs')
            .send(blogData);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Modern Dental Care 2026');
        expect(res.body.slug).toBe('modern-dental-care-2026');
    });

    it('should only return published blogs for public endpoint', async () => {
        await Blog.create({ title: 'Published Blog', content: '...', status: 'published' });
        await Blog.create({ title: 'Draft Blog', content: '...', status: 'draft' });

        const res = await request(app).get('/api/blogs');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Published Blog');
    });

    it('should return all blogs for admin endpoint', async () => {
        await Blog.create({ title: 'Blog A', content: '...', status: 'published' });
        await Blog.create({ title: 'Blog B', content: '...', status: 'draft' });

        const res = await request(app).get('/api/blogs/admin/all');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('should update a blog title and regenerate slug', async () => {
        const blog = await Blog.create({ title: 'Old Title', content: '...', status: 'published' });

        const res = await request(app)
            .put(`/api/blogs/${blog._id}`)
            .send({ title: 'New Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('New Updated Title');
        expect(res.body.slug).toBe('new-updated-title');
    });

    it('should delete a blog', async () => {
        const blog = await Blog.create({ title: 'Delete Me', content: '...', status: 'draft' });

        const res = await request(app).delete(`/api/blogs/${blog._id}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Blog removed');

        const deletedBlog = await Blog.findById(blog._id);
        expect(deletedBlog).toBeNull();
    });
});
