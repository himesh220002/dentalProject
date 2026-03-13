import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import DashboardOverview from '../page';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('axios');
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>
}));

// Mock sub-components
vi.mock('@/components/WeeklyPlanner', () => ({
    default: () => <div data-testid="weekly-planner">Weekly Planner</div>
}));

vi.mock('@/components/dashboard/CustomerInsightsModal', () => ({
    default: () => <div data-testid="insights-modal">Insights Modal</div>
}));

describe('Dashboard Overview Page', () => {
    const mockPatients = [{ _id: 'p1', name: 'Patient One' }, { _id: 'p2', name: 'Patient Two' }];
    const mockContacts = [{ _id: 'm1', status: 'Unread', name: 'Message One', createdAt: new Date().toISOString() }];
    const mockAppointments = [
        {
            _id: 'a1',
            date: new Date().toISOString(),
            time: '10:00',
            reason: 'Scaling',
            isTicked: false,
            status: 'Scheduled',
            patientId: { _id: 'p1', name: 'Patient One' },
            createdAt: new Date().toISOString()
        }
    ];
    const mockTreatments = [{ _id: 't1', name: 'Scaling' }];
    const mockStats = { todayCollection: 5000 };

    beforeEach(() => {
        vi.clearAllMocks();

        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('/api/patients')) return Promise.resolve({ data: mockPatients });
            if (url.includes('/api/contacts')) return Promise.resolve({ data: mockContacts });
            if (url.includes('/api/appointments/stats')) return Promise.resolve({ data: mockStats });
            if (url.includes('/api/appointments')) return Promise.resolve({ data: mockAppointments });
            if (url.includes('/api/treatments')) return Promise.resolve({ data: mockTreatments });
            return Promise.resolve({ data: {} });
        });
    });

    it('renders dashboard stats correctly', async () => {
        render(<DashboardOverview />);

        // Wait for data to load
        expect(await screen.findByText(/Clinic Overview/i)).toBeInTheDocument();

        // Find "Total Patients" card and check its value
        const patientsCard = screen.getByText(/Total Patients/i).closest('div');
        expect(within(patientsCard!).getByText('2')).toBeInTheDocument();

        // Find "New Messages" card and check its value
        const messagesCard = screen.getByText(/New Messages/i).closest('div');
        expect(within(messagesCard!).getByText('1')).toBeInTheDocument();
    });

    it('renders recent activity item correctly', async () => {
        render(<DashboardOverview />);

        expect(await screen.findByText(/Recent Activity/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Patient One/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Scaling/i).length).toBeGreaterThan(0);
    });

    it('renders today\'s queue correctly', async () => {
        render(<DashboardOverview />);

        expect(await screen.findByText(/Today's Queue/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Patient One/i).length).toBeGreaterThan(0);
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('shows empty states when no data is returned', async () => {
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('stats')) return Promise.resolve({ data: { todayCollection: 0 } });
            return Promise.resolve({ data: [] });
        });

        render(<DashboardOverview />);

        expect(await screen.findByText(/No recent activity/i)).toBeInTheDocument();
        expect(screen.getByText(/Queue Clear/i)).toBeInTheDocument();
    });
});
