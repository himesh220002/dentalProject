import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window methods not implemented in JSDOM
global.alert = vi.fn();
window.open = vi.fn();

// Mock console.error to keep logs clean during expected error tests
const originalError = console.error;
console.error = (...args) => {
    if (args[0]?.includes?.('Error fetching active clinic data') ||
        args[0]?.includes?.('Error adding patient')) {
        return;
    }
    originalError(...args);
};
