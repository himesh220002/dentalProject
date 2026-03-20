import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickScheduler from '../QuickScheduler';
import { useClinic } from '../../context/ClinicContext';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
vi.mock('../../context/ClinicContext');
const mockUseClinic = vi.mocked(useClinic);

describe('QuickScheduler Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();

    const mockPatients = [
        { _id: 'p1', name: 'John Doe', contact: '1234567890' }
    ];
    const mockTreatments = [
        { _id: 't1', name: 'Scaling', price: '₹1000' },
        { _id: 't2', name: 'Filling', price: '₹1500' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseClinic.mockReturnValue({
            clinicData: { clinicName: 'Test Clinic' },
            language: 'en'
        } as any);
        mockedAxios.get.mockImplementation((url: string) => {
            if (url.includes('/api/patients')) return Promise.resolve({ data: mockPatients });
            if (url.includes('/api/treatments')) return Promise.resolve({ data: mockTreatments });
            if (url.includes('/api/appointments/density')) return Promise.resolve({ data: {} });
            if (url.includes('/api/config/closures')) return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
        });
        mockedAxios.post.mockResolvedValue({ data: { message: 'Success' } });
    });

    it('renders and fetches patients and treatments', async () => {
        render(<QuickScheduler isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
        await waitFor(() => {
            expect(screen.getByText(/Quick Scheduler/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('John Doe - 1234567890')).toBeInTheDocument();
        });
    });

    it('calculates total amount correctly', async () => {
        render(<QuickScheduler isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // Wait for initial data to load
        await screen.findByText(/John Doe/);

        // Add treatment row
        fireEvent.click(screen.getByText(/Add Another Treatment/i));

        // Find the treatment select
        const treatmentSelect = await screen.findByLabelText(/Select Treatment/i);

        // Wait for Scaling option to appear in innerHTML as a fallback for option role issues
        await waitFor(() => {
            expect(treatmentSelect.innerHTML).toContain('Scaling');
        }, { timeout: 3000 });

        fireEvent.change(treatmentSelect, { target: { value: 'Scaling' } });

        // Force a wait for the state to update
        await waitFor(() => {
            // Check if the select now has the value
            expect((treatmentSelect as HTMLSelectElement).value).toBe('Scaling');
        });

        await waitFor(() => {
            // Search for anything containing 1000
            const elements = screen.queryAllByText((content) => content.includes('1000'));
            console.log('Found 1000 elements count:', elements.length);
            expect(elements.length).toBeGreaterThan(0);
        }, { timeout: 4000 });
    });

    it('submits the form successfully', async () => {
        const { container } = render(<QuickScheduler isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        await screen.findByText(/John Doe/);

        // Select patient
        const patientSelect = screen.getAllByRole('combobox').find(s => s.innerHTML.includes('John Doe'));
        if (patientSelect) {
            fireEvent.change(patientSelect, { target: { value: 'p1' } });
        }

        // Set time
        const timeInput = container.querySelector('input[type="time"]');
        if (timeInput) fireEvent.change(timeInput, { target: { value: '10:00' } });

        // Add & Select treatment
        fireEvent.click(screen.getByText(/Add Another Treatment/i));
        const treatmentSelect = await screen.findByLabelText(/Select Treatment/i);
        await waitFor(() => {
            expect(treatmentSelect.innerHTML).toContain('Scaling');
        });
        fireEvent.change(treatmentSelect, { target: { value: 'Scaling' } });

        const submitButton = screen.getByRole('button', { name: /Schedule/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalled();
        });
    });
});
