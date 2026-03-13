import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Treatments from '../page';
import { useClinic } from '../../../context/ClinicContext';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn()
}));

vi.mock('../../../context/ClinicContext');
const mockUseClinic = vi.mocked(useClinic);

// Mock fetch for the API fallback
const mockFetch = vi.fn<any>();
vi.stubGlobal('fetch', mockFetch);

describe('Treatments Page Component', () => {
    const mockRouter = { push: vi.fn() };
    const mockClinicData = {
        treatments: [
            { name: 'Root Canal', description: 'RC treatment', price: '2000', image: '', icon: 'FaTooth' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
        mockUseClinic.mockReturnValue({
            clinicData: mockClinicData,
            language: 'en',
            isLoading: false
        } as any);
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [{ _id: 't1', name: 'Scaling', description: 'Scaling desc', price: '₹1000', icon: 'FaTooth' }]
        });
    });

    it('renders treatments from clinic context', async () => {
        render(<Treatments />);

        expect(await screen.findByText(/Root Canal/i)).toBeInTheDocument();
        expect(screen.getByText(/RC treatment/i)).toBeInTheDocument();
        expect(screen.getByText(/₹2000/i)).toBeInTheDocument();
    });

    it('renders treatments from API when context data is missing', async () => {
        mockUseClinic.mockReturnValue({
            clinicData: { treatments: [] },
            language: 'en',
            isLoading: false
        } as any);

        render(<Treatments />);

        // First wait for fetch to be called
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        // Then check for the text to appear
        expect(await screen.findByText('Scaling')).toBeInTheDocument();
        expect(await screen.findByText('Scaling desc')).toBeInTheDocument();
    });

    it('navigates to contact page when Book Appointment is clicked', async () => {
        render(<Treatments />);

        const bookButton = await screen.findByRole('button', { name: /Book Appointment/i });
        fireEvent.click(bookButton);

        expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('contact?treatment=Root%20Canal'));
    });
});
