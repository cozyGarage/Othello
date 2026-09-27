import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  test('Play and Stats are buttons that run their actions', () => {
    const onPlayClick = vi.fn();
    const onStatsClick = vi.fn();
    render(<Navbar onPlayClick={onPlayClick} onStatsClick={onStatsClick} />);

    fireEvent.click(screen.getByRole('button', { name: '▶ Play' }));
    fireEvent.click(screen.getByRole('button', { name: '📊 Stats' }));

    expect(onPlayClick).toHaveBeenCalledTimes(1);
    expect(onStatsClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Learn' }).getAttribute('href')).toBe('#learn');
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('#about');
  });

  test('navigation closes the mobile menu', () => {
    render(<Navbar />);
    const toggle = document.querySelector('.navbar-toggle');
    if (!toggle) throw new Error('menu toggle missing');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.navbar-nav')?.classList.contains('open')).toBe(true);

    fireEvent.click(screen.getByRole('link', { name: 'Blog' }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.navbar-nav')?.classList.contains('open')).toBe(false);
  });
});
