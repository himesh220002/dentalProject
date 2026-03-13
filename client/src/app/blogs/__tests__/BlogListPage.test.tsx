import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BlogListPage from '../page';
import axios from 'axios';
import { ClinicProvider } from '@/context/ClinicContext';

vi.mock('axios');

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode, href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

const mockBlogs = [
    {
        _id: '1',
        title: 'Oral Health Tips',
        slug: 'oral-health-tips',
        content: '<p>Brush twice a day.</p>',
        author: 'Dr. Smile',
        tags: ['Health', 'Tips'],
        createdAt: new Date().toISOString()
    },
    {
        _id: '2',
        title: 'Cavity Prevention',
        slug: 'cavity-prevention',
        content: '<p>Avoid sugar.</p>',
        author: 'Dr. Guard',
        tags: ['Prevention'],
        createdAt: new Date().toISOString()
    }
];

describe('BlogListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = () => render(
        <ClinicProvider>
            <BlogListPage />
        </ClinicProvider>
    );

    it('should show loading skeletons initially', () => {
        (axios.get as any).mockReturnValue(new Promise(() => { })); // Never resolves
        renderPage();
        // Skeletons don't have text, but we can check if the hero title is there
        expect(screen.getByText(/Clinic/i)).toBeInTheDocument();
        expect(screen.getByText(/Insights/i)).toBeInTheDocument();
    });

    it('should render blogs after fetching', async () => {
        (axios.get as any).mockResolvedValue({ data: mockBlogs });
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Oral Health Tips')).toBeInTheDocument();
            expect(screen.getByText('Cavity Prevention')).toBeInTheDocument();
        });
    });

    it('should filter blogs based on search term', async () => {
        (axios.get as any).mockResolvedValue({ data: mockBlogs });
        renderPage();

        await waitFor(() => screen.getByText('Oral Health Tips'));

        const searchInput = screen.getByPlaceholderText(/Search blogs or topics/i);
        fireEvent.change(searchInput, { target: { value: 'Tips' } });

        expect(screen.getByText('Oral Health Tips')).toBeInTheDocument();
        expect(screen.queryByText('Cavity Prevention')).not.toBeInTheDocument();
    });

    it('should show "No blogs found" when search yields no results', async () => {
        (axios.get as any).mockResolvedValue({ data: mockBlogs });
        renderPage();

        await waitFor(() => screen.getByText('Oral Health Tips'));

        const searchInput = screen.getByPlaceholderText(/Search blogs or topics/i);
        fireEvent.change(searchInput, { target: { value: 'UnknownTopic' } });

        expect(screen.getByText(/No blogs found/i)).toBeInTheDocument();
    });
});
