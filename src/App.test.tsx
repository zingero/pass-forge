import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByText('Secure Password Generator')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Generate strong passwords locally in your browser')).toBeInTheDocument();
  });

  it('generates a password on initial render', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).not.toBe('');
  });

  it('generates a new password when the button is clicked', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;

    const button = screen.getByText('Generate New Password');
    fireEvent.click(button);

    expect(input.value).not.toBe('');
  });

  it('displays password length label', () => {
    render(<App />);
    expect(screen.getByText(/Password Length: 16/)).toBeInTheDocument();
  });

  it('updates password length when slider changes', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '24' } });
    expect(screen.getByText(/Password Length: 24/)).toBeInTheDocument();
  });

  it('renders all option checkboxes', () => {
    render(<App />);
    expect(screen.getByText('Uppercase')).toBeInTheDocument();
    expect(screen.getByText('Lowercase')).toBeInTheDocument();
    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(screen.getByText('Symbols')).toBeInTheDocument();
    expect(screen.getByText('Avoid Similar Characters (1, l, I, 0, O)')).toBeInTheDocument();
    expect(screen.getByText('Generate Memorable Password')).toBeInTheDocument();
  });

  it('clears the password when clear button is clicked', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).not.toBe('');

    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);
    expect(input.value).toBe('');
  });

  it('copies password to clipboard when copy button is clicked', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    const copyButton = screen.getByTitle('Copy to clipboard');

    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(input.value);
  });

  it('does not copy when password is empty', () => {
    render(<App />);
    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);

    // After clear, the clear button disappears, but copy remains
    const copyButton = screen.getByTitle('Copy to clipboard');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('handles wheel event to change length (scroll up increases)', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    const container = slider.parentElement!;

    fireEvent.wheel(container, { deltaY: -100 });
    expect(screen.getByText(/Password Length: 17/)).toBeInTheDocument();
  });

  it('handles wheel event to change length (scroll down decreases)', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    const container = slider.parentElement!;

    fireEvent.wheel(container, { deltaY: 100 });
    expect(screen.getByText(/Password Length: 15/)).toBeInTheDocument();
  });

  it('clamps wheel length to minimum 8', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });

    const container = slider.parentElement!;
    fireEvent.wheel(container, { deltaY: 100 });
    expect(screen.getByText(/Password Length: 8/)).toBeInTheDocument();
  });

  it('clamps wheel length to maximum 32', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '32' } });

    const container = slider.parentElement!;
    fireEvent.wheel(container, { deltaY: -100 });
    expect(screen.getByText(/Password Length: 32/)).toBeInTheDocument();
  });

  it('toggles checkbox options and regenerates password', () => {
    render(<App />);
    const checkboxes = screen.getAllByRole('checkbox');
    // Toggle the "memorable" checkbox (last one)
    fireEvent.click(checkboxes[checkboxes.length - 1]);

    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).not.toBe('');
  });

  it('shows error message when all character options are unchecked', () => {
    render(<App />);
    const checkboxes = screen.getAllByRole('checkbox');

    // Uncheck uppercase, lowercase, numbers, symbols (first 4)
    fireEvent.click(checkboxes[0]); // uppercase
    fireEvent.click(checkboxes[1]); // lowercase
    fireEvent.click(checkboxes[2]); // numbers
    fireEvent.click(checkboxes[3]); // symbols

    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).toBe('Please select at least one option');
  });
});
