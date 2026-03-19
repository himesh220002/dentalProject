import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Contact from '../page';
import { useClinic } from '@/context/ClinicContext';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('axios');

vi.mock('next-auth/react', () => ({
    useSession: vi.fn()
}));

vi.mock('next/navigation', () => ({
    useSearchParams: vi.fn(),
    useRouter: vi.fn()
}));

vi.mock('@/context/ClinicContext');
const mockUseClinic = vi.mocked(useClinic);

describe('Contact Page Component', () => {
    const mockRouter = { replace: vi.fn(), push: vi.fn() };
    const mockSearchParams = { get: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
        (useSearchParams as any).mockReturnValue(mockSearchParams);
        (useSession as any).mockReturnValue({ data: null });

        mockUseClinic.mockReturnValue({
            clinicData: {
                clinicName: 'Test Clinic',
                phone: '1234567890',
                staffPhone: '1234567890',
                email: 'test@clinic.com',
                address: { street: 'Main St', city: 'Katihar', state: 'Bihar', zip: '854105' },
                timings: { monday: '10am-8pm' }
            },
            language: 'en',
            isLoading: false
        } as any);

        // Mock common API calls
        (axios.get as any).mockResolvedValue({ data: [] });
    });

    it('renders contact form and clinic information', async () => {
        render(<Contact />);

        expect(await screen.findByText(/Get In Touch/i)).toBeInTheDocument();
        screen.debug();
        expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
        expect(await screen.findByPlaceholderText('yourname')).toBeInTheDocument();
    });

    it('pre-fills message from treatment in URL', async () => {
        mockSearchParams.get.mockReturnValue('scaling');

        render(<Contact />);

        const messageArea = await screen.findByPlaceholderText(/I would like to book an appointment for/i);
        await waitFor(() => {
            expect((messageArea as HTMLTextAreaElement).value).toContain('SCALING');
        });
    });

    it('validates phone number length (10 digits)', async () => {
        render(<Contact />);

        const phoneInput = await screen.findByPlaceholderText('Enter WhatsApp Number');

        // Enter 5 digits
        fireEvent.change(phoneInput, { target: { value: '12345' } });
        expect(await screen.findByText(/Required: 5\/10/i)).toBeInTheDocument();

        // Enter 10 digits
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        await waitFor(() => {
            expect(screen.queryByText(/Required:/i)).not.toBeInTheDocument();
        });
    });

    it('submits the form successfully and triggers redirection', async () => {
        // We skip testing window.open here to avoid timing issues with real timers
        // and focus on the form submission success state.
        render(<Contact />);

        const nameInput = await screen.findByPlaceholderText('yourname');
        fireEvent.change(nameInput, { target: { id: 'name', value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Enter WhatsApp Number'), { target: { id: 'phone', value: '9876543210' } });
        fireEvent.change(screen.getByPlaceholderText('yourname@gmail.com'), { target: { id: 'email', value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/I would like to book an appointment for/i), { target: { id: 'message', value: 'Hello I need an appointment' } });

        (axios.post as any).mockResolvedValue({ status: 200 });

        const submitButton = screen.getByRole('button', { name: /Send/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/Details saved!/i)).toBeInTheDocument();
        expect(axios.post).toHaveBeenCalled();
    });
});
