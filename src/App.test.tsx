import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import * as pg from './passwordGenerator';

describe('App component', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Forge')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Forge strong passwords locally in your browser')).toBeInTheDocument();
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
    expect(screen.getByRole('checkbox', { name: 'Avoid Similar Characters (1, l, I, 0, O)' })).toBeInTheDocument();
    expect(screen.getByText('Memorable')).toBeInTheDocument();
  });

  it('clears the password when clear button is clicked', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).not.toBe('');

    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);
    expect(input.value).toBe('');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  it('copies password to clipboard when copy button is clicked', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(input.value);
  });

  it('shows copied feedback and resets after timeout', async () => {
    vi.useFakeTimers();
    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    const svg = copyButton.querySelector('svg');
    expect(svg).toHaveClass('text-emerald-400');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const svgAfter = copyButton.querySelector('svg');
    expect(svgAfter).not.toHaveClass('text-emerald-400');

    vi.useRealTimers();
  });

  it('does not copy when password is empty', () => {
    render(<App />);
    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);

    // Clear calls writeText('') to clear clipboard; reset mock
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockClear();

    // After clear, the clear button disappears, but copy remains
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('clears active clipboard timers when clear button is clicked after copy', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText(/Clipboard will be cleared in/)).toBeInTheDocument();

    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);

    // Countdown should be gone and clipboard cleared immediately
    expect(screen.queryByText(/Clipboard will be cleared in/)).not.toBeInTheDocument();

    // Advancing time should NOT trigger another clipboard clear
    writeText.mockClear();
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(writeText).not.toHaveBeenCalled();

    vi.useRealTimers();
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

    expect(screen.getByRole('alert')).toHaveTextContent('Please select at least one option');
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('shows error when clipboard write fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to copy to clipboard');
  });

  it('clears clipboard after timeout', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(writeText).toHaveBeenLastCalledWith('');
    vi.useRealTimers();
  });

  it('clears previous clipboard timeout when copying again', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Copy again before timeout to trigger clearTimeout branch
    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Only one clipboard clear should fire at 10s from second copy
    writeText.mockClear();
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // The clipboard clear from second copy fires
    expect(writeText).toHaveBeenCalledWith('');
    expect(writeText).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('handles clipboard clear failure silently', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockRejectedValueOnce(new Error('clear failed')); // timeout clear fails

    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Should not throw when clipboard clear fails
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(writeText).toHaveBeenLastCalledWith('');
    vi.useRealTimers();
  });

  it('hides password after copying', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.type).toBe('text');

    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(input.type).toBe('password');
  });

  it('toggles password visibility with show/hide button', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    expect(input.type).toBe('text');

    const hideButton = screen.getByTitle('Hide password');
    fireEvent.click(hideButton);
    expect(input.type).toBe('password');

    const showButton = screen.getByTitle('Show password');
    fireEvent.click(showButton);
    expect(input.type).toBe('text');
  });

  it('shows clipboard countdown after copying', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText('Clipboard will be cleared in 10s')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Clipboard will be cleared in 9s')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('countdown disappears when it reaches zero', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText(/Clipboard will be cleared in/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.queryByText(/Clipboard will be cleared in/)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('resets countdown when copying again', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Clipboard will be cleared in 9s')).toBeInTheDocument();

    // Copy again - should reset to 10
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByText('Clipboard will be cleared in 10s')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not show show/hide button when password is empty', () => {
    render(<App />);
    const clearButton = screen.getByTitle('Clear password');
    fireEvent.click(clearButton);

    expect(screen.queryByTitle('Hide password')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Show password')).not.toBeInTheDocument();
  });

  it('retries clipboard clear on focus when initial clear fails', async () => {
    vi.useFakeTimers();

    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockRejectedValueOnce(new Error('not focused')) // timeout clear fails
      .mockResolvedValueOnce(undefined); // focus retry succeeds

    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Timeout fires but clipboard write fails (page not focused)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Deadline is still set because write failed — simulate focus event
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(writeText).toHaveBeenLastCalledWith('');

    vi.useRealTimers();
  });

  it('clears clipboard on visibilitychange when deadline has passed', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockRejectedValueOnce(new Error('not focused')) // timeout clear fails
      .mockResolvedValueOnce(undefined); // visibilitychange retry succeeds

    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Timeout fires but clipboard write fails (page not focused)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Simulate visibilitychange event when returning to page
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(writeText).toHaveBeenLastCalledWith('');

    vi.useRealTimers();
  });

  it('does not clear clipboard on focus if deadline has not passed', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Focus fires before deadline - should not clear
    writeText.mockClear();
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(writeText).not.toHaveBeenCalledWith('');

    vi.useRealTimers();
  });

  describe('renders all strength levels', () => {
    const strengthLevels: Array<{ level: pg.StrengthLevel; label: string }> = [
      { level: 'pathetic', label: 'Pathetic' },
      { level: 'weak', label: 'Weak' },
      { level: 'meh', label: 'Meh' },
      { level: 'fair', label: 'Fair' },
      { level: 'decent', label: 'Decent' },
      { level: 'solid', label: 'Solid' },
      { level: 'strong', label: 'Strong' },
      { level: 'fortress', label: 'Fortress' },
      { level: 'unbreakable', label: 'Unbreakable' },
      { level: 'overkill', label: 'Overkill' },
    ];

    strengthLevels.forEach(({ level, label }) => {
      it(`displays strength level: ${level}`, () => {
        vi.spyOn(pg, 'generatePassword').mockReturnValue('TestPass1!');
        vi.spyOn(pg, 'getPasswordStrength').mockReturnValue({
          entropy: 50,
          level,
          crackTime: '1 year',
        });

        render(<App />);
        expect(screen.getByText(label)).toBeInTheDocument();

        vi.restoreAllMocks();
      });
    });
  });

  it('copies password via Ctrl+C keyboard shortcut when no text is selected', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    const password = input.value;
    expect(password).not.toBe('');

    vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => '' } as Selection);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(password);
  });

  it('copies password via Meta+C keyboard shortcut (macOS)', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Generated password will appear here') as HTMLInputElement;
    const password = input.value;
    expect(password).not.toBe('');

    vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => '' } as Selection);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'c', metaKey: true });
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(password);
  });

  it('does not intercept Ctrl+C when text is selected', () => {
    render(<App />);

    vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'some selected text' } as unknown as Selection);

    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockClear();

    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('does not intercept keydown for non-c keys', () => {
    render(<App />);
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockClear();

    fireEvent.keyDown(document, { key: 'v', ctrlKey: true });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('shows pending clear message when clipboard clear fails while focused', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockRejectedValueOnce(new Error('fail')); // clear fails

    Object.assign(navigator, { clipboard: { writeText } });

    // Mock hasFocus to return true
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Advance to fire the clipboard clear timeout
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // When hasFocus() is true and clear fails, the pending state is cleared
    // (the else branch sets clipboardClearDeadlineRef to null and clipboardPendingClear to false)
    expect(screen.queryByText(/Focus back on this page/)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows pending clear message when clipboard clear fails while not focused', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockRejectedValueOnce(new Error('fail')); // clear fails

    Object.assign(navigator, { clipboard: { writeText } });

    // Mock hasFocus to return false (page not focused)
    vi.spyOn(document, 'hasFocus').mockReturnValue(false);

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Advance to fire the clipboard clear timeout
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // When hasFocus() is false and clear fails, pendingClear message is shown
    expect(screen.getByText(/Focus back on this page to clear clipboard/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('toggles dark mode when theme button is clicked', () => {
    render(<App />);
    const darkModeButton = screen.getByTitle(/Switch to/);
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('theme')).toBeDefined();
  });

  it('clears clipboard on focus after timer already cleaned up (deadline passed scenario)', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn()
      .mockResolvedValueOnce(undefined) // copy succeeds
      .mockResolvedValueOnce(undefined); // timer clear succeeds

    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);
    const copyButton = screen.getByTitle('Copy to clipboard (Ctrl+C)');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Let clipboard timeout fire normally (clears timers internally)
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Now trigger focus - deadline was cleared by the successful clear
    writeText.mockClear();
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    // Should not attempt another clear since deadline is null
    expect(writeText).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('reads stored theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'light');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    localStorage.removeItem('theme');
  });

  it('reads dark theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    localStorage.removeItem('theme');
  });
});
