import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since we don't know exactly what's on the page, just checking if it renders is a good start.
        // Or check for something generic if we knew the content.
        expect(document.body).toBeTruthy();
    });
});
