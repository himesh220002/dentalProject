import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('ProtectedRoute', () => {
    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (useRouter as any).mockReturnValue({ push: mockPush });
    });

    it('should render children if authenticated', () => {
        localStorage.setItem('clinic_admin_locked', 'false');
        localStorage.setItem('clinic_admin_expiry', (Date.now() + 3600000).toString());

        render(
            <ProtectedRoute>
                <div data-testid="protected-content">Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should show restricted access message if not authenticated', () => {
        render(
            <ProtectedRoute>
                <div>Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should open the lock modal when "Unlock Now" is clicked', () => {
        render(
            <ProtectedRoute>
                <div>Content</div>
            </ProtectedRoute>
        );

        fireEvent.click(screen.getByText(/Unlock Now/i));
        // AdminLockModal is rendered inside ProtectedRoute
        expect(screen.getByText(/Clinic Admin Access/i)).toBeInTheDocument();
    });
});
