import React, { useState, useEffect, useCallback } from 'react';
import { Copy, X } from 'lucide-react';
import { generatePassword as generate, PasswordOptions } from './passwordGenerator';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidSimilar: false,
    memorable: false
  });

  const generatePassword = useCallback(() => {
    setPassword(generate(length, options));
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (password && password !== 'Please select at least one option') {
      await navigator.clipboard.writeText(password);
    }
  };

  const clearPassword = () => {
    setPassword('');
  };

  const getOptionLabel = (key: string) => {
    switch (key) {
      case 'avoidSimilar':
        return 'Avoid Similar Characters (1, l, I, 0, O)';
      case 'memorable':
        return 'Generate Memorable Password';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Prevent page scrolling
    const delta = e.deltaY > 0 ? -1 : 1; // Reverse the direction for more intuitive scrolling
    const newLength = Math.min(Math.max(8, length + delta), 32);
    setLength(newLength);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/logo.svg" alt="PassForge logo" className="mx-auto h-16 w-16 drop-shadow-lg" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            <span className="text-emerald-400">Pass</span>Forge
          </h1>
          <p className="mt-2 text-gray-400">Forge strong passwords locally in your browser</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div className="flex items-center gap-2 bg-gray-700 p-3 rounded">
            <input
              type="text"
              value={password}
              readOnly
              className="flex-1 bg-transparent outline-none"
              placeholder="Generated password will appear here"
            />
            {password && (
              <button
                onClick={clearPassword}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Clear password"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-600 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-medium mb-2">
                <span>Password Length: {length}</span>
              </label>
              <div 
                className="relative" 
                onWheel={handleWheel}
              >
                <input
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
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
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
                    {getOptionLabel(key)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
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