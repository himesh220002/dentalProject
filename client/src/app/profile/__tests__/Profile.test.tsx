import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '../page';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('axios');

vi.mock('next-auth/react', () => ({
    useSession: vi.fn()
}));

// Mock SessionGuard to just render children
vi.mock('@/components/SessionGuard', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        disconnect: vi.fn()
    }))
}));

describe('Profile Page Component', () => {
    const mockUser = { id: 'u1', name: 'John Doe', email: 'john@example.com', image: null };
    const mockPatient = {
        _id: 'p1',
        name: 'John Doe',
        age: 30,
        contact: '1234567890',
        email: 'john@example.com',
        createdAt: '2025-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSession as any).mockReturnValue({ data: { user: mockUser } });

        // Default API responses
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('/api/auth/google/u1')) {
                return Promise.resolve({ data: { patientId: mockPatient } });
            }
            if (url.includes('/api/treatment-records/patient/p1')) {
                return Promise.resolve({ data: [] });
            }
            if (url.includes('/api/appointments/patient/p1')) {
                return Promise.resolve({ data: [] });
            }
            return Promise.resolve({ data: {} });
        });
    });

    it('renders user personal information correctly', async () => {
        render(<ProfilePage />);

        await waitFor(() => {
            // Using a loose matcher for the name which is in a heading
            expect(screen.getByRole('heading', { name: /John Doe/i })).toBeInTheDocument();
            expect(screen.getByText(/Member since 2025/i)).toBeInTheDocument();
        }, { timeout: 4000 });

        const ageInput = screen.getByPlaceholderText(/Your age/i) as HTMLInputElement;
        expect(ageInput.value).toBe('30');
    });

    it('shows upcoming appointment when available', async () => {
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('/api/auth/google/u1')) {
                return Promise.resolve({ data: { patientId: mockPatient } });
            }
            if (url.includes('/api/treatment-records/patient/p1')) {
                return Promise.resolve({ data: [] });
            }
            if (url.includes('/api/appointments/patient/p1')) {
                return Promise.resolve({
                    data: [{
                        _id: 'apt1',
                        date: new Date(Date.now() + 86400000).toISOString(),
                        time: '10:00 am',
                        reason: 'Scaling',
                        status: 'Scheduled',
                        isTicked: false
                    }]
                });
            }
            return Promise.resolve({ data: [] });
        });

        render(<ProfilePage />);

        // Use a very loose matcher to find at least one instance of the text
        await waitFor(() => {
            const elements = screen.queryAllByText(/Fixed Appointment/i);
            expect(elements.length).toBeGreaterThan(0);
            expect(screen.queryAllByText(/Scaling/i).length).toBeGreaterThan(0);
        }, { timeout: 5000 });
    });

    it('displays treatment history records', async () => {
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('/api/auth/google/u1')) {
                return Promise.resolve({ data: { patientId: mockPatient } });
            }
            if (url.includes('/api/treatment-records/patient/p1')) {
                return Promise.resolve({
                    data: [{
                        _id: 'rec1',
                        date: '2025-02-15T00:00:00.000Z',
                        treatmentName: 'Root Canal',
                        cost: '5000',
                        paymentStatus: 'Paid',
                        notes: 'Initial checkup'
                    }]
                });
            }
            return Promise.resolve({ data: [] });
        });

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByText(/Root Canal/i)).toBeInTheDocument();
            expect(screen.getByText(/₹5000/i)).toBeInTheDocument();
        }, { timeout: 4000 });
    });
});
