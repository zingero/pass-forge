import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Copy, X, Check, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { generatePassword as generate, getPasswordStrength, PasswordOptions, PasswordStrength, MIN_LENGTH, MAX_LENGTH } from './passwordGenerator';

const CLIPBOARD_CLEAR_DELAY_SEC = 10;

const optionEntries: { key: keyof PasswordOptions; label: string; labelNode?: ReactNode }[] = [
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'symbols', label: 'Symbols' },
  { key: 'avoidSimilar', label: 'Avoid Similar Characters (1, l, I, 0, O)', labelNode: <>Avoid Similar Characters (<code className="font-mono">1, l, I, 0, O</code>)</> },
  { key: 'memorable', label: 'Memorable' },
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch { /* localStorage unavailable */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [length, setLength] = useState(16);
  const [showPassword, setShowPassword] = useState(true);
  const [clipboardCountdown, setClipboardCountdown] = useState<number | null>(null);
  const [clipboardPendingClear, setClipboardPendingClear] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidSimilar: false,
    memorable: false
  });

  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const clipboardTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const clipboardClearDeadlineRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); } catch { /* localStorage unavailable */ }
  }, [darkMode]);

  const generatePassword = useCallback(() => {
    try {
      const newPassword = generate(length, options);
      setPassword(newPassword);
      setStrength(getPasswordStrength(newPassword, options));
      setError(null);
    } catch (e) {
      setPassword('');
      setStrength(null);
      setError((e as Error).message);
    }
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      setLength(prev => Math.min(Math.max(MIN_LENGTH, prev + delta), MAX_LENGTH));
    };

    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const clearClipboard = useCallback(() => {
    navigator.clipboard.writeText('').then(() => {
      clipboardClearDeadlineRef.current = null;
      setClipboardPendingClear(false);
    }).catch(() => {
      if (!document.hasFocus()) {
        setClipboardPendingClear(true);
      } else {
        clipboardClearDeadlineRef.current = null;
        setClipboardPendingClear(false);
      }
    });
  }, []);

  useEffect(() => {
    const tryClearIfExpired = () => {
      if (
        clipboardClearDeadlineRef.current !== null &&
        Date.now() >= clipboardClearDeadlineRef.current
      ) {
        clearClipboard();
        setClipboardCountdown(null);
        setClipboardPendingClear(false);
        if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    };
    // 'focus' fires when the page actually gains focus (required by Clipboard API)
    window.addEventListener('focus', tryClearIfExpired);
    document.addEventListener('visibilitychange', tryClearIfExpired);
    return () => {
      window.removeEventListener('focus', tryClearIfExpired);
      document.removeEventListener('visibilitychange', tryClearIfExpired);
    };
  }, [clearClipboard]);

  const copyToClipboard = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setShowPassword(false);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);

      if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      setClipboardPendingClear(false);
      setClipboardCountdown(CLIPBOARD_CLEAR_DELAY_SEC);
      countdownIntervalRef.current = setInterval(() => {
        setClipboardCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      clipboardClearDeadlineRef.current = Date.now() + CLIPBOARD_CLEAR_DELAY_SEC * 1000;
      clipboardTimeoutRef.current = setTimeout(() => {
        clearClipboard();
      }, CLIPBOARD_CLEAR_DELAY_SEC * 1000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }, [password, clearClipboard]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selection = window.getSelection()?.toString();
        if (!selection) {
          e.preventDefault();
          copyToClipboard();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [copyToClipboard]);

  const clearPassword = () => {
    setPassword('');
    setStrength(null);
    if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setClipboardCountdown(null);
    setClipboardPendingClear(false);
    clearClipboard();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center p-4">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
      </button>
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PassForge logo" className="mx-auto h-16 w-16 drop-shadow-lg" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">Pass</span>Forge
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Forge strong passwords locally in your browser</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              readOnly
              aria-label="Generated password"
              aria-describedby="password-strength"
              aria-live="polite"
              className="flex-1 bg-transparent outline-none font-mono text-gray-900 dark:text-white"
              placeholder="Generated password will appear here"
            />
            {password && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            )}
            {password && (
              <button
                onClick={clearPassword}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Clear password"
                aria-label="Clear password"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Copy to clipboard (Ctrl+C)"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>

          {clipboardCountdown !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Clipboard will be cleared in {clipboardCountdown}s
            </p>
          )}
          {clipboardCountdown === null && clipboardPendingClear && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Focus back on this page to clear clipboard
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm" role="alert">{error}</p>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="password-length" className="flex justify-between text-sm font-medium mb-2">
                <span>Password Length: {length}</span>
              </label>
              <div className="relative" ref={sliderContainerRef}>
                <input
                  id="password-length"
                  type="range"
                  min={MIN_LENGTH}
                  max={MAX_LENGTH}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

          {strength && password && (
            <div className="space-y-2" id="password-strength">
              <div className="text-sm font-medium">
                Strength:{' '}
                <span className={
                  strength.level === 'pathetic' ? 'text-red-500' :
                  strength.level === 'weak' ? 'text-red-400' :
                  strength.level === 'meh' ? 'text-orange-400' :
                  strength.level === 'fair' ? 'text-amber-400' :
                  strength.level === 'decent' ? 'text-yellow-300' :
                  strength.level === 'solid' ? 'text-lime-400' :
                  strength.level === 'strong' ? 'text-emerald-400' :
                  strength.level === 'fortress' ? 'text-cyan-400' :
                  strength.level === 'unbreakable' ? 'text-blue-400' :
                  'text-purple-400'
                }>
                  {{
                    pathetic: 'Pathetic',
                    weak: 'Weak',
                    meh: 'Meh',
                    fair: 'Fair',
                    decent: 'Decent',
                    solid: 'Solid',
                    strong: 'Strong',
                    fortress: 'Fortress',
                    unbreakable: 'Unbreakable',
                    overkill: 'Overkill',
                  }[strength.level]}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(Math.round(strength.entropy), 200)} aria-valuemin={0} aria-valuemax={200} aria-label={`Password strength: ${strength.level}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength.level === 'pathetic' ? 'bg-red-500 w-[10%]' :
                    strength.level === 'weak' ? 'bg-red-400 w-[20%]' :
                    strength.level === 'meh' ? 'bg-orange-400 w-[30%]' :
                    strength.level === 'fair' ? 'bg-amber-400 w-[40%]' :
                    strength.level === 'decent' ? 'bg-yellow-300 w-[50%]' :
                    strength.level === 'solid' ? 'bg-lime-400 w-[60%]' :
                    strength.level === 'strong' ? 'bg-emerald-500 w-[70%]' :
                    strength.level === 'fortress' ? 'bg-cyan-400 w-[80%]' :
                    strength.level === 'unbreakable' ? 'bg-blue-400 w-[90%]' :
                    'bg-purple-400 w-full'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimated crack time: <span className="text-gray-700 dark:text-gray-300">{strength.crackTime}</span>
              </p>
            </div>
          )}

            <div className="grid grid-cols-1 gap-4">
              {optionEntries.map(({ key, label, labelNode }) => (
                <label key={key} className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                    className="sr-only peer"
                    aria-label={label}
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                    after:start-[2px] after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:bg-emerald-500"></div>
                  <span className="ms-3 text-sm font-medium">
                    {labelNode || label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Generate New Password
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          All passwords are generated locally in your browser. No data is sent to any server.
        </p>

        <p className="text-center text-xs text-gray-400/70 mt-2">
          This site was vibecoded — no humans were harmed (or involved) in the making of this code. If anything breaks, blame the AI. The author takes absolutely zero responsibility and was probably napping at the time.
        </p>
      </div>
    </div>
  );
}

export default App;