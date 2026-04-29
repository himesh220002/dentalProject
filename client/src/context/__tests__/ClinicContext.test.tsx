import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ClinicProvider, useClinic } from '../ClinicContext';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const TestComponent = () => {
    const { clinicData, isLoading, error, language, toggleLanguage } = useClinic();
    return (
        <div>
            <div data-testid="clinic-name">{clinicData?.clinicName}</div>
            <div data-testid="loading">{isLoading ? 'Loading' : 'Loaded'}</div>
            <div data-testid="error">{error}</div>
            <div data-testid="language">{language}</div>
            <button onClick={toggleLanguage}>Toggle Language</button>
        </div>
    );
};

describe('ClinicContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('provides initial default data and toggles language', async () => {
        mockedAxios.get.mockImplementation(() => new Promise(() => { })); // Never resolves to keep loading

        render(
            <ClinicProvider>
                <TestComponent />
            </ClinicProvider>
        );

        expect(screen.getByTestId('clinic-name')).toHaveTextContent('Dr. Tooth Dental');
        expect(screen.getByTestId('language')).toHaveTextContent('en');

        const button = screen.getByText('Toggle Language');
        await act(async () => {
            button.click();
        });

        expect(screen.getByTestId('language')).toHaveTextContent('hi');
        expect(localStorage.getItem('clinic_lang')).toBe('hi');
    });

    it('updates data when API call succeeds', async () => {
        const mockData = {
            jsondata: {
                clinicName: 'Test Clinic From API'
            }
        };
        mockedAxios.get.mockResolvedValue({ data: mockData });

        render(
            <ClinicProvider>
                <TestComponent />
            </ClinicProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('clinic-name')).toHaveTextContent('Test Clinic From API');
        });
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    it('handles API error and keeps default data', async () => {
        mockedAxios.get.mockRejectedValue({
            response: { data: { message: 'API Error' } }
        });

        render(
            <ClinicProvider>
                <TestComponent />
            </ClinicProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('error')).toHaveTextContent('API Error');
        });
        expect(screen.getByTestId('clinic-name')).toHaveTextContent('Dr. Tooth Dental');
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });
});
