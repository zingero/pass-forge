import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, X, Check, Eye, EyeOff } from 'lucide-react';
import { generatePassword as generate, PasswordOptions } from './passwordGenerator';
import logoSvg from '/logo.svg';

const CLIPBOARD_CLEAR_DELAY_SEC = 30;

const optionEntries: { key: keyof PasswordOptions; label: string }[] = [
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'symbols', label: 'Symbols' },
  { key: 'avoidSimilar', label: 'Avoid Similar Characters (1, l, I, 0, O)' },
  { key: 'memorable', label: 'Memorable' },
];

function App() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [length, setLength] = useState(16);
  const [showPassword, setShowPassword] = useState(true);
  const [clipboardCountdown, setClipboardCountdown] = useState<number | null>(null);
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

  const generatePassword = useCallback(() => {
    try {
      setPassword(generate(length, options));
      setError(null);
    } catch (e) {
      setPassword('');
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
      setLength(prev => Math.min(Math.max(8, prev + delta), 32));
    };

    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const clearClipboard = useCallback(() => {
    navigator.clipboard.writeText('').catch(() => {
      // If clearing fails (e.g. page not focused), retry on next focus
      const onFocus = () => {
        navigator.clipboard.writeText('').catch(() => {});
        window.removeEventListener('focus', onFocus);
      };
      window.addEventListener('focus', onFocus);
    });
  }, []);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setShowPassword(false);
      setTimeout(() => setCopied(false), 2000);

      if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

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

      clipboardTimeoutRef.current = setTimeout(() => {
        clearClipboard();
      }, CLIPBOARD_CLEAR_DELAY_SEC * 1000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const clearPassword = () => {
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <img src={logoSvg} alt="PassForge logo" className="mx-auto h-16 w-16 drop-shadow-lg" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            <span className="text-emerald-400">Pass</span>Forge
          </h1>
          <p className="mt-2 text-gray-400">Forge strong passwords locally in your browser</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div className="flex items-center gap-2 bg-gray-700 p-3 rounded">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              readOnly
              aria-label="Generated password"
              className="flex-1 bg-transparent outline-none"
              placeholder="Generated password will appear here"
            />
            {password && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            )}
            {password && (
              <button
                onClick={clearPassword}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Clear password"
                aria-label="Clear password"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-600 rounded transition-colors"
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>

          {clipboardCountdown !== null && (
            <p className="text-xs text-gray-400">
              Clipboard will be cleared in {clipboardCountdown}s
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
                  min="8"
                  max="32"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {optionEntries.map(({ key, label }) => (
                <label key={key} className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                    after:start-[2px] after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:bg-emerald-500"></div>
                  <span className="ms-3 text-sm font-medium">
                    {label}
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

        <p className="text-center text-sm text-gray-400">
          All passwords are generated locally in your browser. No data is sent to any server.
        </p>
      </div>
    </div>
  );
}

export default App;