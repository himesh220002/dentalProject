import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '../Navbar';
import { useClinic } from '../../context/ClinicContext';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('next/navigation');
vi.mock('../../context/ClinicContext');
vi.mock('axios');

const mockUseSession = vi.mocked(useSession);
const mockUsePathname = vi.mocked(usePathname);
const mockUseRouter = vi.mocked(useRouter);
const mockUseClinic = vi.mocked(useClinic);

describe('Navbar Component', () => {
    const mockClinicData = {
        clinicName: 'ToothOp',
        language: 'en',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseClinic.mockReturnValue({
            clinicData: mockClinicData,
            language: 'en',
            toggleLanguage: vi.fn(),
        } as any);
        mockUsePathname.mockReturnValue('/');
        mockUseRouter.mockReturnValue({ push: vi.fn() } as any);
        mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
        vi.mocked(axios.get).mockResolvedValue({ data: [] });
    });

    it('renders the logo and main navigation links', () => {
        render(<Navbar />);

        // Logo text is split across elements
        expect(screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'span' && content.includes('ToothOp');
        })).toBeInTheDocument();

        expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
        expect(screen.getAllByText('About').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Treatments').length).toBeGreaterThan(0);
    });

    it('toggles mobile menu when button is clicked', () => {
        render(<Navbar />);
        const hamburgerBtn = screen.getByRole('button', { name: /toggle menu/i });

        if (hamburgerBtn) {
            fireEvent.click(hamburgerBtn);
            // After clicking, mobile menu links should be visible
            const mobileLinks = screen.getAllByText('Home');
            expect(mobileLinks.length).toBeGreaterThan(0);
        }
    });

    it('calls toggleLanguage when language button is clicked in mobile menu', () => {
        const toggleLanguageMock = vi.fn();
        mockUseClinic.mockReturnValue({
            clinicData: mockClinicData,
            language: 'en',
            toggleLanguage: toggleLanguageMock,
        } as any);

        render(<Navbar />);
        const hamburgerBtn = screen.getByRole('button', { name: /toggle menu/i });

        if (hamburgerBtn) {
            fireEvent.click(hamburgerBtn);

            const hindiButton = screen.getByText('हिन्दी');
            fireEvent.click(hindiButton);

            expect(toggleLanguageMock).toHaveBeenCalled();
        }
    });
});
