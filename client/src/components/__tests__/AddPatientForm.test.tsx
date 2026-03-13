import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddPatientForm from '../AddPatientForm';
import axios from 'axios';

vi.mock('axios');

describe('AddPatientForm', () => {
    const mockOnPatientAdded = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show the "Add New Patient" button initially', () => {
        render(<AddPatientForm onPatientAdded={mockOnPatientAdded} />);
        expect(screen.getByText(/Add New Patient/i)).toBeInTheDocument();
    });

    it('should open the form when the button is clicked', () => {
        render(<AddPatientForm onPatientAdded={mockOnPatientAdded} />);
        fireEvent.click(screen.getByText(/Add New Patient/i));
        expect(screen.getByText(/New Patient Record/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter name/i)).toBeInTheDocument();
    });

    it('should close the form when the "Discard" button is clicked', () => {
        render(<AddPatientForm onPatientAdded={mockOnPatientAdded} />);
        fireEvent.click(screen.getByText(/Add New Patient/i));
        fireEvent.click(screen.getByText(/DISCARD/i));
        expect(screen.queryByText(/New Patient Record/i)).not.toBeInTheDocument();
    });

    it('should successfully submit the form and call onPatientAdded', async () => {
        (axios.post as any).mockResolvedValue({ data: { success: true } });

        render(<AddPatientForm onPatientAdded={mockOnPatientAdded} />);
        fireEvent.click(screen.getByText(/Add New Patient/i));

        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Years/i), { target: { value: '30' } });
        fireEvent.change(screen.getByPlaceholderText(/10 digit number/i), { target: { value: '1234567890' } });

        fireEvent.click(screen.getByText(/SAVE RECORD/i));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/patients'), expect.objectContaining({
                name: 'John Doe',
                age: 30,
                contact: '1234567890'
            }));
            expect(mockOnPatientAdded).toHaveBeenCalled();
        });

        // Form should be closed
        expect(screen.queryByText(/New Patient Record/i)).not.toBeInTheDocument();
    });

    it('should show an alert if the submission fails', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        (axios.post as any).mockRejectedValue(new Error('API Error'));

        render(<AddPatientForm onPatientAdded={mockOnPatientAdded} />);
        fireEvent.click(screen.getByText(/Add New Patient/i));

        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Years/i), { target: { value: '30' } });
        fireEvent.change(screen.getByPlaceholderText(/10 digit number/i), { target: { value: '1234567890' } });

        fireEvent.click(screen.getByText(/SAVE RECORD/i));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to add patient');
        });

        alertSpy.mockRestore();
    });
});
