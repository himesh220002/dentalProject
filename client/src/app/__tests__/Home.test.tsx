import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';
import { useClinic } from '../../context/ClinicContext';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    default: (loader: any) => {
        const Componet = React.lazy(loader);
        return (props: any) => (
            <React.Suspense fallback={<div>Loading...</div>}>
                <Componet {...props} />
            </React.Suspense>
        );
    }
}));

// Partial mocks for component sub-parts if they cause issues
vi.mock('@/components/home/HomeHero', () => ({ default: () => <div data-testid="home-hero">Home Hero</div> }));
vi.mock('@/components/home/ActionTiles', () => ({ default: () => <div data-testid="action-tiles">Action Tiles</div> }));
vi.mock('@/components/home/TrustSection', () => ({ default: () => <div data-testid="trust-section">Trust Section</div> }));
vi.mock('@/components/ClinicCarousel', () => ({ default: () => <div data-testid="clinic-carousel">Clinic Carousel</div> }));

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
vi.mock('next-auth/react');
const mockUseSession = vi.mocked(useSession);
vi.mock('../../context/ClinicContext');
const mockUseClinic = vi.mocked(useClinic);
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        disconnect: vi.fn()
    }))
}));

// Mock caches API
global.caches = {
    open: vi.fn().mockResolvedValue({
        match: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined)
    })
} as any;

describe('Home Page Component', () => {
    const mockClinicData = {
        clinicName: 'Dr. Tooth Dental Clinic',
        doctorName: 'Dr. John Smith',
        consultants: [
            { name: 'Dr. John Smith', role: 'Chief Dental Surgeon', info: 'Expert', experience: '15' }
        ],
        highlights: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() } as any);
        mockUseClinic.mockReturnValue({
            clinicData: mockClinicData,
            language: 'en',
            isLoading: false
        } as any);
        mockedAxios.get.mockResolvedValue({ data: [] });
    });

    it('renders main sections of the home page', async () => {
        render(<Home />);

        expect(screen.getByTestId('home-hero')).toBeInTheDocument();
        expect(screen.getByTestId('action-tiles')).toBeInTheDocument();
        expect(screen.getByTestId('trust-section')).toBeInTheDocument();
        expect(screen.getByText(/Clinical Excellence in Action/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Meet Our Specialists/i).length).toBeGreaterThan(0);
        expect(await screen.findByTestId('clinic-carousel')).toBeInTheDocument();
    });

    it('shows upcoming appointment notification when user is logged in', async () => {
        mockUseSession.mockReturnValue({
            data: { user: { name: 'Test User', id: 'u1', patientId: 'p1' } },
            status: 'authenticated'
        } as any);

        const mockAppointment = {
            _id: 'a1',
            date: new Date().toISOString(),
            time: '10:00 AM',
            status: 'Pending',
            isTicked: false
        };

        mockedAxios.get.mockImplementation((url: string) => {
            if (url.includes('/api/auth/google/u1')) return Promise.resolve({ data: { patientId: 'p1' } });
            if (url.includes('/api/appointments/patient/p1')) return Promise.resolve({ data: [mockAppointment] });
            return Promise.resolve({ data: {} });
        });

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText(/Your Fixed Appointment/i)).toBeInTheDocument();
            expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
        });
    });

    it('displays doctor and team information correctly', () => {
        render(<Home />);

        const doctorNames = screen.getAllByText(/Dr. John Smith/i);
        expect(doctorNames.length).toBeGreaterThan(0);

        const doctorRoles = screen.getAllByText(/Chief Dental Surgeon/i);
        expect(doctorRoles.length).toBeGreaterThan(0);
    });
});
