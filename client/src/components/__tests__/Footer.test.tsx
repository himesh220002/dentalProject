import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import { describe, it, expect, vi } from 'vitest';

// Mock the ClinicContext since Footer uses useClinic
vi.mock('@/context/ClinicContext', () => ({
    useClinic: () => ({
        clinicData: {
            clinicName: 'Dr. Tooth Dental',
            email: 'care@drtoothdental.in',
            phone: '+91 90000 00000',
            socialLinks: {
                facebook: '#',
                twitter: '#',
                instagram: '#',
                linkedin: '#'
            },
            timings: {
                monday: '09:00 AM - 08:00 PM',
                sunday: 'Closed'
            },
            address: {
                street: 'Dental Road',
                city: 'Katihar',
                state: 'Bihar',
                zip: '854105'
            },
            treatments: [
                { name: 'Root Canal', price: '3000' }
            ]
        },
        language: 'en'
    })
}));

describe('Footer Component', () => {
    it('renders the clinic name correctly', () => {
        render(<Footer />);
        expect(screen.getByText(/Dr. Tooth Dental/i)).toBeInTheDocument();
    });

    it('displays the contact email', () => {
        render(<Footer />);
        expect(screen.getByText(/care@drtoothdental.in/i)).toBeInTheDocument();
    });
});
